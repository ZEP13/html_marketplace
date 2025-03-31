<?php

namespace ControllerCommande;

require_once '../models/Commande.php';
require_once '../config/Database.php';

use ModelsCommande\Commande;
use Config\Database;

class CommandeController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getCommandeByUser($id_user)
    {
        $commande = new Commande($this->db);
        return $commande->getCommandeByUser($id_user);
    }
    public function AddCommande($id_user, $id_produit)
    {
        $commande = new Commande($this->db);
        return $commande->AddCommande($id_user, $id_produit);
    }
}
