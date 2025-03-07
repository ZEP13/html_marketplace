<?php

namespace ApiReview;

require_once '../models/Review.php';

require_once '../config/Database.php';
require_once '../controllers/ReviewController.php';

use ControllersReview\ReviewController;


class ApiReview
{
    private $ReviewController;

    public function __construct()
    {
        $this->ReviewController = new ReviewController();
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
        if (isset($_POST['action']) && $_POST['action'] === 'addReview') {
            $this->AddReview($_POST);  // Envoi directement avec $_POST
        }
    }

    private function handleGetRequest()
    {
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $this->getReveiwByProduct($_GET['id']);
        }
    }

    private function getReveiwByProduct($id)
    {
        $review = $this->ReviewController->getReveiwByProduct($id);  // Utiliser le contrôleur pour récupérer le produit par ID
        if ($review) {
            $this->sendResponse($review);  // Retourner les données du produit
        } else {
            $this->sendResponse(['error' => 'Aucun produit trouvé'], 404);
        }
    }

    private function AddReview() {}

    private function sendResponse($data, $statusCode = 200)
    {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
