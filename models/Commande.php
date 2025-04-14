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
                GROUP_CONCAT(pr.title ORDER BY p.id_panier) AS products,
                GROUP_CONCAT(pr.id_produit ORDER BY p.id_panier) AS product_ids, 
                GROUP_CONCAT(pr.price ORDER BY p.id_panier) AS prices, 
                GROUP_CONCAT(p.quantite_panier ORDER BY p.id_panier) AS quantities, 
                GROUP_CONCAT(pr.image ORDER BY p.id_panier) AS images,
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

    public function AddCommande($id_user)
    {
        try {
            $sql = "INSERT INTO commande (id_user_commande) VALUES (:id_user)";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->execute();
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error creating commande: " . $e->getMessage());
            return false;
        }
    }
}
