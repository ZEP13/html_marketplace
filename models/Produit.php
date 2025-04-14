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
            $sql = 'SELECT p.*, u.user_nom, u.user_prenom, c.category_name
                    FROM products p
                    LEFT JOIN users u ON p.user_id = u.id_user
                    LEFT JOIN categorie c ON p.category = c.id';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
            $query = "INSERT INTO products (user_id, title, description, price, quantite, image, category, actif) 
                      VALUES (:id_user, :nom, :description, :price, :quantite, :img, :category, :actif)";
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
            error_log("Error: " . $e->getMessage());
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
            // Si aucune nouvelle image n'est fournie, on garde l'image existante
            if (empty($image)) {
                $sql = "UPDATE products 
                        SET user_id = :user_id, 
                            title = :title, 
                            description = :description, 
                            price = :price, 
                            quantite = :quantite, 
                            category = :category, 
                            actif = :actif,
                            valide = 0,
                            refuse = 0,
                            comm_refu = NULL
                        WHERE id_produit = :id";
            } else {
                $sql = "UPDATE products 
                        SET user_id = :user_id, 
                            title = :title, 
                            description = :description, 
                            price = :price, 
                            quantite = :quantite, 
                            image = :image, 
                            category = :category, 
                            actif = :actif,
                            valide = 0,
                            refuse = 0,
                            comm_refu = NULL
                        WHERE id_produit = :id";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindValue(':title', $title);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':price', $price);
            $stmt->bindValue(':quantite', $quantite);
            if (!empty($image)) {
                $stmt->bindValue(':image', $image);
            }
            $stmt->bindValue(':category', $category);
            $stmt->bindValue(':actif', $actif);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la mise à jour du produit : " . $e->getMessage());
            return false;
        }
    }

    public function updateProductStatus($id, $status, $comment = '')
    {
        try {
            if ($status === 'validate') {
                $sql = "UPDATE products SET valide = 1, refuse = 0, comm_refu = NULL WHERE id_produit = :id";
            } else {
                $sql = "UPDATE products SET valide = 0, refuse = 1, comm_refu = :comment WHERE id_produit = :id";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            if ($status === 'refuse') {
                $stmt->bindValue(':comment', $comment);
            }
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la mise à jour du statut : " . $e->getMessage());
            return false;
        }
    }

    public function resetValidation($id)
    {
        try {
            $sql = "UPDATE products SET valide = 0, refuse = 0, comm_refu = NULL WHERE id_produit = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la réinitialisation du statut : " . $e->getMessage());
            return false;
        }
    }

    public function getValidatedProducts()
    {
        try {
            $sql = 'SELECT p.*, u.user_nom, u.user_prenom, c.category_name,
                    COUNT(r.id_review) as review_count,
                    AVG(r.rating) as average_rating
                    FROM products p
                    LEFT JOIN users u ON p.user_id = u.id_user
                    LEFT JOIN categorie c ON p.category = c.id
                    LEFT JOIN reviews_produit r ON p.id_produit = r.id_produit
                    WHERE p.actif = 1 AND p.valide = 1
                    GROUP BY p.id_produit';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des produits validés : " . $e->getMessage());
            return false;
        }
    }
    public function getAllImage($id)
    {
        try {
            $sql = 'SELECT p.*, pi.image_url
    FROM `products` p
    LEFT JOIN `product_images` pi ON p.id_produit = pi.product_id
    WHERE p.id_produit = :id;';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des images : " . $e->getMessage());
            return false;
        }
    }

    public function AddAllImgProduit($productId, $images)
    {
        try {
            $this->db->beginTransaction();

            $sql = 'INSERT INTO product_images (product_id, image_url, created_at) VALUES (:product_id, :image_url, CURRENT_TIMESTAMP)';
            $stmt = $this->db->prepare($sql);

            foreach ($images as $imagePath) {
                $stmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
                $stmt->bindValue(':image_url', $imagePath, PDO::PARAM_STR);
                if (!$stmt->execute()) {
                    $this->db->rollBack();
                    return false;
                }
            }

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Erreur lors de l'ajout des images : " . $e->getMessage());
            return false;
        }
    }
}
