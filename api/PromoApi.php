<?php

namespace ApiPromo;

require_once '../controllers/PromoController.php';
require_once '../config/Database.php';


use PDOException;
use Exception;
use ControllersPromo\PromoController;

class PromoApi
{
    private $promoController;

    public function __construct()
    {
        $this->promoController = new PromoController();
    }

    public function handleRequest($postData = null)
    {
        $action = $_GET['action'] ?? null;

        switch ($action) {

            case 'getPromo': // Add support for 'getPromo' action
                $this->getAllPromos();
                break;
            case 'getPromoById':
                $this->getPromoById($_GET['id'] ?? null);
                break;
            case 'createPromo':
                $this->createPromo($postData);
                break;
            case 'updatePromo':
                $this->updatePromo($postData);
                break;
            case 'deletePromo':
                $this->deletePromo($postData);
                break;
            case 'setActive':
                $this->setActive($postData);
                break;
            case 'getVendorPromos':
                $this->getVendorPromos();
                break;
            case 'validateVendorPromo':
                $this->validateVendorPromo($postData);
                break;
            case 'refuseVendorPromo':
                $this->refuseVendorPromo($postData);
                break;
            case 'resetVendorPromo':
                $this->resetVendorPromo($postData);
                break;
            case 'getUserPromos':
                $this->getUserPromos();
                break;
            case 'createUserPromo':
                $this->createUserPromo($postData);
                break;
            case 'updateUserPromo':
                $this->updateUserPromo($postData);
                break;
            default:
                $this->sendResponse(['error' => 'Unknown action'], 400);
        }
    }

    private function getAllPromos()
    {
        $promos = $this->promoController->getAllPromos();
        $this->sendResponse(['success' => true, 'promos' => $promos]);
    }

    private function getPromoById($id)
    {
        if (!$id) {
            $this->sendResponse(['error' => 'ID is required'], 400);
            return;
        }

        $promo = $this->promoController->getPromoById($id);
        if ($promo) {
            $this->sendResponse(['success' => true, 'promo' => $promo]);
        } else {
            $this->sendResponse(['error' => 'Promo not found'], 404);
        }
    }

    private function createPromo($data)
    {
        try {
            $promoData = [
                'code' => trim($_POST['code']),
                'nom_promo' => htmlspecialchars($_POST['nom_promo']),
                'description' => htmlspecialchars($_POST['description']),
                'date_debut' => $_POST['date_debut'],
                'date_fin' => $_POST['date_fin'],
                'reduction_value' => floatval($_POST['reduction_value']),
                'type_reduction' => $_POST['type_reduction'],
                'montant_max' => floatval($_POST['montant_max'] ?: 0),
                'condition_min' => floatval($_POST['condition_min'] ?: 0),
                'actif' => 1,
                'refuse' => 0,
                'ajoute_par_admin' => 1,  // Always set to 1 for admin-created promos
                'validé_par_admin' => 1,
                'vendeur_id' => null,
                'est_globale' => 1,
                'nbreUtilisationCode' => 0
            ];

            // Validation des données requises
            if (empty($promoData['code']) || empty($promoData['type_reduction'])) {
                $this->sendResponse(['error' => 'Missing required fields'], 400);
                return;
            }

            if ($this->promoController->createPromo($promoData)) {
                $this->sendResponse(['success' => true, 'message' => 'Promo created successfully']);
            } else {
                $this->sendResponse(['error' => 'Failed to create promo'], 500);
            }
        } catch (PDOException $e) {
            error_log("Error in createPromo: " . $e->getMessage());
            $this->sendResponse(['error' => 'Internal server error'], 500);
        }
    }

    private function updatePromo($data)
    {
        $id = isset($_POST['id']) ? $_POST['id'] : null;
        if (!$id) {
            $this->sendResponse(['error' => 'ID is required'], 400);
            return;
        }

        $updateData = [
            'code' => $_POST['code'] ?? '',
            'nom_promo' => $_POST['nom_promo'] ?? '',
            'description' => $_POST['description'] ?? '',
            'date_debut' => $_POST['date_debut'] ?? null,
            'date_fin' => $_POST['date_fin'] ?? null,
            'reduction_value' => $_POST['reduction_value'] ?? 0,
            'type_reduction' => $_POST['type_reduction'] ?? '',
            'montant_max' => $_POST['montant_max'] ?? null,
            'condition_min' => $_POST['condition_min'] ?? null,
            'ajoute_par_admin' => 1  // Ensure it stays marked as admin-created
        ];

        if ($this->promoController->updatePromo($id, $updateData)) {
            $this->sendResponse(['success' => true, 'message' => 'Promo updated successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to update promo'], 500);
        }
    }

