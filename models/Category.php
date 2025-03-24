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

    public function getAllCategories()
    {
        try {
            $sql = "SELECT id, category_name FROM categorie";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des catégories : " . $e->getMessage());
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
