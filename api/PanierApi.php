<?php

namespace ApiPanier;

require_once '../models/Panier.php';
require_once '../config/Database.php';
require_once '../controllers/PanierController.php';

use ControllersPanier\PanierController;

class ApiPanier
{
    private $PanierController;

    public function __construct()
    {
        $this->PanierController = new PanierController();
    }

    public function handleRequest()
    {
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        if ($requestMethod === 'GET') {
            $this->handleGetPanierRequest();
        } elseif ($requestMethod === 'POST') {
            $this->handlePostPanierRequest();
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }
    private function handlePostPanierRequest()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['action']) && $data['action'] === 'addPanier') {
            $this->handleAddPanierRequest($data);
        } else if ($data['action'] === 'delete') {
            $this->handleClearPanierRequest($data);
        } else if ($data['action'] === 'validePanier') {
            $this->handleValidePanierRequest($data);
        } else {
            $this->sendResponse(['error' => 'Action non reconnue'], 400);
        }
    }
    private function handleGetPanierRequest()
    {
        // Vérifier si l'utilisateur est connecté (id utilisateur dans la session)
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id']; // Récupérer l'ID de l'utilisateur depuis la session

            // Si l'ID utilisateur est invalide ou inexistant, retourner une erreur
            if (!$id_user) {
                $this->sendResponse(['success' => false, 'message' => 'Aucun utilisateur trouvé dans la session'], 500);
                return;
            }

            // Utiliser le contrôleur pour récupérer les articles du panier de cet utilisateur
            $panier = $this->PanierController->getPanierByUser($id_user);

            // Si des articles sont trouvés dans le panier
            if ($panier) {
                $this->sendResponse(['success' => true, 'message' => 'Panier récupéré avec succès', 'panier' => $panier]);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Panier vide ou erreur lors de la récupération des articles']);
            }
        } else {
            // Si la session utilisateur n'est pas trouvée, retourner une erreur
            $this->sendResponse(['success' => false, 'message' => 'Aucune session utilisateur active']);
        }
    }

    private function handleAddPanierRequest($data)
    {
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id'];
            $result = $this->PanierController->addToPanier($id_user, $data['id_produit'], $data['quantite']);

            if ($result) {
                $this->sendResponse(['success' => true, 'message' => 'Produit ajoute au panier']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Échec de l\'ajout au panier'], 500);
            }
        } else {
            $this->sendResponse(['error' => 'Connectez vous pour ajoute au panier'], 401);
        }
    }
    public function handleValidePanierRequest($data)
    {
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id'];
            $result = $this->PanierController->validePanier($id_user, $data['id_commande']);

            if ($result) {
                $this->sendResponse(['success' => true, 'message' => 'Produit valide au panier']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Échec de la validation du produit au panier'], 500);
            }
        } else {
            $this->sendResponse(['error' => 'Connectez vous pour ajoute au panier'], 401);
        }
    }
    private function handleClearPanierRequest($data)
    {
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id'];
            $result = $this->PanierController->clearPanier($id_user, $data['id_produit']);

            if ($result) {
                $this->sendResponse(['success' => true, 'message' => 'Produit suprime du panier']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Échec de la suppresion du produit au panier'], 500);
            }
        } else {
            $this->sendResponse(['error' => 'Connectez vous pour ajoute au panier'], 401);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
