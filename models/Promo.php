<?php



namespace ModelsPromo;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;


class Promo
{
    private $db;
    public $id;
    public $code;
    public $nom_promo;
    public $description;
    public $date_debut;
    public $date_fin;
    public $reduction_value;
    public $type_reduction;
    public $montant_max;
    public $condition_min;
    public $vendeur_id;
    public $est_globale;
    public $actif;
    public $validé_par_admin;

    public function __construct($db)
    {
        $this->db = $db;
    }

    private function validateDates($date_debut, $date_fin)
    {
        $today = date('Y-m-d');

        if ($date_debut < $today) {
            return ['valid' => false, 'message' => 'La date de début doit être égale ou postérieure à aujourd\'hui'];
        }

        if ($date_fin < $date_debut) {
            return ['valid' => false, 'message' => 'La date de fin doit être postérieure à la date de début'];
        }

        return ['valid' => true];
    }

    public function addPromo(
        $code,
        $nom_promo,
        $description,
        $date_debut,
        $date_fin,
        $reduction_value,
        $type_reduction,
        $montant_max,
        $condition_min,
        $vendeur_id,
        $est_globale
    ) {
        try {
            // Valider les dates
            $dateValidation = $this->validateDates($date_debut, $date_fin);
            if (!$dateValidation['valid']) {
                throw new PDOException($dateValidation['message']);
            }

            // Définir actif et validé_par_admin en fonction de est_globale
            $actif = $est_globale;
            $valide_admin = $est_globale;
            $ajoute_par_admin = $est_globale ? 1 : 0;  // Nouveau champ
            $refuse = 0;

            // Ajout du nombre d'utilisations initial
            $nbreUtilisationCode = 0;

            $query = "INSERT INTO promotions (code, nom_promo, description, date_debut, date_fin,
                    reduction_value, type_reduction, montant_max, condition_min, vendeur_id, 
                    est_globale, actif, validé_par_admin, refuse, ajoute_par_admin, nbreUtilisationCode)
                    VALUES (:code, :nom_promo, :description, :date_debut, :date_fin,
                    :reduction_value, :type_reduction, :montant_max, :condition_min, :vendeur_id,
                    :est_globale, :actif, :valide_admin, :refuse, :ajoute_par_admin, :nbreUtilisationCode)";

            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':code', $code);
            $stmt->bindValue(':nom_promo', $nom_promo);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':date_debut', $date_debut);
            $stmt->bindValue(':date_fin', $date_fin);
            $stmt->bindValue(':reduction_value', $reduction_value);
            $stmt->bindValue(':type_reduction', $type_reduction);
            $stmt->bindValue(':montant_max', $montant_max);
            $stmt->bindValue(':condition_min', $condition_min);
            $stmt->bindValue(':vendeur_id', $vendeur_id);
            $stmt->bindValue(':est_globale', $est_globale);
            $stmt->bindValue(':actif', $actif);
            $stmt->bindValue(':valide_admin', $valide_admin);
            $stmt->bindValue(':refuse', $refuse);
            $stmt->bindValue(':ajoute_par_admin', $ajoute_par_admin);
            $stmt->bindValue(':nbreUtilisationCode', $nbreUtilisationCode);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error adding promo: " . $e->getMessage());
            return false;
        }
    }

    public function validatePromo($id_promo)
    {
        try {
            // Mise à jour complète
            $query = "UPDATE promotions
                  SET validé_par_admin = TRUE, 
                      actif = TRUE,
                      refuse = 0,
                      date_modification = CURRENT_TIMESTAMP
                  WHERE id = :id 
                  AND est_globale = FALSE 
                  AND date_fin >= CURRENT_DATE";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_promo, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function refusePromo($id_promo)
    {
        try {
            // Mise à jour complète
            $query = "UPDATE promotions
                  SET refuse = 1, 
                      actif = FALSE,
                      validé_par_admin = FALSE,
                      date_modification = CURRENT_TIMESTAMP
                  WHERE id = :id 
                  AND est_globale = FALSE";
            $stmt = $this->db->prepare($query);  // Fixed here: changed $->db to $this->db
            $stmt->bindParam(':id', $id_promo, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error refusing promo: " . $e->getMessage());
            return false;
        }
    }

    public function updatePromo(
        $id_promo,
        $code,
        $nom_promo,
        $description,
        $date_debut,
        $date_fin,
        $reduction_value,
        $type_reduction,
        $montant_max,
        $condition_min
    ) {
        try {
            // Vérifier si c'est une promo globale (admin)
            $query = "SELECT est_globale FROM promotions WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id', $id_promo);
            $stmt->execute();
            $promo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$promo['est_globale']) {
                throw new PDOException("Les promotions vendeur ne peuvent pas être modifiées");
            }

            // Valider les dates
            $dateValidation = $this->validateDates($date_debut, $date_fin);
            if (!$dateValidation['valid']) {
                throw new PDOException($dateValidation['message']);
            }

            $query = "UPDATE promotions SET 
                    code = :code,
                    nom_promo = :nom_promo,
                    description = :description,
                    date_debut = :date_debut,
                    date_fin = :date_fin,
                    reduction_value = :reduction_value,
                    type_reduction = :type_reduction,
                    montant_max = :montant_max,
                    condition_min = :condition_min,
                    date_modification = CURRENT_TIMESTAMP
                  WHERE id = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id', $id_promo);
            $stmt->bindValue(':code', $code);
            $stmt->bindValue(':nom_promo', $nom_promo);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':date_debut', $date_debut);
            $stmt->bindValue(':date_fin', $date_fin);
            $stmt->bindValue(':reduction_value', $reduction_value);
            $stmt->bindValue(':type_reduction', $type_reduction);
            $stmt->bindValue(':montant_max', $montant_max);
            $stmt->bindValue(':condition_min', $condition_min);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error updating promo: " . $e->getMessage());
            return false;
        }
    }

    public function setPromoActive($id_promo, $active = true)
    {
        try {
            // Vérifier d'abord si la promo n'est pas expirée
            $query = "UPDATE promotions
                  SET actif = :active
                  WHERE id = :id 
                  AND validé_par_admin = 1 
                  AND refuse = 0 
                  AND date_fin >= CURRENT_DATE";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_promo, PDO::PARAM_INT);
            $stmt->bindParam(':active', $active, PDO::PARAM_BOOL);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function resetPromo($id_promo)
    {
        try {
            $query = "UPDATE promotions
                  SET refuse = 0, validé_par_admin = 0, actif = 0
                  WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_promo, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function deletePromo($id_promo)
    {
        try {
            $query = "DELETE FROM promotions WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_promo, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error deleting promo: " . $e->getMessage());
            return false;
        }
    }

    public function getPromo()
    {
        try {
            $this->updateExpiredPromos();

            // Sélectionner uniquement les promos créées par les admins
            $query = "SELECT p.*, u.user_prenom, u.user_nom,
                    CASE 
                        WHEN p.date_fin < CURRENT_DATE THEN 'expiré'
                        WHEN p.actif = 1 AND p.validé_par_admin = 1 AND p.refuse = 0 THEN 'actif'
                        ELSE 'inactif'
                    END as etat_actuel
                    FROM promotions p
                    LEFT JOIN users u ON p.vendeur_id = u.id_user
                    WHERE p.ajoute_par_admin = 1
                    ORDER BY 
                        CASE 
                            WHEN p.date_fin < CURRENT_DATE THEN 2
                            WHEN p.actif = 1 THEN 0
                            ELSE 1
                        END,
                        p.date_fin ASC";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting promos: " . $e->getMessage());
            return false;
        }
    }

    public function getVendorPromos()
    {
        try {
            $this->updateExpiredPromos();

            // Sélectionner uniquement les promos créées par les vendeurs
            $query = "SELECT p.*, u.user_prenom, u.user_nom,
                    CASE 
                        WHEN p.refuse = 1 THEN 'refusé'
                        WHEN p.validé_par_admin = 1 THEN 'validé'
                        ELSE 'en_attente'
                    END as status,
                    CASE
                        WHEN p.date_fin < CURRENT_DATE THEN 'expiré'
                        WHEN p.actif = 1 AND p.validé_par_admin = 1 AND p.refuse = 0 THEN 'actif'
                        ELSE 'inactif'
                    END as etat_actuel
                    FROM promotions p
                    LEFT JOIN users u ON p.vendeur_id = u.id_user
                    WHERE p.ajoute_par_admin = 0
                    AND p.est_globale = FALSE
                    ORDER BY p.date_creation DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error: " . $e->getMessage());
            return false;
        }
    }

    private function updateExpiredPromos()
    {
        try {
            // Mise à jour automatique des promos expirées
            $query = "UPDATE promotions 
                     SET actif = 0,
                         date_modification = CURRENT_TIMESTAMP
                     WHERE date_fin < CURRENT_DATE 
                     AND actif = 1";
            $stmt = $this->db->prepare($query);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error updating expired promos: " . $e->getMessage());
            return false;
        }
    }

    public function getPromoById($id_promo)
    {
        try {
            $query = "SELECT * FROM promotions WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id_promo, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function isPromoValid($code, $panier_produits)
    {
        try {
            // Mettre à jour les promos expirées avant de vérifier
            $this->updateExpiredPromos();

            $query = "SELECT promotions.*, users.id_user as vendeur_id 
                     FROM promotions 
                     LEFT JOIN users ON promotions.vendeur_id = users.id_user 
                     WHERE code = :code 
                     AND actif = TRUE 
                     AND validé_par_admin = TRUE 
                     AND date_debut <= CURRENT_DATE 
                     AND date_fin >= CURRENT_DATE";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':code', $code);
            $stmt->execute();
            $promo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$promo) {
                return ['valid' => false, 'message' => 'Code promo invalide ou expiré'];
            }

            // Vérifier si c'est une promo locale
            if (!$promo['est_globale']) {
                foreach ($panier_produits as $produit) {
                    if ($produit['vendeur_id'] != $promo['vendeur_id']) {
                        return ['valid' => false, 'message' => 'Code promo non applicable à tous les produits'];
                    }
                }
            }

            // Vérifier le montant minimum si défini
            if ($promo['condition_min'] > 0) {
                $total_panier = array_sum(array_column($panier_produits, 'prix_total'));
                if ($total_panier < $promo['condition_min']) {
                    return ['valid' => false, 'message' => 'Montant minimum non atteint'];
                }
            }

            return ['valid' => true, 'promo' => $promo];
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return ['valid' => false, 'message' => 'Erreur système'];
        }
    }
}
