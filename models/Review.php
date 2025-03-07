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
            $query = "SELECT * FROM reviews_produit WHERE id_produit = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_produit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function AddReview($id_user, $id_produit, $rating, $commentaire)
    {
        try {
            $query = "INSERT INTO reviews_produit (id_user, id_produit, rating, commentaire) VALUES (:id_user, :id_produit, :rating, :commentaire)";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':id_produit', $id_produit);
            $stmt->bindValue(':rating', $rating);
            $stmt->bindValue(':commentaire', $commentaire);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
}
