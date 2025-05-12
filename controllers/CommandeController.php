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

    public function AddCommande($id_user, $promo_id = null)
    {
        $commande = new Commande($this->db);
        return $commande->AddCommande($id_user, $promo_id);
    }
    public function valideCommande($id)
    {
        $commande = new Commande($this->db);
        return $commande->valideCommande($id);
    }
    public function getAllCommandes()
    {
        $commande = new Commande($this->db);
        return $commande->getAllCommandes();
    }
    public function getComandeById($id)
    {
        $commande = new Commande($this->db);
        return $commande->getComandeById($id);
    }
}