    private function deletePromo($data)
    {
        // Vérifier si l'ID est présent dans POST ou GET
        $id = isset($_POST['id']) ? $_POST['id'] : (isset($data['id']) ? $data['id'] : null);

        if (!$id) {
            $this->sendResponse(['error' => 'ID is required'], 400);
            return;
        }

        $id = filter_var($id, FILTER_VALIDATE_INT);
        if ($id === false) {
            $this->sendResponse(['error' => 'Invalid ID format'], 400);
            return;
        }

        $result = $this->promoController->deletePromo($id);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promo deleted successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to delete promo'], 500);
        }
    }

    private function setActive($data)
    {
        // Vérifier si l'ID est présent dans POST ou GET
        $id = isset($_POST['id']) ? $_POST['id'] : (isset($data['id']) ? $data['id'] : null);

        if (!$id) {
            $this->sendResponse(['error' => 'ID is required'], 400);
            return;
        }

        $id = filter_var($id, FILTER_VALIDATE_INT);
        if ($id === false) {
            $this->sendResponse(['error' => 'Invalid ID format'], 400);
            return;
        }

        $result = $this->promoController->togglePromoStatus($id);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promo status updated successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to update promo status'], 500);
        }
    }

    private function getVendorPromos()
    {
        try {
            $promos = $this->promoController->getVendorPromos();
            if ($promos === false) {
                $this->sendResponse(['error' => 'Failed to fetch vendor promos'], 500);
                return;
            }
            $this->sendResponse(['success' => true, 'promos' => $promos]);
        } catch (PDOException $e) {
            error_log("Error in getVendorPromos: " . $e->getMessage());
            $this->sendResponse(['error' => 'Internal server error'], 500);
        }
    }

    private function validateVendorPromo($data)
    {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) {
            $this->sendResponse(['error' => 'Invalid promo ID'], 400);
            return;
        }

        if ($this->promoController->validateVendorPromo($id)) {
            $this->sendResponse(['success' => true, 'message' => 'Promo validated successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to validate promo'], 500);
        }
    }

    private function refuseVendorPromo($data)
    {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) {
            $this->sendResponse(['error' => 'Invalid promo ID'], 400);
            return;
        }

        if ($this->promoController->refuseVendorPromo($id)) {
            $this->sendResponse(['success' => true, 'message' => 'Promo refused successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to refuse promo'], 500);
        }
    }

    private function resetVendorPromo($data)
    {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) {
            $this->sendResponse(['error' => 'Invalid promo ID'], 400);
            return;
        }

        if ($this->promoController->resetVendorPromo($id)) {
            $this->sendResponse(['success' => true, 'message' => 'Promo reset successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to reset promo'], 500);
        }
    }

    private function getUserPromos()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['error' => 'User not logged in'], 401);
            return;
        }

        $promos = $this->promoController->getUserPromos($_SESSION['user_id']);
        if ($promos !== false) {
            $this->sendResponse(['success' => true, 'promos' => $promos]);
        } else {
            $this->sendResponse(['error' => 'Failed to fetch promos'], 500);
        }
    }

    private function createUserPromo($data)
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['error' => 'User not logged in'], 401);
            return;
        }

        try {
            $promoData = $this->sanitizePromoData($_POST);

            // Check if code is unique
            if (!$this->promoController->isCodeUnique($promoData['code'])) {
                $this->sendResponse(['error' => 'Code promo déjà utilisé'], 400);
                return;
            }

            if ($this->promoController->createUserPromo($promoData, $_SESSION['user_id'])) {
                $this->sendResponse(['success' => true, 'message' => 'Promo created successfully']);
            } else {
                $this->sendResponse(['error' => 'Failed to create promo'], 500);
            }
        } catch (Exception $e) {
            $this->sendResponse(['error' => $e->getMessage()], 500);
        }
    }

    private function updateUserPromo($data)
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['error' => 'User not logged in'], 401);
            return;
        }

        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) {
            $this->sendResponse(['error' => 'Invalid promo ID'], 400);
            return;
        }

        try {
            $promoData = [
                'code' => trim($_POST['code'] ?? ''),
                'nom_promo' => htmlspecialchars($_POST['nom_promo'] ?? ''),
                'description' => htmlspecialchars($_POST['description'] ?? ''),
                'date_debut' => $_POST['date_debut'] ?? null,
                'date_fin' => $_POST['date_fin'] ?? null,
                'reduction_value' => floatval($_POST['reduction_value'] ?? 0),
                'type_reduction' => $_POST['type_reduction'] ?? '',
                'montant_max' => floatval($_POST['montant_max'] ?? 0),
                'condition_min' => floatval($_POST['condition_min'] ?? 0),
                'vendeur_id' => $_SESSION['user_id']
            ];

            if ($this->promoController->updateUserPromo($id, $promoData, $_SESSION['user_id'])) {
                $this->sendResponse(['success' => true, 'message' => 'Promo updated successfully']);
            } else {
                $this->sendResponse(['error' => 'Le code promotionnel existe déjà ou vous n\'êtes pas autorisé à modifier cette promotion'], 400);
            }
        } catch (Exception $e) {
            error_log("Error in updateUserPromo: " . $e->getMessage());
            $this->sendResponse(['error' => 'Internal server error'], 500);
        }
    }

    private function sanitizePromoData($postData)
    {
        $typeReduction = $postData['type_reduction'] ?? '';
        $data = [
            'code' => trim($postData['code'] ?? ''),
            'nom_promo' => htmlspecialchars($postData['nom_promo'] ?? ''),
            'description' => htmlspecialchars($postData['description'] ?? ''),
            'date_debut' => $postData['date_debut'] ?? null,
            'date_fin' => $postData['date_fin'] ?? null,
            'reduction_value' => floatval($postData['reduction_value'] ?? 0),
            'type_reduction' => $typeReduction,
            'condition_min' => floatval($postData['condition_min'] ?? 0),
            'actif' => 0,
            'refuse' => 0,
            'validé_par_admin' => 0,
            'est_globale' => 0,
            'nbreUtilisationCode' => 0
        ];

        // Only add montant_max for percentage type reductions
        if ($typeReduction === 'pourcentage') {
            $data['montant_max'] = floatval($postData['montant_max'] ?? 0);
        } else {
            $data['montant_max'] = null;
        }

        return $data;
    }

    private function sendResponse($data, $statusCode = 200)
    {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
