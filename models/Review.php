<?php

namespace ModelsReview;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;


class Review
{

    public $id;
    public $id_review;
    public $id_user;
    public $id_produit;
    public $rating;
    public $commentaire;

    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getReveiwByProduct($id_produit)
    {
        try {
            $query = "SELECT reviews_produit.*, users.* FROM reviews_produit JOIN users ON reviews_produit.id_user = users.id_user WHERE id_produit = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_produit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
    public function getAllReview()
    {
        try {
            $query = "SELECT 
                        products.*, 
                        AVG(reviews_produit.rating) as average_rating,
                        COUNT(reviews_produit.id_review) as review_count
                     FROM reviews_produit 
                     JOIN products ON reviews_produit.id_produit = products.id_produit 
                     GROUP BY products.id_produit
                     ORDER BY average_rating DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
    public function checkUserReview($id_user, $id_produit)
    {
        try {
            $query = "SELECT COUNT(*) FROM reviews_produit WHERE id_user = :id_user AND id_produit = :id_produit";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id_user', $id_user, PDO::PARAM_INT);
            $stmt->bindParam(':id_produit', $id_produit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function AddReview($id_user, $id_produit, $rating, $commentaire)
    {
        try {
            // Vérifier si une review existe déjà
            if ($this->checkUserReview($id_user, $id_produit)) {
                return false;
            }

            $query = "INSERT INTO reviews_produit (id_user, id_produit, rating, commentaire) VALUES (:id_user, :id_produit, :rating, :commentaire)";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':id_produit', $id_produit);
            $stmt->bindValue(':rating', $rating);
            $stmt->bindValue(':commentaire', $commentaire);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in AddReview: " . $e->getMessage());
            return false;
        }
    }
}
