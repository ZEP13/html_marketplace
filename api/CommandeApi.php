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

    public function handlePostRequest()
    {
        // Pas besoin de json_decode, car nous utilisons multipart/form-data
        if (isset($_POST['action']) && $_POST['action'] === 'addCommande') {
            $this->handleAddCommande($_POST);  // Envoi directement avec $_POST
        }
    }

    private function handleGetRequest()
    {
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($action === 'getCommandeByUser') {
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
        } else {
            $this->sendResponse(['error' => 'Action non reconnue'], 400);
        }
    }

    public function handleAddCommande($data)
    {
        $commande = $this->CommandeController->AddCommande($data['id_user'], $data['id_produit']);
        if ($commande) {
            $this->sendResponse(['success' => true, 'message' => 'Commande valide']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'impossible de passe commande'], 404);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
