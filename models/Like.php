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
            $query = "INSERT INTO liked_produit (id_user_like, id_produit_like) VALUES (:id_user_like, :id_produit_like)";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id_user_like', $userId);
            $stmt->bindValue(':id_produit_like', $idProduit);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de l'ajout d'un like : " . $e->getMessage());
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
            $query = "SELECT * FROM liked_produit LEFT JOIN products ON liked_produit.id_produit_like = products.id_produit WHERE id_user_like = :id_user_like";
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
