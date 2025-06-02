🛒 HTML Marketplace
📌 Description du projet
HTML Marketplace est une plateforme e-commerce full-stack développée en PHP (architecture MVC), MySQL, JavaScript (Fetch API), HTML5 et CSS3. Elle offre une expérience utilisateur complète, incluant la consultation de produits, l'ajout au panier, la gestion des commandes, le paiement, ainsi que des fonctionnalités sociales telles que les avis, la notation et le chat en ligne.

⚙️ Architecture technique
🔧 Technologies utilisées
Frontend :

HTML5 / CSS3 (responsive design)

JavaScript (ES6+) avec Fetch API pour les interactions asynchrones

Backend :

PHP en architecture MVC (Model-View-Controller)

PDO pour la gestion sécurisée de la base de données MySQL

Base de données :

MySQL

Autres :

Système de routing via .htaccess

Sessions PHP pour la gestion des utilisateurs

Validation côté serveur et client

🧩 Fonctionnalités principales

🛍️ Catalogue de produits
Affichage des produits avec photo, prix, description.

Mise en avant de promotions dynamiques (prix barré, remise affichée).

Recherche et filtres disponibles pour affiner la sélection.

⭐ Interactions utilisateur
Système de notation : évaluation des produits de 1 à 5 étoiles.

Avis / Reviews : commentaires laissés par les utilisateurs sur les produits.

Like : possibilité de liker des produits pour les ajouter à une liste de favoris.

Ajout au panier : gestion dynamique des produits ajoutés au panier.

🛒 Panier et commande
Panier persistant (stocké en session ou en base de données).

Possibilité de modifier les quantités ou de supprimer des articles.

Page de résumé de commande avec détails des produits, quantités et prix.

Validation de commande avec génération d'un numéro de commande unique.

Paiement (simulation) : confirmation de commande et génération d'un reçu.

💬 Chat en ligne
Système de chat intégré permettant aux utilisateurs de communiquer entre eux ou avec le support.

Rafraîchissement dynamique des messages via Fetch API sans rechargement de la page.

Historique des messages conservé en base de données pour consultation ultérieure.

👥 Gestion des utilisateurs
Inscription et connexion sécurisées avec gestion des sessions PHP.

Rôles utilisateurs : utilisateur standard, administrateur.

Interface utilisateur permettant de consulter l'historique des commandes, de modifier le profil, etc.

🛠️ Back-office administrateur
Gestion des produits (ajout, modification, suppression).

Gestion des promotions et des remises.

Modération des avis utilisateurs.

Suivi des commandes et des paiements.

📡 Fonctionnement dynamique (JS + Fetch API)
L'utilisation de la Fetch API permet :

L'envoi et la réception de messages du chat sans rechargement de la page.

L'ajout d'avis et de notes sur les produits en temps réel.

La gestion dynamique du panier (ajout, suppression, modification des quantités).

La mise à jour des informations de commande sans rechargement de la page.

🗃️ Base de données (MySQL)
Tables principales :
users : gestion des comptes utilisateurs (id, nom, email, mot de passe, rôle)

products : catalogue des produits (id, nom, description, prix, image, stock)

reviews : avis des utilisateurs sur les produits (id, id_produit, id_utilisateur, note, commentaire)

likes : produits likés par les utilisateurs (id, id_produit, id_utilisateur)

cart_items : articles ajoutés au panier (id, id_produit, id_utilisateur, quantité)

orders : commandes passées (id, id_utilisateur, date, statut, total)

order_items : détails des commandes (id, id_commande, id_produit, quantité, prix_unitaire)

messages : messages du chat (id, id_utilisateur_envoyeur, id_utilisateur_destinataire, contenu, date)

Un fichier .sql est fourni pour initialiser la base de données.

🚀 Lancer le projet en local
Cloner le dépôt :

bash

git clone https://github.com/ZEP13/html_marketplace.git

Importer le fichier db_marketplace.sql dans votre base de données MySQL.

Configurer la connexion à la base de données dans config/database.php.

Lancer un serveur local (Apache via XAMPP, MAMP, WAMP ou autre).

Accéder au site via http://localhost/html_marketplace/public.

📌 Améliorations futures
Intégration d'un système de paiement réel (par exemple, Stripe ou PayPal).

Notifications en temps réel via WebSockets pour le chat et les mises à jour de commande.

Correction du système de mail pour l'ensemble du projet

Interface utilisateur améliorée avec un design plus moderne et responsive.
