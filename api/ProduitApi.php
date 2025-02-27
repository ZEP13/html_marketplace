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

    private function handlePostRequest() {}

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
