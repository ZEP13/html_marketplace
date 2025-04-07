-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 07 avr. 2025 à 09:44
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
  `statut` varchar(200) NOT NULL,
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
(20, 3, 1, 'olala', '2025-01-27 14:10:23', 0);

-- --------------------------------------------------------

--
-- Structure de la table `panier`
--

CREATE TABLE `panier` (
  `id_panier` int(6) NOT NULL,
  `id_user` int(6) NOT NULL,
  `id_produit` int(6) NOT NULL,
  `quantite_panier` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `panier`
--

INSERT INTO `panier` (`id_panier`, `id_user`, `id_produit`, `quantite_panier`) VALUES
(2, 2, 4, 3),
(6, 5, 4, 1),
(7, 5, 3, 3),
(8, 4, 5, 1),
(9, 4, 3, 1),
(10, 4, 1, 2),
(13, 4, 17, 1);

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
  `actif` int(2) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id_produit`, `user_id`, `title`, `description`, `price`, `quantite`, `image`, `category`, `created_at`, `actif`) VALUES
(1, 4, 'gundam', 'maket de 200 pieces', 50.00, 1, '../img/imgProduct/produit1.png', '1', '2025-01-27 15:12:03', 1),
(3, 4, 'souris', 'souris gaming extra light', 12.00, 6, '../img/imgProduct/produit2.png', '2', '2025-02-27 17:52:00', 1),
(4, 1, 'Cookbook', 'Livre de cuisine gastro par le grand chef Clarisse', 37.52, 50, NULL, '2', '2025-03-02 08:46:45', 1),
(5, 3, 'Gourde inox', 'Gourde en inox de 1.5L parfaite pour la rando ou toutes activités en pleine aire', 11.50, 50, NULL, '3', '2025-03-02 09:12:11', 1),
(13, 5, 'banane', 'banane de course', 13.50, 1, '', '1', '2025-03-05 13:27:55', 1),
(15, 5, 'Tour gaming', '4080 ca va chier et fam tt c noob', 1450.00, 5, '', '3', '2025-03-06 16:16:54', 1),
(16, 5, 'banane', 'utkjdetykt', 123.00, 0, '', '1', '2025-03-06 16:23:19', 0),
(17, 4, 'Tour gaming', 'Super set up pour des soiree gamin entre pote avec la nouvelle 4080 et t pas le seul a la vouloir donc ne trainne pas', 1200.78, 25, '', '3', '2025-03-06 16:43:55', 1),
(18, 4, 'Carte clash royal', 'Superrrrr carte pour des 1v1 de fou', 8.75, 15, '../img/imgProduct/174341768767ea71575c8cf6.07080686.jpg', '1', '2025-03-31 10:41:27', 1),
(19, 4, 'Akali', 'Poster akali pour les fan de lol', 13.50, 2, '../img/imgProduct/174341776167ea71a1b02cb4.28488877.jpg', '3', '2025-03-31 10:42:41', 1);

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
  `role` enum('Acheteur','Vendeur','Admin') NOT NULL DEFAULT 'Acheteur'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `user_prenom`, `user_nom`, `user_mail`, `user_phone`, `user_password`, `user_img`, `role`) VALUES
(1, 'Zéphyr', 'Lathuy', 'zephyr.lathuy.zpl@gmail.com', 478365547, '$2y$10$bmT73TfJSAiqSqfRpqQqAO95QBMEWFJ9/8qjmtgxnYScxDaQosJP2', '', 'Acheteur'),
(2, 'jean', 'jean', 'jean@gmail.com', 248799278, 'User123//', '', 'Acheteur'),
(3, 'paul', 'jean', 'jeanp@gmail.com', 478365547, '$2y$10$LFBtZHRnASgOs1y/4/RWEu0YT6SCy049YLYwYvkGM.PIqt11Rp71K', '', 'Acheteur'),
(4, 'Zéphyr', 'Lathuy', 'user@gmail.com', 0, '$2y$10$DQ0TytWluMJOKObiq.f5s.o0.w1pFFcRh9dyU1P4vaSJKZpPjiRpq', '../img/imgUserProfil/defaultPP.png174291696567e2cd655cd3e5.20326807.jpg', 'Acheteur'),
(5, 'Zéphyr', 'Lathuy', 'user123@gmail.com', 0, '$2y$10$4y3LmoZnD1031fGUjCr66.YCBldcj/SjcC1fBYU.1OOHwsRSljXFu', '', 'Acheteur');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `panier`
--
ALTER TABLE `panier`
  MODIFY `id_panier` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id_produit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
