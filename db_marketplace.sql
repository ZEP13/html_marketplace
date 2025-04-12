-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 12 avr. 2025 à 21:49
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `db_marketplace`
--

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id` int(11) NOT NULL,
  `category_name` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categorie`
--

INSERT INTO `categorie` (`id`, `category_name`) VALUES
(1, 'Enfant'),
(2, 'Sport'),
(3, 'PC-Gaming');

-- --------------------------------------------------------

--
-- Structure de la table `commande`
--

CREATE TABLE `commande` (
  `id_commande` int(11) NOT NULL,
  `id_user_commande` int(200) NOT NULL,
  `id_produit_commande` int(200) NOT NULL,
  `statut` enum('Envoye','Annule','En attente') NOT NULL DEFAULT 'En attente',
  `date_commande` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commande`
--

INSERT INTO `commande` (`id_commande`, `id_user_commande`, `id_produit_commande`, `statut`, `date_commande`) VALUES
(1, 4, 1, '', '2025-03-26 08:34:25');

-- --------------------------------------------------------

--
-- Structure de la table `liked_produit`
--

CREATE TABLE `liked_produit` (
  `id_like` int(11) NOT NULL,
  `id_user_like` int(200) NOT NULL,
  `id_produit_like` int(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`, `is_read`) VALUES
(2, 1, 3, 'blabla', '2025-01-27 12:17:17', 1),
(3, 1, 4, 'lol\r\n', '2025-01-27 12:17:39', 0),
(4, 3, 1, 'blabla pas encore vu\r\n', '2025-01-27 12:27:35', 1),
(5, 1, 3, 'pas vu\r\n', '2025-01-27 12:35:47', 1),
(6, 3, 1, 'la', '2025-01-27 12:37:08', 1),
(7, 4, 3, 'pas lu c sur', '2025-01-27 12:47:07', 1),
(8, 3, 2, 'salut mec\r\nca va', '2025-01-27 13:22:11', 0),
(9, 3, 1, 'palala', '2025-01-27 13:38:57', 0),
(10, 3, 1, 'lalala\r\n', '2025-01-27 13:48:59', 0),
(11, 3, 1, 'plolzldz', '2025-01-27 13:49:04', 0),
(12, 3, 1, 'mama', '2025-01-27 13:51:54', 0),
(13, 2, 4, 'lol', '2025-01-27 14:06:57', 0),
(14, 3, 4, 'maa', '2025-01-27 14:07:23', 0),
(15, 3, 1, 'lalla', '2025-01-27 14:07:27', 0),
(16, 3, 1, 'mamama', '2025-01-27 14:07:32', 0),
(17, 3, 1, 'olalal', '2025-01-27 14:07:41', 0),
(18, 3, 1, 'yaaaaaaaaaaaa', '2025-01-27 14:08:05', 0),
(19, 4, 1, 'ooo', '2025-01-27 14:09:45', 0),
(20, 3, 1, 'olala', '2025-01-27 14:10:23', 0),
(21, 4, 1, 'qsvdsdv', '2025-04-07 08:52:16', 0),
(22, 4, 3, 'cacazca', '2025-04-07 08:54:04', 0),
(23, 4, 3, 'zdvazvzv', '2025-04-07 08:56:00', 0),
(24, 4, 1, 'azcacza', '2025-04-07 09:03:26', 0),
(25, 4, 1, 'bonjour on est le 07/04', '2025-04-07 09:04:44', 0),
(26, 4, 1, 'dada', '2025-04-07 09:05:39', 0),
(27, 4, 1, 'lala', '2025-04-07 09:06:10', 0),
(28, 4, 1, 'yo', '2025-04-11 07:38:33', 0),
(29, 4, 2, 'bien vu mec', '2025-04-11 07:42:56', 0),
(30, 4, 1, 'vzzez', '2025-04-11 07:44:37', 0),
(31, 4, 2, 'vd7', '2025-04-11 07:45:25', 0),
(32, 4, 3, 'zvzvz', '2025-04-11 07:45:30', 0),
(33, 4, 1, 'sdvzevz', '2025-04-11 07:45:34', 0),
(34, 4, 2, 'vcazvz', '2025-04-11 07:47:57', 0),
(35, 4, 3, 'zvzvz', '2025-04-11 07:48:02', 0),
(36, 4, 1, 'aczvz', '2025-04-11 07:48:06', 0),
(37, 4, 2, 'aveava', '2025-04-11 07:48:11', 0),
(38, 4, 3, 'dvdzvev', '2025-04-11 07:48:43', 0),
(39, 4, 2, 'vzvz', '2025-04-11 07:48:48', 0),
(40, 4, 3, '15656', '2025-04-11 07:48:55', 0),
(41, 4, 3, 'sasa', '2025-04-11 07:49:06', 0),
(42, 4, 1, 'acazva$', '2025-04-11 08:12:58', 0),
(43, 3, 4, 'la', '2025-04-11 08:40:55', 0),
(44, 3, 4, 'ca va aujourduih zep', '2025-04-11 08:43:32', 0),
(45, 4, 5, 'yo', '2025-04-11 09:29:37', 0),
(46, 1, 3, 'lol bien vu mec', '2025-04-11 19:56:03', 0);

