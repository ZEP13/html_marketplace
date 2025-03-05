<?php

namespace ModelsP;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class Produit
{
    public $id;
    public $user_id;
    public $title;
    public $description;
    public $categorie;
    public $quantite;
    public $prix;
    public $img;
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getAllProduit()
    {
        try {
            $sql = 'SELECT * FROM products';
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $produits;
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des produits : " . $e->getMessage());
            return false;
        }
    }

    public function getProduitByUserSeller($id_user)
    {
        try {
            $query = "SELECT * FROM products WHERE user_id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_user, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function addProduitToSell($id_user, $nom, $description, $price, $quantite, $img, $category, $actif)
    {
        try {
            $query = "INSERT INTO products (user_id,title, description, price,quantite, image, category, actif) VALUES (:id_user,:nom,:description,:price,:quantite,:img,:category,:actif)";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':nom', $nom);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':price', $price);
            $stmt->bindValue(':quantite', $quantite);
            $stmt->bindValue(':img', $img);
            $stmt->bindValue(':category', $category);
            $stmt->bindValue(':actif', $actif);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
}
