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
    public $id_produit;
    public $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getCommandeByUser($id_user)
    {
        try {
            // Corrected SQL query
            $sql = "SELECT c.*, p.*
                    FROM commande c 
                    JOIN products p ON c.id_produit_commande = p.id_produit 
                    WHERE c.id_user_commande = :id_user";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur SQL dans getCommandeByUser: " . $e->getMessage());
            return false;
        }
    }
    public function AddCommande($id_user, $id_produit)
    {
        try {
            $sql = "INSERT INTO commande (id_user_commande, id_produit_commande)VALUE id_user_commande = :id_user";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->bindParam(':id_produit', $id_produit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "error: " . $e->getMessage();
            return false;
        }
    }
}