-- --------------------------------------------------------

--
-- Structure de la table `panier`
--

CREATE TABLE `panier` (
  `id_panier` int(6) NOT NULL,
  `id_user` int(6) NOT NULL,
  `id_produit` int(6) NOT NULL,
  `quantite_panier` int(100) NOT NULL,
  `achete` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `panier`
--

INSERT INTO `panier` (`id_panier`, `id_user`, `id_produit`, `quantite_panier`, `achete`) VALUES
(2, 2, 4, 3, 0),
(6, 5, 4, 1, 0),
(7, 5, 3, 3, 0),
(14, 4, 8, 5, 0),
(15, 4, 10, 4, 0),
(16, 4, 9, 2, 0),
(17, 4, 2, 1, 0),
(41, 4, 1, 1, 0),
(42, 4, 15, 1, 0),
(43, 4, 3, 2, 0),
(44, 4, 20, 1, 0);

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id_produit` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantite` int(200) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `actif` int(2) NOT NULL DEFAULT 1,
  `valide` int(1) NOT NULL DEFAULT 0,
  `refuse` int(1) NOT NULL DEFAULT 0,
  `comm_refu` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id_produit`, `user_id`, `title`, `description`, `price`, `quantite`, `image`, `category`, `created_at`, `actif`, `valide`, `refuse`, `comm_refu`) VALUES
(1, 4, 'gundam', 'maket de 200 pieces', 50.00, 3, '../img/imgProduct/produit1.png', '1', '2025-01-27 15:12:03', 0, 0, 0, ''),
(3, 4, 'souris', 'souris gaming extra light', 12.00, 6, '../img/imgProduct/produit2.png', '2', '2025-02-27 17:52:00', 1, 1, 0, ''),
(4, 1, 'Cookbook', 'Livre de cuisine gastro par le grand chef Clarisse', 37.52, 50, NULL, '1', '2025-03-02 08:46:45', 1, 0, 0, ''),
(5, 3, 'Gourde inox', 'Gourde en inox de 1.5L parfaite pour la rando ou toutes activités en pleine aire', 11.50, 50, NULL, '3', '2025-03-02 09:12:11', 1, 0, 0, ''),
(13, 5, 'banane', 'banane de course', 13.50, 1, '', '1', '2025-03-05 13:27:55', 1, 0, 0, ''),
(15, 5, 'Tour gaming', '4080 ca va chier et fam tt c noob', 1450.00, 5, '', '3', '2025-03-06 16:16:54', 1, 1, 0, ''),
(16, 5, 'banane', 'utkjdetykt', 123.00, 0, '', '1', '2025-03-06 16:23:19', 0, 0, 1, '123$ la bananes ?'),
(17, 4, 'Tour gaming', 'Super set up pour des soiree gamin entre pote avec la nouvelle 4080 et t pas le seul a la vouloir donc ne trainne pas', 1200.78, 25, '', '3', '2025-03-06 16:43:55', 1, 1, 0, ''),
(18, 4, 'Carte clash royal', 'Superrrrr carte pour des 1v1 de fou', 8.75, 15, '../img/imgProduct/174341768767ea71575c8cf6.07080686.jpg', '1', '2025-03-31 10:41:27', 1, 0, 1, ''),
(19, 4, 'Akali', 'Poster akali pour les fan de lol', 13.50, 2, '../img/imgProduct/174341776167ea71a1b02cb4.28488877.jpg', '3', '2025-03-31 10:42:41', 1, 0, 0, ''),
(20, 5, 'produit test1', 'fvaefveabe', 1450.00, 1, NULL, '2', '2025-04-11 09:25:05', 1, 1, 0, '');

-- --------------------------------------------------------

--
-- Structure de la table `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `nom_promo` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `reduction_value` decimal(10,2) DEFAULT NULL,
  `type_reduction` enum('pourcentage','montant','livraison gratuite') DEFAULT NULL,
  `montant_max` decimal(10,2) DEFAULT NULL,
  `condition_min` decimal(10,2) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 0,
  `validé_par_admin` tinyint(1) DEFAULT 0,
  `vendeur_id` int(11) DEFAULT NULL,
  `est_globale` tinyint(1) DEFAULT 0,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nbreUtilisationCode` int(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `promotions`
--

INSERT INTO `promotions` (`id`, `code`, `nom_promo`, `description`, `date_debut`, `date_fin`, `reduction_value`, `type_reduction`, `montant_max`, `condition_min`, `actif`, `validé_par_admin`, `vendeur_id`, `est_globale`, `date_creation`, `date_modification`, `nbreUtilisationCode`) VALUES
(1, 'HELLOW', 'promo bienvenu', 'zebvzbezrfbeqrbe', '2025-04-21', '2025-04-25', 10.00, 'pourcentage', 50.00, 100.00, 0, 0, NULL, 0, '2025-04-12 19:45:50', '2025-04-12 19:45:50', 0),
(2, 'VEND10', '10% chez Vendeur 1', 'Réduction de 10% sur tous les produits du vendeur 1', '2025-04-15', '2025-05-15', 10.00, 'pourcentage', 30.00, 100.00, 0, 0, 1, 0, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(3, 'SPRING20', '20€ dès 150€', 'Réduction de 20€ pour les achats de plus de 150€', '2025-04-01', '2025-04-30', 20.00, 'montant', NULL, 150.00, 1, 1, 2, 0, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(4, 'GLOBAL15', '15€ sur toute la marketplace', 'Offre globale pour tout le monde', '2025-04-10', '2025-04-25', 15.00, 'montant', NULL, 50.00, 1, 1, NULL, 1, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(5, 'VEND5', '5€ de réduction', 'Petite réduc chez le vendeur 3', '2025-05-01', '2025-06-01', 5.00, 'montant', NULL, 30.00, 0, 0, 3, 0, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(6, 'BLACKFRIDAY', 'Promo Black Friday', 'Offre spéciale expirée', '2024-11-20', '2024-11-30', 30.00, 'montant', 50.00, 200.00, 0, 1, NULL, 1, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(7, 'FREEDELIV123', 'Livraison Gratuite', 'Livraison offerte par le vendeur 2', '2025-04-10', '2025-05-10', 0.00, 'livraison gratuite', NULL, 0.00, 1, 1, 2, 0, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(8, 'VEND30', '30% à partir du 1er mai', 'Promo pour préparer les soldes', '2025-05-01', '2025-05-10', 30.00, 'pourcentage', 100.00, 50.00, 0, 1, 1, 0, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(9, 'BIGSAVE', 'Gros panier = grosse réduction', '20% sur les paniers > 500€', '2025-04-10', '2025-04-30', 20.00, 'pourcentage', 150.00, 500.00, 1, 1, NULL, 1, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(10, 'VENDPROMO', 'Promo flash vendeur 4', 'Offre limitée à ses produits', '2025-04-10', '2025-04-15', 8.00, 'montant', NULL, 0.00, 1, 1, 4, 0, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 0),
(11, 'SUPERCODE2025', 'Super code 2025', 'Utilisable sur toute la marketplace', '2025-04-01', '2025-12-31', 25.00, 'montant', NULL, 0.00, 1, 1, NULL, 1, '2025-04-12 19:47:18', '2025-04-12 19:47:18', 100);

-- --------------------------------------------------------

--
-- Structure de la table `reviews_produit`
--

CREATE TABLE `reviews_produit` (
  `id_review` int(11) NOT NULL,
  `id_user` int(200) NOT NULL,
  `id_produit` int(200) NOT NULL,
  `rating` int(200) NOT NULL,
  `commentaire` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reviews_produit`
--

INSERT INTO `reviews_produit` (`id_review`, `id_user`, `id_produit`, `rating`, `commentaire`) VALUES
(2, 3, 1, 5, 'meilleur kit de tt les temps'),
(3, 4, 1, 2, 'Bof Bof je m\'attendais a un effet plus mat');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `user_prenom` varchar(50) NOT NULL,
  `user_nom` varchar(100) NOT NULL,
  `user_mail` varchar(100) NOT NULL,
  `user_phone` int(100) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_img` varchar(200) NOT NULL DEFAULT '../img/imgUserProfil/defaultPP.png',
  `rue` text NOT NULL,
  `codePostal` int(4) NOT NULL,
  `numMaison` varchar(15) NOT NULL,
  `city` text NOT NULL,
  `role` enum('Acheteur','Vendeur','Admin') NOT NULL DEFAULT 'Acheteur',
  `chat_ban` tinyint(1) DEFAULT 0,
  `is_banned` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `user_prenom`, `user_nom`, `user_mail`, `user_phone`, `user_password`, `user_img`, `rue`, `codePostal`, `numMaison`, `city`, `role`, `chat_ban`, `is_banned`) VALUES
(1, 'Zéphyr', 'Lathuy', 'zephyr.lathuy.zpl@gmail.com', 478365547, '$2y$10$bmT73TfJSAiqSqfRpqQqAO95QBMEWFJ9/8qjmtgxnYScxDaQosJP2', '', '', 0, '', '', 'Admin', 0, 0),
(2, 'jean', 'jean', 'jean@gmail.com', 248799278, 'User123//', '', '', 0, '', '', 'Acheteur', 0, 0),
(3, 'paul', 'jean', 'jeanp@gmail.com', 478365547, '$2y$10$LFBtZHRnASgOs1y/4/RWEu0YT6SCy049YLYwYvkGM.PIqt11Rp71K', '', '', 0, '', '', 'Acheteur', 0, 0),
(4, 'ZEP', 'LA', 'user@gmail.com', 0, '$2y$10$DQ0TytWluMJOKObiq.f5s.o0.w1pFFcRh9dyU1P4vaSJKZpPjiRpq', '../img/imgUserProfil/defaultPP.png174291696567e2cd655cd3e5.20326807.jpg', 'Rue du Tombois', 22, '5650', 'pry', 'Vendeur', 1, 0),
(5, 'Zép', 'Lathuy', 'user123@gmail.com', 0, '$2y$10$4y3LmoZnD1031fGUjCr66.YCBldcj/SjcC1fBYU.1OOHwsRSljXFu', '', '', 0, '', '', 'Acheteur', 0, 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `commande`
--
ALTER TABLE `commande`
  ADD PRIMARY KEY (`id_commande`);

--
-- Index pour la table `liked_produit`
--
ALTER TABLE `liked_produit`
  ADD PRIMARY KEY (`id_like`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Index pour la table `panier`
--
ALTER TABLE `panier`
  ADD PRIMARY KEY (`id_panier`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id_produit`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `vendeur_id` (`vendeur_id`);

--
-- Index pour la table `reviews_produit`
--
ALTER TABLE `reviews_produit`
  ADD PRIMARY KEY (`id_review`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`user_mail`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `commande`
--
ALTER TABLE `commande`
  MODIFY `id_commande` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `liked_produit`
--
ALTER TABLE `liked_produit`
  MODIFY `id_like` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT pour la table `panier`
--
ALTER TABLE `panier`
  MODIFY `id_panier` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id_produit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `reviews_produit`
--
ALTER TABLE `reviews_produit`
  MODIFY `id_review` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id_user`);

--
-- Contraintes pour la table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`);

--
-- Contraintes pour la table `promotions`
--
ALTER TABLE `promotions`
  ADD CONSTRAINT `promotions_ibfk_1` FOREIGN KEY (`vendeur_id`) REFERENCES `users` (`id_user`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
