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
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $produit = new self($this->db);
                $produit->id = $row['id_produit'];
                $produit->quantite = $row['quantite'];
                $produit->user_id = $row['user_id'];
                $produit->title = $row['title'];
                $produit->description = $row['description'];
                $produit->prix = $row['price'];
                $produit->img = $row['image'];
                $produit->categorie = $row['category'];
                return $produit;
            }
        } catch (PDOException $e) {
            error_log("Erreur lors de l'insertion : " . $e->getMessage());
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
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
}
