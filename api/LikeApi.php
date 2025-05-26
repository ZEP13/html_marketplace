<?php

namespace ApiLike;

require_once '../models/Like.php';
require_once '../config/Database.php';
require_once '../controllers/LikeController.php';

use ControllersLike\LikeController;

class ApiLike
{
    private $likeController;

    public function __construct()
    {
        $this->likeController = new LikeController();
    }

    public function handleRequest()
    {
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        if ($requestMethod === 'POST') {
            $this->handlePostRequest();
        } elseif ($requestMethod === 'GET') {
            $this->handleGetRequest();
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }

    private function handlePostRequest()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
            return;
        }

        if (isset($data['action']) && $data['action'] === 'addLike') {
            if (isset($data['id_produit_like'])) {
                $result = $this->likeController->addLike($_SESSION['user_id'], intval($data['id_produit_like']));
                $this->sendResponse(['success' => $result, 'message' => $result ? 'Produit liké' : 'Erreur lors de l\'ajout du like']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Paramètre manquant'], 400);
            }
        } elseif (isset($data['action']) && $data['action'] === 'deleteLike') {
            if (isset($data['id_produit_like'])) {
                $result = $this->likeController->removeLike($_SESSION['user_id'], intval($data['id_produit_like']));
                $this->sendResponse(['success' => $result, 'message' => $result ? 'Produit retiré des likes' : 'Erreur lors de la suppression du like']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Paramètre manquant'], 400);
            }
        } else {
            $this->sendResponse(['error' => 'Action non reconnue'], 400);
        }
    }

    private function handleGetRequest()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
            return;
        }

        $likes = $this->likeController->getLikesByUser($_SESSION['user_id']);
        $this->sendResponse(['success' => true, 'likes' => $likes]);
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
