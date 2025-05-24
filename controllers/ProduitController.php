<?php

namespace ControllersP;

require_once '../models/Produit.php';
require_once '../config/Database.php';

use ModelsP\Produit;
use Config\Database;

class ProduitController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function addProduitToSell($id_user, $nom, $description, $price, $quantite, $img, $category, $actif, $marque)
    {
        $produit = new Produit($this->db);
        $result = $produit->addProduitToSell($id_user, $nom, $description, $price, $quantite, $img, $category, $actif, $marque);
        if ($result) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function getAllProduit()
    {
        $produit = new Produit($this->db);
        return $produit->getAllProduit();
    }
    public function getProduitById($id)
    {
        $produit = new Produit($this->db);
        return $produit->getProduitById($id);
    }
    public function deleteProduit($id)
    {
        $produit = new Produit($this->db);
        return $produit->deleteProduit($id);
    }
    public function updateProduit($id, $user_id, $title, $description, $price, $quantite, $image, $category, $actif, $marque)
    {
        $produit = new Produit($this->db);
        return $produit->updateProduit($id, $user_id, $title, $description, $price, $quantite, $image, $category, $actif, $marque);
    }
    public function getProduitByIdUser($id_user)
    {
        $produit = new Produit($this->db);
        return $produit->getProduitByIdUser($id_user);
    }
    public function getProduitByUserSeller($id_user)
    {
        $produit = new Produit($this->db);
        return $produit->getProduitByUserSeller($id_user);
    }
    public function updateProductStatus($productId, $status, $comment = '')
    {
        $produit = new Produit($this->db);
        return $produit->updateProductStatus($productId, $status, $comment);
    }

    public function resetValidation($productId)
    {
        $produit = new Produit($this->db);
        return $produit->resetValidation($productId);
    }

    public function getValidatedProducts()
    {
        $produit = new Produit($this->db);
        return $produit->getValidatedProducts();
    }
    public function getAllImage($id)
    {
        $produit = new Produit($this->db);
        return $produit->getAllImage($id);
    }
    public function AddAllImgProduit($id, $images)
    {
        $produit = new Produit($this->db);
        return $produit->AddAllImgProduit($id, $images);
    }
    public function getProduitsByMarque($marque)
    {
        $produit = new Produit($this->db);
        return $produit->getProduitsByMarque($marque);
    }
}
