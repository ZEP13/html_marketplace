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

    public function addProduitToSell($id_user, $nom, $description, $price, $quantite, $img, $category, $actif)
    {
        $produit = new Produit($this->db);
        return $produit->addProduitToSell($id_user, $nom, $description, $price, $quantite, $img, $category, $actif);
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
    public function updateProduit($id, $title, $description, $price, $quantite, $image, $category, $actif)
    {
        $produit = new Produit($this->db);
        return $produit->updateProduit($id, $title, $description, $price, $quantite, $image, $category, $actif);
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
}
