<?php

namespace ControllersPanier;

require_once '../models/Panier.php';
require_once '../config/Database.php';

use ModelsPanier\Panier;
use Config\Database;

class PanierController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getPanierByUser($id_user)
    {
        $panier = new Panier($this->db);
        return $panier->getPanierByUser($id_user);
    }

    public function addToPanier($id_user, $id_produit, $quantite)
    {
        $panier = new Panier($this->db);
        return $panier->addToPanier($id_user, $id_produit, $quantite);
    }

    public function clearPanier($id_user, $id_produit)
    {
        $panier = new Panier($this->db);
        return $panier->clearPanier($id_user, $id_produit);
    }
    public function validePanier($id_user, $id_commande)
    {
        $panier = new Panier($this->db);
        return $panier->validePanier($id_user, $id_commande);
    }
}
