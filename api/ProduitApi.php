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
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['action']) && $data['action'] === 'AllProduit') {
            $this->handleGetAllRequest($data);
        } else if ($data['action'] === 'PruductByUser') {
            $this->handlePruductByUserRequest($data);
        }
    }


    private function handlePruductByUserRequest()
    {
        // Vérification de la session active
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id'];  // Récupérer l'ID de l'utilisateur depuis la session
            $produit = $this->ProduitController->getProduitByUserSeller($id_user);  // Utiliser le contrôleur pour récupérer l'utilisateur

            if ($produit) {
                $this->sendResponse($produit);  // Retourner les données utilisateur
            } else {
                $this->sendResponse(['error' => 'Utilisateur non trouvé'], 404);
            }
        } else {
            $this->sendResponse(['error' => 'Aucune session active'], 401);
        }
    }


    private function handleGetAllRequest()
    {
        $produit = $this->ProduitController->getAllProduit();  // Utiliser le contrôleur pour récupérer l'utilisateur
        if ($produit) {
            $this->sendResponse($produit);  // Retourner les données utilisateur
        } else {
            $this->sendResponse(['error' => 'Utilisateur non trouvé'], 404);
        }
    }



    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
