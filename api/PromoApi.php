<?php

namespace ApiPromo;

require_once '../controllers/PromoController.php';

use ControllersPromo\PromoController;

class ApiPromo
{
    private $PromoController;

    public function __construct()
    {
        $this->PromoController = new PromoController();
    }

    public function handleRequest()
    {
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'getPromo') {
                $this->getPromo();
            } else if ($action === 'getPromoById') {
                $this->getPromoById($_GET['id']);
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($action === 'addPromo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleAddPromoRequest($data);
            } elseif ($action === 'validatePromo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleValidatePromoRequest($data);
            } elseif ($action === 'updatePromo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleUpdatePromoRequest($data);
            } elseif ($action === 'setActive') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleSetActiveRequest($data);
            } elseif ($action === 'applyPromo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleApplyPromoRequest($data);
            } elseif ($action === 'refusePromo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleRefusePromoRequest($data);
            } elseif ($action === 'resetPromo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleResetPromoRequest($data);
            } elseif ($action === 'deletePromo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleDeletePromoRequest($data);
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }

    private function getPromo()
    {
        // Déterminer si on doit récupérer les promos admin ou vendeur
        $isAdmin = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
        if ($isAdmin && isset($_GET['type']) && $_GET['type'] === 'vendor') {
            $promos = $this->PromoController->getVendorPromos();
        } else {
            $promos = $this->PromoController->getPromo();
        }

        if ($promos) {
            $this->sendResponse([
                'success' => true,
                'promos' => $promos,
                'isAdmin' => $isAdmin
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Aucune promotion trouvée'
            ], 404);
        }
    }

    private function getPromoById($id)
    {
        if (!isset($id)) {
            $this->sendResponse(['success' => false, 'message' => 'ID manquant'], 400);
            return;
        }

        $promo = $this->PromoController->getPromoById($id);
        if ($promo) {
            $this->sendResponse([
                'success' => true,
                'promo' => $promo
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Promotion non trouvée'
            ], 404);
        }
    }

    private function validatePromoData($data)
    {
        // Validation de base des champs requis
        $requiredFields = [
            'code',
            'nom_promo',
            'description',
            'date_debut',
            'date_fin',
            'reduction_value',
            'type_reduction'
        ];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return ['valid' => false, 'message' => "Le champ $field est requis"];
            }
        }

        // Validation des dates
        $today = date('Y-m-d');
        if ($data['date_debut'] < $today) {
            return ['valid' => false, 'message' => 'La date de début doit être égale ou postérieure à aujourd\'hui'];
        }

        if ($data['date_fin'] < $data['date_debut']) {
            return ['valid' => false, 'message' => 'La date de fin doit être postérieure à la date de début'];
        }

        return ['valid' => true];
    }

    private function handleAddPromoRequest($data)
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Vérifier si l'utilisateur est admin (cas insensible)
        if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'admin') {
            $this->sendResponse([
                'success' => false,
                'message' => 'Accès réservé aux administrateurs',
                'debug' => [
                    'role' => $_SESSION['user_role'] ?? 'non défini'
                ]
            ], 403);
            return;
        }

        $validation = $this->validatePromoData($data);
        if (!$validation['valid']) {
            $this->sendResponse(['success' => false, 'message' => $validation['message']], 400);
            return;
        }

        // Valeurs par défaut et forçage pour promo admin
        $data['est_globale'] = true;
        $data['vendeur_id'] = null;
        $data['montant_max'] = $data['montant_max'] ?? null;
        $data['condition_min'] = $data['condition_min'] ?? 0;

        $result = $this->PromoController->createPromo($data);

        if ($result) {
            $this->sendResponse([
                'success' => true,
                'message' => 'Promotion créée avec succès'
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors de la création'
            ], 500);
        }
    }

    private function handleValidatePromoRequest($data)
    {
        if (!isset($data['id_promo'])) {
            $this->sendResponse(['success' => false, 'message' => 'ID promo manquant'], 400);
            return;
        }

        $result = $this->PromoController->validatePromo($data['id_promo']);
        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promotion validée']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la validation'], 500);
        }
    }

    private function handleUpdatePromoRequest($data)
    {
        $validation = $this->validatePromoData($data);
        if (!$validation['valid']) {
            $this->sendResponse(['success' => false, 'message' => $validation['message']], 400);
            return;
        }

        // Valeurs par défaut pour les champs optionnels
        $montant_max = isset($data['montant_max']) ? $data['montant_max'] : null;
        $condition_min = isset($data['condition_min']) ? $data['condition_min'] : 0;

        $result = $this->PromoController->updatePromo(
            $data['id_promo'],
            $data['code'],
            $data['nom_promo'],
            $data['description'],
            $data['date_debut'],
            $data['date_fin'],
            $data['reduction_value'],
            $data['type_reduction'],
            $montant_max,
            $condition_min
        );

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promotion mise à jour']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la mise à jour'], 500);
        }
    }

    private function handleSetActiveRequest($data)
    {
        if (!isset($data['id_promo'], $data['active'])) {
            $this->sendResponse(['success' => false, 'message' => 'Données manquantes'], 400);
            return;
        }

        $result = $this->PromoController->setPromoActive($data['id_promo'], $data['active']);
        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Statut de la promotion modifié']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la modification'], 500);
        }
    }

    public function handleApplyPromoRequest($data)
    {
        if (!isset($data['code']) || !isset($data['panier_produits'])) {
            $this->sendResponse(['success' => false, 'message' => 'Données manquantes'], 400);
            return;
        }

        $result = $this->PromoController->applyPromoToCart($data['code'], $data['panier_produits']);

        if ($result['valid']) {
            $this->sendResponse([
                'success' => true,
                'message' => 'Code promo appliqué',
                'promo' => $result['promo']
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => $result['message']
            ], 400);
        }
    }

    private function handleRefusePromoRequest($data)
    {
        if (!isset($data['id_promo'])) {
            $this->sendResponse(['success' => false, 'message' => 'ID promo manquant'], 400);
            return;
        }

        $result = $this->PromoController->refusePromo($data['id_promo']);
        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promotion refusée']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors du refus'], 500);
        }
    }

    private function handleResetPromoRequest($data)
    {
        if (!isset($data['id_promo'])) {
            $this->sendResponse(['success' => false, 'message' => 'ID promo manquant'], 400);
            return;
        }

        $result = $this->PromoController->resetPromo($data['id_promo']);
        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promotion réinitialisée']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la réinitialisation'], 500);
        }
    }

    private function handleDeletePromoRequest($data)
    {
        if (!isset($data['id_promo'])) {
            $this->sendResponse(['success' => false, 'message' => 'ID promo manquant'], 400);
            return;
        }

        $result = $this->PromoController->deletePromo($data['id_promo']);
        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promotion supprimée']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la suppression'], 500);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}

// Instantiate and handle the request
$api = new ApiPromo();
$api->handleRequest();
