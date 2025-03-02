<?php

namespace ModelsPanier;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;


class Panier
{
    public $id;
    public $id_user;
    public $id_poduit;
    public $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getPanierByUser($id_user)
    {
        try {
            $query = "SELECT * FROM panier WHERE user_id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_user, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération du panier: " . $e->getMessage());
            return false;
        }
    }

    public function addToPanier($id_user, $id_produit, $quantite)
    {
        try {
            // Vérifier si le produit existe déjà dans le panier de l'utilisateur
            $sql = 'SELECT `quantite` FROM `panier` WHERE `id_user` = :id_user AND `id_produit` = :id_produit';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':id_produit', $id_produit);
            $stmt->execute();

            // Si le produit existe déjà, on met à jour la quantité
            if ($stmt->rowCount() > 0) {
                // Récupérer la quantité actuelle
                $currentQuantity = $stmt->fetchColumn();

                // Calculer la nouvelle quantité (ajouter ou retirer)
                $newQuantity = $currentQuantity + $quantite;

                // Si la quantité devient 0 ou moins, on supprime l'élément du panier
                if ($newQuantity <= 0) {
                    $sql = 'DELETE FROM `panier` WHERE `id_user` = :id_user AND `id_produit` = :id_produit';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    return $stmt->execute();
                } else {
                    // Sinon, on met à jour la quantité dans le panier
                    $sql = 'UPDATE `panier` SET `quantite` = :quantite WHERE `id_user` = :id_user AND `id_produit` = :id_produit';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':quantite', $newQuantity);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    return $stmt->execute();
                }
            } else {
                // Si le produit n'est pas encore dans le panier, on l'ajoute avec la quantité
                if ($quantite > 0) {
                    $sql = 'INSERT INTO `panier` (`id_user`, `id_produit`, `quantite`)
                        VALUES (:id_user, :id_produit, :quantite)';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    $stmt->bindValue(':quantite', $quantite);
                    return $stmt->execute();
                } else {
                    // Si la quantité est <= 0 et que le produit n'existe pas, on ne fait rien.
                    return false;
                }
            }
        } catch (PDOException $e) {
            error_log("Erreur lors de la mise à jour du panier : " . $e->getMessage());
            return false;
        }
    }

    public function clearPanier($id_user, $id_produit)
    {
        try {
            $sql = 'DELETE FROM `panier` WHERE `id_user` = :id_user AND `id_produit` = :id_produit';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':id_produit', $id_produit);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la supresion du panier" . $e->getMessage());
            return false;
        }
    }
}
