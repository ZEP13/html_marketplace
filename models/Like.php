<?php

namespace ModelsLike;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class Like
{
    public $id;
    public $user_id;
    public $post_id;
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function addLike($userId, $idProduit)
    {
        try {
            // Vérifie si l'entrée existe déjà
            $checkQuery = "SELECT * FROM liked_produit WHERE id_user_like = :id_user_like AND id_produit_like = :id_produit_like";
            $stmt = $this->db->prepare($checkQuery);
            $stmt->bindValue(':id_user_like', $userId);
            $stmt->bindValue(':id_produit_like', $idProduit);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                // Mise à jour si existe
                $updateQuery = "UPDATE liked_produit SET is_like = 1 WHERE id_user_like = :id_user_like AND id_produit_like = :id_produit_like";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->bindValue(':id_user_like', $userId);
                $updateStmt->bindValue(':id_produit_like', $idProduit);
                return $updateStmt->execute();
            } else {
                // Sinon, insertion
                $insertQuery = "INSERT INTO liked_produit (id_user_like, id_produit_like, is_like) VALUES (:id_user_like, :id_produit_like, 1)";
                $insertStmt = $this->db->prepare($insertQuery);
                $insertStmt->bindValue(':id_user_like', $userId);
                $insertStmt->bindValue(':id_produit_like', $idProduit);
                return $insertStmt->execute();
            }
        } catch (PDOException $e) {
            error_log("Erreur lors de l'ajout ou mise à jour du like : " . $e->getMessage());
            return false;
        }
    }


    public function removeLike($userId, $idProduit)
    {
        try {
            $query = "UPDATE liked_produit SET is_like = 0 WHERE id_user_like = :id_user_like AND id_produit_like = :id_produit_like";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id_user_like', $userId);
            $stmt->bindValue(':id_produit_like', $idProduit);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la suppression d'un like : " . $e->getMessage());
            return false;
        }
    }

    public function getLikesByUser($userId)
    {
        try {
            $query = "SELECT * FROM liked_produit LEFT JOIN products ON liked_produit.id_produit_like = products.id_produit WHERE id_user_like = :id_user_like AND is_like = 1";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id_user_like', $userId);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des likes pour l'utilisateur : " . $e->getMessage());
            return false;
        }
    }
}
