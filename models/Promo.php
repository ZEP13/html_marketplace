<?php

namespace ModelsPromo;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class Promo
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getAllPromos()
    {
        try {
            $query = "SELECT * FROM promotions ORDER BY date_creation DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error fetching all promos: " . $e->getMessage());
            return false;
        }
    }

    public function getPromoById($id)
    {
        try {
            $query = "SELECT * FROM promotions WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error fetching promo by ID: " . $e->getMessage());
            return false;
        }
    }

    public function createPromo($data)
    {
        try {
            $query = "INSERT INTO promotions (code, nom_promo, description, date_debut, date_fin, reduction_value, type_reduction, montant_max, condition_min, actif, validé_par_admin, vendeur_id, est_globale, nbreUtilisationCode) 
                      VALUES (:code, :nom_promo, :description, :date_debut, :date_fin, :reduction_value, :type_reduction, :montant_max, :condition_min, :actif, :validé_par_admin, :vendeur_id, :est_globale, :nbreUtilisationCode)";
            $stmt = $this->db->prepare($query);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            error_log("Error creating promo: " . $e->getMessage());
            return false;
        }
    }

    public function updatePromo($id, $data)
    {
        try {
            $query = "UPDATE promotions SET code = :code, nom_promo = :nom_promo, description = :description, date_debut = :date_debut, date_fin = :date_fin, reduction_value = :reduction_value, type_reduction = :type_reduction, montant_max = :montant_max, condition_min = :condition_min, actif = :actif, validé_par_admin = :validé_par_admin, vendeur_id = :vendeur_id, est_globale = :est_globale, nbreUtilisationCode = :nbreUtilisationCode WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $data['id'] = $id;
            return $stmt->execute($data);
        } catch (PDOException $e) {
            error_log("Error updating promo: " . $e->getMessage());
            return false;
        }
    }

    public function deletePromo($id)
    {
        try {
            $query = "DELETE FROM promotions WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error deleting promo: " . $e->getMessage());
            return false;
        }
    }

    public function togglePromoStatus($id, $active)
    {
        try {
            $query = "UPDATE promotions SET actif = :active, date_modification = CURRENT_TIMESTAMP WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':active', $active, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error toggling promo status: " . $e->getMessage());
            return false;
        }
    }
}
