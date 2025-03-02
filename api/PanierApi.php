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
        } else if ($data['action'] === 'update') {
            $this->handleUpdatePanierRequest($data);
        }
    }
    private function handleGetPanierRequest()
    {
        if (isset($_SESSION['user_id'])) {
            $id = $_SESSION['user_id'];  // Récupérer l'ID de l'utilisateur depuis la session
            $panier = $this->PanierController->getPanierByUser($id);  // Utiliser le contrôleur pour récupérer l'utilisateur

            if ($panier) {
                $this->sendResponse($panier);  // Retourner les données utilisateur
            } else {
                $this->sendResponse(['error' => 'Aucun panier trouvé'], 404);
            }
        } else {
            $this->sendResponse(['error' => 'Connectez vous pour ajoute au panier'], 401);
        }
    }
    private function handleAddPanierRequest($data)
    {

        $result = $this->PanierController->addToPanier($data['id_user'], $data['id_produit'], $data['quantite']);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Produit ajoute au panier']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Échec de l\'ajout au panier'], 500);
        }
    }
    private function handleUpdatePanierRequest($data)
    {

        $result = $this->PanierController->clearPanier($data['id_user'], $data['id_produit'], $data['quantite']);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Produit suprime du panier']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Échec de la suppresion du produit au panier'], 500);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
