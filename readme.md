user:

    info personnel
        modifier nom

        mettre a jour mdp



        photo profil

    mon panier

    mes commandes

    mes ventes


chat:

    users

        photo profil + nom 

    chat

        info si message vu 

        pop up pour voir si message a lire


fil product:

    produit:
        photo
        
        prix

        description

        action:
            voir detail -> clique sur la card

            like

            ajoute au panier

    limite a 20 produit part page 

    systeme switch page 1 - 2 - 3 ...



    filtre:
        recherche

        range de prix

        les plus like

        best seller

        categorie


nav bar

    logo

    bar de recherche    ->  passe en icon loop quand sur mobil et ouvre un side bar qui prend tt l'ecran.

    besoin d'aide 

    mon compte 

    mon panier  -> s'ouvre en side bar



$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = 10;
$offset = ($page - 1) * $perPage;

$sql = "SELECT p.*, AVG(r.rating) AS avg_rating
        FROM `products` p
        LEFT JOIN liked_produit l ON p.id_produit = l.id_produit_like
        LEFT JOIN reviews_produit r ON p.id_produit = r.id_produit
        GROUP BY p.id_produit
        LIMIT $perPage OFFSET $offset";


<div class="pagination">
    <a href="?page=<?= $page - 1 ?>" class="btn btn-light <?= $page == 1 ? 'disabled' : '' ?>">Précédent</a>
    <a href="?page=<?= $page + 1 ?>" class="btn btn-light">Suivant</a>
</div>



Gestion des utilisateurs

a) Inscription/Connexion des utilisateurs : 
-- Permettre aux utilisateurs de créer un compte et de se connecter.
-- Profils utilisateurs : Chaque utilisateur aura un profil avec ses informations (nom, adresse, historique des achats, etc.).
-- Gestion des rôles : Les utilisateurs peuvent être des acheteurs, des vendeurs, ou des administrateurs avec des permissions différentes.


b) Gestion des produits
-- Création de produits : Les vendeurs pourront ajouter leurs produits avec des descriptions, des images, des prix, etc.
-- Catalogue de produits : Affichage des produits avec filtres (par catégorie, prix, vendeur, etc.).
-- Gestion des stocks : Les vendeurs doivent pouvoir gérer leur inventaire (quantité disponible pour chaque produit).


c) Panier et gestion des commandes
-- Ajout au panier : Les acheteurs ajoutent des produits au panier.
-- Gestion des commandes : Après avoir passé commande, le système doit gérer l'état de la commande (en attente, expédiée, livrée, annulée).
-- Historique des commandes : Les utilisateurs peuvent consulter leurs précédentes commandes.

e) Gestion des avis et évaluations
Les utilisateurs peuvent laisser des avis et des évaluations sur les produits et les vendeurs.
Système de gestion des disputes en cas de problèmes avec les produits ou commandes.


f) Messagerie interne
Les acheteurs et les vendeurs peuvent communiquer via un système de messagerie interne à propos des produits ou des commandes.