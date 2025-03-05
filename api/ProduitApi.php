<?php

namespace ApiP;

require_once '../models/Produit.php';
require_once '../config/Database.php';
require_once '../controllers/ProduitController.php';

use ControllersP\ProduitController;

class ApiProduit
{
    private $ProduitController;

    public function __construct()
    {
        $this->ProduitController = new ProduitController();
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
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['action']) && $data['action'] === 'addProduit') {
            $this->handleAddProduitToSell($data);
        } else if ($data['action'] === 'editProduit') {
            $this->handleEditProduit($data);
        }
    }

    private function handleAddProduitToSell($data)
    {
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id']; // Récupérer l'ID de 
            if (!$id_user) {
                $this->sendResponse(['success' => false, 'message' => 'Aucun utilisateur trouvé dans la session'], 500);
                return;
            }

            $addProduit = $this->ProduitController->addProduitToSell($id_user, $data['nom'], $data['description'], $data['prix'], $data['quantite'], $data['img'], $data['category'], $data['actif']);

            if ($addProduit) {
                $this->sendResponse(['success' => true, 'message' => 'Produit ajoute a la vente']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'impossible d ajoute produit a la vente']);
            }
        }
    }

    //afaire pour eddit produit en vente
    private function handleEditProduit() {}

    private function handleGetRequest()
    {
        $produit = $this->ProduitController->getAllProduit();  // Utiliser le contrôleur pour récupérer tous les produits
        if ($produit) {
            $this->sendResponse($produit);  // Retourner les données des produits
        } else {
            $this->sendResponse(['error' => 'Aucun produit trouvé'], 404);
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
