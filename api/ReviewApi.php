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
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'checkUserReview':

                    if (isset($_GET['productId'])) {
                        if (!isset($_SESSION['user_id'])) {
                            $this->sendResponse(['hasReview' => false]);
                            return;
                        }
                        $hasReview = $this->ReviewController->checkUserReview($_SESSION['user_id'], $_GET['productId']);
                        $this->sendResponse(['hasReview' => $hasReview]);
                        return;
                    }
                    break;
                    // ...existing code...
            }
        }

        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $this->getReveiwByProduct($_GET['id']);
        }

        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($action === 'getAllReview') {

            $review = $this->ReviewController->getAllReview();
            if ($review) {
                $this->sendResponse(['success' => true, 'review' => $review]);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Aucune reviewv trouvée'], 404);
            }
        } else {
            $this->sendResponse(['error' => 'Action non reconnue'], 400);
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

    private function AddReview()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'error' => 'Utilisateur non connecté'], 401);
            return;
        }

        if (!isset($_POST['productId']) || !isset($_POST['rating']) || !isset($_POST['comment'])) {
            $this->sendResponse(['success' => false, 'error' => 'Données manquantes'], 400);
            return;
        }

        $id_user = $_SESSION['user_id'];
        $id_produit = $_POST['productId'];
        $rating = $_POST['rating'];
        $commentaire = $_POST['comment'];

        if ($this->ReviewController->AddReview($id_user, $id_produit, $rating, $commentaire)) {
            $this->sendResponse(['success' => true, 'message' => 'Avis ajouté avec succès']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de l\'ajout de l\'avis'], 500);
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
