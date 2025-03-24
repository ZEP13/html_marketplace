<?php

namespace ModelsCategory;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class Category
{
    public $id;
    public $nom;
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getCategory()
    {
        try {
            $query = "SELECT * FROM categorie JOIN users ON categorie.id_user = users.id_user";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function addCategory($nom)
    {
        try {
            $query = "INSERT INTO categorie (nom) VALUE (:nom)";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':nom', $nom);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
}
