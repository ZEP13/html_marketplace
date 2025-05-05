<?php

namespace ModelsPourcent;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;


class Pourcent
{
    public $id_pourcent;
    public $pourcent;
    public $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getPourcentByCategorie($id_categorie)
    {
        try {
            $sql = "SELECT * FROM pourcentage WHERE id = :id_categorie LEFT JOIN categorie ON pourcentages.categorie = categorie.id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_categorie', $id_categorie, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur SQL dans getPourcentByCategorie: " . $e->getMessage());
            return false;
        }
    }

    public function getAllPourcent()
    {
        try {
            $sql = "SELECT * FROM pourcentage";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur SQL dans getAllPourcent: " . $e->getMessage());
            return false;
        }
    }
    public function createPourcent($pourcent, $id_categorie)
    {
        try {
            $sql = "INSERT INTO pourcentage (pourcent, id_categorie) VALUES (:pourcent, :id_categorie)";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':pourcent', $pourcent, PDO::PARAM_STR);
            $stmt->bindParam(':id_categorie', $id_categorie, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur SQL dans createPourcent: " . $e->getMessage());
            return false;
        }
    }
    public function activPourcent($id_pourcent)
    {
        try {
            $sql = "UPDATE pourcentage SET actifs = 1 WHERE id = :id_pourcent";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_pourcent', $id_pourcent, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur SQL dans activPourcent: " . $e->getMessage());
            return false;
        }
    }
}
