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
    public $actif;
    public $img;
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getAllProduit()
    {
        try {
            $sql = 'SELECT 
                    p.*,
                    c.*,
                    COUNT(r.id_review) as review_count,
                    COALESCE(AVG(r.rating), 0) as average_rating
                FROM products p
                JOIN categorie c ON p.category = c.id
                LEFT JOIN reviews_produit r ON p.id_produit = r.id_produit
                WHERE p.actif = 1
                GROUP BY p.id_produit';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $produits;
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des produits : " . $e->getMessage());
            return false;
        }
    }

    public function deleteProduit($id)
    {
        try {
            $query = "DELETE FROM products WHERE id_produit = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
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
    public function getProduitById($id)
    {
        try {
            $sql = 'SELECT products.*, categorie.*, users.*
FROM products
JOIN categorie ON products.category = categorie.id
JOIN users ON products.user_id = users.id_user
WHERE products.id_produit = :id;
';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id);
            $stmt->execute();
            $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $produits;
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des produits : " . $e->getMessage());
            return false;
        }
    }
    public function getProduitByIdUser($id_user)
    {
        try {
            $sql = 'SELECT products.*, categorie.*, users.*
FROM products
JOIN categorie ON products.category = categorie.id
JOIN users ON products.user_id = users.id_user
WHERE products.user_id = :id_user;
';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->execute();
            $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $produits;
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des produits : " . $e->getMessage());
            return false;
        }
    }

    public function updateProduit($id, $user_id, $title, $description, $price, $quantite, $image, $category, $actif)
    {
        try {
            $sql = "UPDATE products 
                    SET user_id = :user_id, 
                        title = :title, 
                        description = :description, 
                        price = :price, 
                        quantite = :quantite, 
                        image = :image, 
                        category = :category, 
                        actif = :actif 
                    WHERE id_produit = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindValue(':title', $title);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':price', $price);
            $stmt->bindValue(':quantite', $quantite);
            $stmt->bindValue(':image', $image);
            $stmt->bindValue(':category', $category);
            $stmt->bindValue(':actif', $actif);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);

            // Debug SQL query and parameters
            error_log("SQL Query: $sql");
            error_log("Parameters: " . print_r([
                'user_id' => $user_id,
                'title' => $title,
                'description' => $description,
                'price' => $price,
                'quantite' => $quantite,
                'image' => $image,
                'category' => $category,
                'actif' => $actif,
                'id' => $id
            ], true));

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la mise à jour du produit : " . $e->getMessage());
            return false;
        }
    }
}
