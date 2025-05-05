<?php

namespace ControllersPourcent;

require_once '../models/Pourcent.php';
require_once '../config/Database.php';

use ModelsPourcent\Pourcent;
use Config\Database;

class PourcentController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getPourcentByCategorie($id_categorie)
    {
        $Pourcent = new Pourcent($this->db);
        return $Pourcent->getPourcentByCategorie($id_categorie);
    }

    public function getAllPourcent()
    {
        $Pourcent = new Pourcent($this->db);
        return $Pourcent->getAllPourcent();
    }

    public function createPourcent($pourcent, $id_categorie)
    {
        $Pourcent = new Pourcent($this->db);
        return $Pourcent->createPourcent($pourcent, $id_categorie);
    }
    public function activPourcent($id_pourcent)
    {
        $Pourcent = new Pourcent($this->db);
        return $Pourcent->activPourcent($id_pourcent);
    }
}
