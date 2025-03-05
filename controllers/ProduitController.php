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

    public function getProduitByUserSeller($id_user)
    {
        $produit = new Produit($this->db);
        return $produit->getProduitByUserSeller($id_user);
    }
}
