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
WHERE panier.id_user = :id AND panier.id_commande_panier = 0


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
            // On vérifie uniquement dans les paniers NON commandés
            $sql = 'SELECT `quantite_panier` FROM `panier` 
                    WHERE `id_user` = :id_user 
                    AND `id_produit` = :id_produit 
                    AND `id_commande_panier` = 0';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':id_produit', $id_produit);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $currentQuantity = $stmt->fetchColumn();
                $newQuantity = $quantite;

                if ($newQuantity <= 0) {
                    $sql = 'DELETE FROM `panier` 
                            WHERE `id_user` = :id_user 
                            AND `id_produit` = :id_produit 
                            AND `id_commande_panier` = 0';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    return $stmt->execute();
                } else {
                    $sql = 'UPDATE `panier` 
                            SET `quantite_panier` = :quantite_panier 
                            WHERE `id_user` = :id_user 
                            AND `id_produit` = :id_produit 
                            AND `id_commande_panier` = 0';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':quantite_panier', $newQuantity);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    return $stmt->execute();
                }
            } else {
                if ($quantite > 0) {
                    $sql = 'INSERT INTO `panier` 
                            (`id_user`, `id_produit`, `quantite_panier`, `id_commande_panier`)
                            VALUES (:id_user, :id_produit, :quantite_panier, 0)';
                    $stmt = $this->db->prepare($sql);
                    $stmt->bindValue(':id_user', $id_user);
                    $stmt->bindValue(':id_produit', $id_produit);
                    $stmt->bindValue(':quantite_panier', $quantite);
                    return $stmt->execute();
                } else {
                    return false;
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

    public function validePanier($id_user, $id_commande)
    {
        try {
            $this->db->beginTransaction();

            // 1. Récupérer tous les articles du panier non achetés
            $sql = 'SELECT id_produit, quantite_panier FROM panier 
                    WHERE id_user = :id_user AND achete = 0';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->execute();
            $panierItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. Pour chaque article, mettre à jour le stock
            foreach ($panierItems as $item) {
                $sql = 'UPDATE products 
                        SET quantite = quantite - :quantite_panier 
                        WHERE id_produit = :id_produit';
                $stmt = $this->db->prepare($sql);
                $stmt->bindValue(':quantite_panier', $item['quantite_panier'], PDO::PARAM_INT);
                $stmt->bindValue(':id_produit', $item['id_produit'], PDO::PARAM_INT);
                $stmt->execute();
            }

            // 3. Marquer les articles du panier comme achetés
            $sql = 'UPDATE panier 
                    SET achete = 1, 
                        id_commande_panier = :id_commande 
                    WHERE id_user = :id_user AND achete = 0';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->bindValue(':id_commande', $id_commande, PDO::PARAM_INT);
            $stmt->execute();

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Erreur lors de la validation du panier : " . $e->getMessage());
            return false;
        }
    }
}
