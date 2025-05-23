<?php

namespace ApiCommande;

require_once '../models/Commande.php';
require_once '../config/Database.php';
require_once '../controllers/CommandeController.php';

use ControllerCommande\CommandeController;


class ApiCommande
{

    private $CommandeController;

    public function __construct()
    {
        $this->CommandeController = new CommandeController;
    }

    public function handleRequest()
    {
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        if ($requestMethod === 'GET') {
            $this->handleGetRequest();
        } elseif ($requestMethod === 'POST') {
            $this->handlePostRequest();
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }

    private function handlePostRequest()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['action']) && $data['action'] === 'addCommande') {
            if (!isset($_SESSION['user_id'])) {
                $this->sendResponse([
                    'success' => false,
                    'message' => 'Utilisateur non connecté'
                ], 401);
                return;
            }

            // Clean promo_id input
            $promo_id = isset($data['promo_id']) &&
                is_numeric($data['promo_id']) ?
                intval($data['promo_id']) : null;

            $id_commande = $this->CommandeController->AddCommande(
                $_SESSION['user_id'],
                $promo_id
            );

            if ($id_commande) {
                $this->sendResponse([
                    'success' => true,
                    'id_commande' => $id_commande,
                    'message' => 'Commande créée avec succès'
                ]);
            } else {
                $this->sendResponse([
                    'success' => false,
                    'message' => 'Erreur lors de la création de la commande'
                ], 500);
            }
            return;
        }

        if (!empty($data)) {
            if (isset($data['id'])) {
                $this->handleValideCommande($data);
                return;
            }
        }
        $this->sendResponse(['error' => 'Invalid request'], 400);
    }

    private function handleGetRequest()
    {
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        switch ($action) {
            case 'getCommandeByUser':
                if (isset($_SESSION['user_id'])) {
                    $id_user = $_SESSION['user_id'];
                    $commande = $this->CommandeController->getCommandeByUser($id_user);
                    if ($commande) {
                        $this->sendResponse(['success' => true, 'commande' => $commande]);
                    } else {
                        $this->sendResponse(['success' => false, 'message' => 'Aucune commande trouvée'], 404);
                    }
                } else {
                    $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
                }
                break;
            case 'getComandeById':
                $commande = $this->CommandeController->getComandeById($_GET['id']);
                if ($commande) {
                    $this->sendResponse(['success' => true, 'commande' => $commande]);
                } else {
                    $this->sendResponse(['success' => false, 'message' => 'Aucune commande trouvée'], 404);
                }
                break;
            case 'getAllCommandes':
                $commandes = $this->CommandeController->getAllCommandes();
                if ($commandes) {
                    $this->sendResponse(['success' => true, 'commandes' => $commandes]);
                } else {
                    $this->sendResponse(['success' => false, 'message' => 'Aucune commande trouvée']);
                }
                break;
            default:
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
                break;
        }
    }


    public function handleValideCommande($data)
    {
        if (!isset($data['id'])) {
            $this->sendResponse(['success' => false, 'message' => 'ID manquant'], 400);
            return;
        }

        $commande = $this->CommandeController->valideCommande($data['id']);
        if ($commande) {
            $this->sendResponse(['success' => true, 'message' => 'Commande envoyée']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Impossible de valider l\'envoi de la commande'], 404);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
