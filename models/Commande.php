<?php

namespace ModelsCommande;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class Commande
{
    public $id_commande;
    public $id_user;
    public $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getCommandeByUser($id_user)
    {
        try {
            $sql = "SELECT 
                c.*, 
                GROUP_CONCAT(DISTINCT pr.title ORDER BY p.id_panier) AS products,
                GROUP_CONCAT(DISTINCT pr.id_produit ORDER BY p.id_panier) AS product_ids, 
                GROUP_CONCAT(DISTINCT pr.price ORDER BY p.id_panier) AS prices, 
                GROUP_CONCAT(DISTINCT p.quantite_panier ORDER BY p.id_panier) AS quantities, 
                GROUP_CONCAT(DISTINCT pr.image) AS images,
                SUM(pr.price * p.quantite_panier) AS total_price
            FROM panier p
            JOIN products pr ON p.id_produit = pr.id_produit
            JOIN commande c ON p.id_commande_panier = c.id_commande
            WHERE p.id_user = :id_user AND p.id_commande_panier > 0
            GROUP BY c.id_commande
            ORDER BY c.date_commande DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur SQL dans getCommandeByUser: " . $e->getMessage());
            return false;
        }
    }

    public function getAllCommandes()
    {
        try {
            $sql = "SELECT 
                c.*, 
                GROUP_CONCAT(DISTINCT pr.title ORDER BY p.id_panier) AS products,
                GROUP_CONCAT(DISTINCT pr.id_produit ORDER BY p.id_panier) AS product_ids, 
                GROUP_CONCAT(DISTINCT pr.price ORDER BY p.id_panier) AS prices, 
                GROUP_CONCAT(DISTINCT p.quantite_panier ORDER BY p.id_panier) AS quantities, 
                GROUP_CONCAT(DISTINCT pr.image) AS images,
                SUM(pr.price * p.quantite_panier) AS total_price
            FROM panier p
            JOIN products pr ON p.id_produit = pr.id_produit
            JOIN commande c ON p.id_commande_panier = c.id_commande
            WHERE p.id_commande_panier > 0
            GROUP BY c.id_commande
            ORDER BY c.date_commande DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur SQL dans getAllCommandes: " . $e->getMessage());
            return false;
        }
    }

    public function AddCommande($id_user, $promo_id = null)
    {
        try {
            // Start transaction
            $this->db->beginTransaction();

            $promo_value = null;
            // First verify if the promo exists if promo_id is provided
            if ($promo_id !== null) {
                $checkPromo = "SELECT id FROM promotions WHERE id = :promo_id";
                $stmt = $this->db->prepare($checkPromo);
                $stmt->bindParam(':promo_id', $promo_id, PDO::PARAM_INT);
                $stmt->execute();

                if ($stmt->fetch()) {
                    $promo_value = $promo_id;
                } else {
                    error_log("Invalid promo_id: $promo_id");
                }
            }

            // Modified SQL query to handle NULL promo_id
            $sql = "INSERT INTO commande (id_user_commande, statut, promo_id, date_commande) 
                    VALUES (:id_user, :statut, :promo_id, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->bindParam(':promo_id', $promo_value, $promo_value === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindValue(':statut', 'En attente', PDO::PARAM_STR);

            $stmt->execute();
            $lastId = $this->db->lastInsertId();

            // Commit transaction
            $this->db->commit();

            return $lastId;
        } catch (PDOException $e) {
            // Rollback on error
            $this->db->rollBack();
            error_log("Error creating commande: " . $e->getMessage());
            return false;
        }
    }

    public function valideCommande($id)
    {
        try {
            $sql = "UPDATE commande SET statut = 'Envoye' WHERE id_commande = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la validation de la commande : " . $e->getMessage());
            return false;
        }
    }
    public function getComandeById($id)
    {
        try {
            $sql = "SELECT * FROM commande WHERE id_commande = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération de la commande : " . $e->getMessage());
            return false;
        }
    }
}
