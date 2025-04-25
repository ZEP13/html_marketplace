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
            $query = "SELECT * FROM promotions 
                      WHERE ajoute_par_admin = 1 
                      ORDER BY date_creation DESC";
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
            $sql = "INSERT INTO promotions (
                code, nom_promo, description, date_debut, date_fin, 
                reduction_value, type_reduction, montant_max, condition_min,
                actif, refuse, ajoute_par_admin, validé_par_admin, 
                vendeur_id, est_globale, nbreUtilisationCode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->db->prepare($sql);

            return $stmt->execute([
                $data['code'],
                $data['nom_promo'],
                $data['description'],
                $data['date_debut'],
                $data['date_fin'],
                $data['reduction_value'],
                $data['type_reduction'],
                $data['montant_max'],
                $data['condition_min'],
                $data['actif'],
                $data['refuse'],
                $data['ajoute_par_admin'],
                $data['validé_par_admin'],
                $data['vendeur_id'],
                $data['est_globale'],
                $data['nbreUtilisationCode']
            ]);
        } catch (PDOException $e) {
            error_log("Error creating promo: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0]);
            error_log("Error Code: " . $e->errorInfo[1]);
            error_log("Message: " . $e->errorInfo[2]);
            return false;
        }
    }

    public function updatePromo($id, $data)
    {
        try {
            $updateFields = [];
            $params = [];

            // Build update fields and params
            foreach ($data as $key => $value) {
                if ($value !== null) {
                    $updateFields[] = "$key = :$key";
                    $params[$key] = $value;
                }
            }

            // Add the ID parameter
            $params['id'] = $id;

            if (empty($updateFields)) {
                return false;
            }

            $query = "UPDATE promotions SET " . implode(', ', $updateFields) .
                ", date_modification = CURRENT_TIMESTAMP WHERE id = :id";

            $stmt = $this->db->prepare($query);
            return $stmt->execute($params);
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

    public function togglePromoStatus($id)
    {
        try {
            // D'abord, on récupère l'état actuel
            $query = "SELECT actif FROM promotions WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $currentStatus = $stmt->fetchColumn();

            // Ensuite, on bascule l'état (si 1 alors 0, si 0 alors 1)
            $newStatus = $currentStatus ? 0 : 1;

            // On met à jour avec le nouveau statut
            $query = "UPDATE promotions SET actif = :actif, date_modification = CURRENT_TIMESTAMP WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':actif', $newStatus, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error toggling promo status: " . $e->getMessage());
            return false;
        }
    }

    public function getVendorPromos()
    {
        try {
            $query = "SELECT p.*, 
                         u.user_prenom, 
                         u.user_nom,
                         u.id_user as vendeur_id
                  FROM promotions p 
                  LEFT JOIN users u ON p.vendeur_id = u.id_user 
                  WHERE p.est_globale = 0 OR p.vendeur_id IS NOT NULL
                  ORDER BY p.date_creation DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute();

            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($results === false) {
                error_log("No results found in getVendorPromos");
                return [];
            }
            return $results;
        } catch (PDOException $e) {
            error_log("Error in getVendorPromos: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

    public function validateVendorPromo($id)
    {
        try {
            $query = "UPDATE promotions 
                      SET validé_par_admin = 1, 
                          refuse = 0,
                          actif = 1,
                          date_modification = CURRENT_TIMESTAMP 
                      WHERE id = :id";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            error_log("Error validating promo: " . $e->getMessage());
            return false;
        }
    }

    public function refuseVendorPromo($id)
    {
        try {
            $query = "UPDATE promotions 
                      SET refuse = 1, 
                          validé_par_admin = 0,
                          actif = 0,
                          date_modification = CURRENT_TIMESTAMP 
                      WHERE id = :id";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            error_log("Error refusing promo: " . $e->getMessage());
            return false;
        }
    }

    public function resetVendorPromo($id)
    {
        try {
            $query = "UPDATE promotions 
                      SET refuse = 0, 
                          validé_par_admin = 0,
                          actif = 0,
                          date_modification = CURRENT_TIMESTAMP 
                      WHERE id = :id";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            error_log("Error resetting promo: " . $e->getMessage());
            return false;
        }
    }

    public function getUserPromos($userId)
    {
        try {
            $query = "SELECT * FROM promotions WHERE vendeur_id = :vendeur_id ORDER BY date_creation DESC";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':vendeur_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error fetching user promos: " . $e->getMessage());
            return false;
        }
    }

    public function isCodeUnique($code, $excludeId = null)
    {
        try {
            $query = "SELECT COUNT(*) FROM promotions WHERE code = :code";
            $params = ['code' => $code];

            if ($excludeId !== null) {
                $query .= " AND id != :id";
                $params['id'] = $excludeId;
            }

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return (int)$stmt->fetchColumn() === 0;
        } catch (PDOException $e) {
            error_log("Error checking code uniqueness: " . $e->getMessage());
            return false;
        }
    }

    public function updateUserPromo($id, $data, $userId)
    {
        try {
            // First verify ownership
            $stmt = $this->db->prepare("SELECT * FROM promotions WHERE id = :id AND vendeur_id = :vendeur_id");
            $stmt->execute([
                'id' => $id,
                'vendeur_id' => $userId
            ]);

            $promo = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$promo) {
                return false;
            }

            // Si le code n'a pas changé, on ne vérifie pas l'unicité
            if ($promo['code'] === $data['code']) {
                return $this->updatePromo($id, $data);
            }

            // Sinon, on vérifie que le nouveau code est unique
            if ($this->isCodeUnique($data['code'], $id)) {
                return $this->updatePromo($id, $data);
            }

            return false;
        } catch (PDOException $e) {
            error_log("Error in updateUserPromo: " . $e->getMessage());
            return false;
        }
    }

    public function createUserPromo($data, $userId)
    {
        try {
            // Set required fields
            $data['vendeur_id'] = $userId;
            $data['ajoute_par_admin'] = 0;
            $data['est_globale'] = 0;
            $data['validé_par_admin'] = 0;
            $data['actif'] = 0;
            $data['refuse'] = 0;
            $data['nbreUtilisationCode'] = 0;

            // Ensure dates are properly formatted
            $data['date_debut'] = date('Y-m-d', strtotime($data['date_debut']));
            $data['date_fin'] = date('Y-m-d', strtotime($data['date_fin']));

            return $this->createPromo($data);
        } catch (PDOException $e) {
            error_log("Error in createUserPromo: " . $e->getMessage());
            return false;
        }
    }
}
