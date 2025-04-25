try:
    import mysql.connector
    from mysql.connector import Error
    import pandas as pd
    from sklearn.metrics.pairwise import cosine_similarity
    import logging
    import sys
    print("Tous les modules sont correctement importés")
except ImportError as e:
    print(f"Erreur d'import: {e}")
    print(f"Chemin Python: {sys.path}")
    sys.exit(1)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('recommandation.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

# Données de test pour visualiser le fonctionnement
TEST_DATA = {
    'interactions': [
        # user_id, product_id, interaction_type (1=achat/like, 0.1-1.0=review)
        (1, 1, 1.0),     # User 1 a acheté/liké le produit 1
        (1, 2, 0.8),     # User 1 a donné 4/5 étoiles au produit 2
        (1, 3, 1.0),     # User 1 a acheté/liké le produit 3
        
        (2, 1, 0.6),     # User 2 a donné 3/5 étoiles au produit 1
        (2, 2, 1.0),     # User 2 a acheté/liké le produit 2
        (2, 4, 1.0),     # User 2 a acheté/liké le produit 4
        
        (3, 2, 0.8),     # User 3 a donné 4/5 étoiles au produit 2
        (3, 3, 1.0),     # User 3 a acheté/liké le produit 3
        (3, 4, 0.9),     # User 3 a donné 4.5/5 étoiles au produit 4
        
        (4, 1, 1.0),     # User 4 a acheté/liké le produit 1
        (4, 3, 0.7),     # User 4 a donné 3.5/5 étoiles au produit 3
        (4, 4, 1.0),     # User 4 a acheté/liké le produit 4
    ]
}

def connect_to_db():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="db_marketplace"
        )
        if connection.is_connected():
            logging.info("Connexion BD réussie")
            return connection
    except Error as e:
        logging.error(f"Erreur de connexion à la BD: {e}")
        return None

def get_user_interactions():
    conn = connect_to_db()
    if not conn:
        return pd.DataFrame()  # Retourne un DataFrame vide en cas d'erreur
    
    try:
        cursor = conn.cursor()
        query = """
        SELECT id_user, id_produit, 1 as interaction FROM panier WHERE achete = 1
        UNION ALL 
        SELECT id_user_like, id_produit_like, 1 FROM liked_produit
        UNION ALL
        SELECT id_user, id_produit, rating/5.0 FROM reviews_produit
        """
        cursor.execute(query)
        interactions = cursor.fetchall()
        
        if not interactions:
            logging.warning("Aucune interaction trouvée")
            return pd.DataFrame()
            
        df = pd.DataFrame(interactions, columns=['user_id', 'product_id', 'interaction'])
        logging.info(f"Récupération de {len(df)} interactions")
        return df
        
    except Error as e:
        logging.error(f"Erreur lors de la récupération des interactions: {e}")
        return pd.DataFrame()
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def generate_recommendations():
    try:
        df = get_user_interactions()
        if df.empty:
            logging.error("Impossible de générer des recommandations: pas de données")
            return
            
        # Vérifier le nombre minimum d'interactions
        if len(df) < 2:
            logging.warning("Pas assez d'interactions pour générer des recommandations")
            return
            
        # Normaliser et pondérer les interactions
        df['weighted_interaction'] = df['interaction'].apply(lambda x: 
            min(max(float(x), 0.0), 1.0))  # Assure que les valeurs sont entre 0 et 1
        
        # Créer la matrice utilisateur-produit
        try:
            user_product_matrix = df.pivot_table(
                index='user_id',
                columns='product_id',
                values='weighted_interaction',
                fill_value=0
            )
        except Exception as e:
            logging.error(f"Erreur lors de la création de la matrice: {e}")
            return
            
        # Vérifier la taille de la matrice
        if user_product_matrix.shape[0] < 2 or user_product_matrix.shape[1] < 2:
            logging.warning("Matrice trop petite pour générer des recommandations")
            return
            
        # Calculer la similarité entre utilisateurs
        user_similarity = cosine_similarity(user_product_matrix)
        user_similarity_df = pd.DataFrame(
            user_similarity,
            index=user_product_matrix.index,
            columns=user_product_matrix.index
        )
        
        # Générer des recommandations
        recommendations = {}
        for user_id in user_product_matrix.index:
            similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:4]
            user_products = set(user_product_matrix.columns[user_product_matrix.loc[user_id] > 0])
            
            recommended_products = set()
            for similar_user_id in similar_users.index:
                similar_user_products = set(user_product_matrix.columns[
                    user_product_matrix.loc[similar_user_id] > 0
                ])
                recommended_products.update(similar_user_products - user_products)
            
            recommendations[user_id] = list(recommended_products)[:5]
        
        # Sauvegarder les recommandations dans la base de données
        save_recommendations(recommendations)
        
    except Exception as e:
        logging.error(f"Erreur inattendue: {e}")

def save_recommendations(recommendations):
    conn = connect_to_db()
    if not conn:
        logging.error("Impossible de sauvegarder les recommandations: pas de connexion BD")
        return
    
    try:
        cursor = conn.cursor()
        
        # Créer la table si elle n'existe pas
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_recommendations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            product_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id_user),
            FOREIGN KEY (product_id) REFERENCES products(id_produit)
        )
        """)
        
        # Vider les anciennes recommandations
        cursor.execute("DELETE FROM user_recommendations")
        
        # Insérer les nouvelles recommandations
        for user_id, products in recommendations.items():
            for product_id in products:
                cursor.execute("""
                INSERT INTO user_recommendations (user_id, product_id)
                VALUES (%s, %s)
                """, (user_id, product_id))
        
        conn.commit()
        logging.info("Recommandations sauvegardées avec succès")
        
    except Error as e:
        logging.error(f"Erreur lors de la sauvegarde des recommandations: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def test_recommendations():
    # Créer un DataFrame à partir des données de test
    df = pd.DataFrame(TEST_DATA['interactions'], 
                     columns=['user_id', 'product_id', 'interaction'])
    
    print("Matrice utilisateur-produit initiale:")
    print(df.pivot_table(
        index='user_id',
        columns='product_id',
        values='interaction',
        fill_value=0
    ))
    print("\nGénération des recommandations...")
    
    # Appeler generate_recommendations avec nos données de test
    generate_recommendations()

if __name__ == "__main__":
    logging.info("Démarrage du système de recommandation")
    generate_recommendations()
    logging.info("Fin du processus de recommandation")
