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
            $query = "
    SELECT panier.*, products.*
    FROM panier
    JOIN products ON panier.id_produit = products.id_produit
    WHERE panier.id_user = :id
";

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
            // Check if the product exists in the user's cart
            $sql = 'SELECT `quantite_panier` FROM `panier` WHERE `id_user` = :id_user AND `id_produit` = :id_produit';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':id_produit', $id_produit);
            $stmt->execute();

            // If the product exists, update the quantity
            if ($stmt->rowCount() > 0) {
                $currentQuantity = $stmt->fetchColumn();
                $newQuantity =  $quantite;

                // If the new quantity is 0 or less, remove the product from the cart
                if ($newQuantity <= 0) {
                    $sql = 'DELETE FROM `panier` WHERE `id_user` = :id_user AND `id_produit` = :id_produit';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    return $stmt->execute();
                } else {
                    // Otherwise, update the quantity in the cart
                    $sql = 'UPDATE `panier` SET `quantite_panier` = :quantite_panier WHERE `id_user` = :id_user AND `id_produit` = :id_produit';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':quantite_panier', $newQuantity);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    return $stmt->execute();
                }
            } else {
                // If the product is not in the cart, add it with the specified quantity
                if ($quantite > 0) {
                    $sql = 'INSERT INTO `panier` (`id_user`, `id_produit`, `quantite_panier`)
                        VALUES (:id_user, :id_produit, :quantite_panier)';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    $stmt->bindValue(':quantite_panier', $quantite);
                    return $stmt->execute();
                } else {
                    return false; // If the quantity is invalid, do nothing
                }
            }
        } catch (PDOException $e) {
            error_log("Error updating cart: " . $e->getMessage());
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
