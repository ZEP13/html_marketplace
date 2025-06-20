<?php

namespace ModelsP;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class Produit
{
    public $id_produit;
    public $user_id;
    public $title;
    public $description;
    public $price;
    public $quantite;
    public $image;
    public $category;
    public $created_at;
    public $actif;
    public $valide;
    public $refuse;
    public $comm_refu;
    public $marque;
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

    public function addProduitToSell($id_user, $nom, $description, $price, $quantite, $img, $category, $actif, $marque)
    {
        try {
            $query = "INSERT INTO products (user_id, title, description, price, quantite, image, category, actif, marque, valide, refuse, comm_refu)
                      VALUES (:id_user, :nom, :description, :price, :quantite, :img, :category, :actif, :marque, 0, 0, '')";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':nom', $nom);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':price', $price);
            $stmt->bindValue(':quantite', $quantite);
            $stmt->bindValue(':img', $img);
            $stmt->bindValue(':category', $category);
            $stmt->bindValue(':actif', $actif);
            $stmt->bindValue(':marque', $marque);
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

    public function updateProduit($id, $user_id, $title, $description, $price, $quantite, $image, $category, $actif, $marque)
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
                            marque = :marque,
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
            $stmt->bindValue(':marque', $marque);

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
                    WHERE p.actif = 1 AND p.valide = 1 AND p.refuse = 0
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
    public function getProduitsByMarque($marque)
    {
        try {
            $sql = 'SELECT p.*, u.user_nom, u.user_prenom, c.category_name,
                    COUNT(r.id_review) as review_count,
                    AVG(r.rating) as average_rating
                    FROM products p
                    LEFT JOIN users u ON p.user_id = u.id_user
                    LEFT JOIN categorie c ON p.category = c.id
                    LEFT JOIN reviews_produit r ON p.id_produit = r.id_produit
                    WHERE p.actif = 1 
                    AND p.valide = 1 
                    AND p.refuse = 0
                    AND LOWER(p.marque) = LOWER(:marque)
                    GROUP BY p.id_produit
                    ORDER BY p.created_at DESC';

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':marque', trim($marque));
            $stmt->execute();

            // Debug log
            error_log("Recherche pour marque : " . $marque);
            error_log("Requête SQL : " . $sql);

            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Nombre de résultats : " . count($results));

            return $results;
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des produits par marque : " . $e->getMessage());
            return false;
        }
    }
    public function getValidProducts($filters = null)
    {
        try {
            $sql = 'SELECT p.*, u.user_nom, u.user_prenom, c.category_name,
                AVG(r.rating) as average_rating, COUNT(r.id) as review_count
                FROM products p
                LEFT JOIN users u ON p.user_id = u.id_user
                LEFT JOIN categorie c ON p.category = c.id
                LEFT JOIN reviews_produit r ON p.id_produit = r.id_produit
                WHERE p.actif = 1 AND p.valide = 1 AND p.refuse = 0';

            // Add filter conditions
            if ($filters) {
                if (!empty($filters['category'])) {
                    $sql .= ' AND p.category = :category';
                }
                if (!empty($filters['maxPrice'])) {
                    $sql .= ' AND p.price <= :maxPrice';
                }
                if (!empty($filters['inStock'])) {
                    $sql .= ' AND p.quantite > 0';
                }
            }

            $sql .= ' GROUP BY p.id_produit';

            $stmt = $this->db->prepare($sql);

            // Bind filter values
            if ($filters) {
                if (!empty($filters['category'])) {
                    $stmt->bindValue(':category', $filters['category'], PDO::PARAM_INT);
                }
                if (!empty($filters['maxPrice'])) {
                    $stmt->bindValue(':maxPrice', $filters['maxPrice'], PDO::PARAM_INT);
                }
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur de récupération des produits : " . $e->getMessage());
            return false;
        }
    }
}
