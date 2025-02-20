<?php

namespace Api;

require_once '../models/User.php';
require_once '../config/Database.php';
require_once '../controllers/UserController.php';

use Controllers\UserController;

class ApiUser
{
    private $UserController;

    public function __construct()
    {
        $this->UserController = new UserController();
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

    private function handleGetRequest()
    {
        // Vérification de la session active
        if (isset($_SESSION['user_id'])) {
            $id = $_SESSION['user_id'];  // Récupérer l'ID de l'utilisateur depuis la session
            $user = $this->UserController->getUserById($id);  // Utiliser le contrôleur pour récupérer l'utilisateur

            if ($user) {
                $this->sendResponse($user);  // Retourner les données utilisateur
            } else {
                $this->sendResponse(['error' => 'Utilisateur non trouvé'], 404);
            }
        } else {
            $this->sendResponse(['error' => 'Aucune session active'], 401);
        }
    }


    private function handlePostRequest()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['action']) && $data['action'] === 'login') {
            $this->handleLoginRequest($data);
        } else if ($data['action'] === 'EditMail') {
            $this->handleEdditMailRequest($data);
        } else {
            $this->handleRegisterRequest($data);
        }
    }

    private function handleEdditMailRequest($data)
    {
        if (empty($data['mail']) || empty($data['newMail'])) {
            $this->sendResponse(['success' => false, 'message' => 'Données invalides'], 400);
            return;
        }

        $result = $this->UserController->editMail($data['newMail'], $data['id']);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Mail modifié avec succès']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Échec de la modification du mail'], 500);
        }
    }

    private function handleRegisterRequest($data)
    {
        if (!$this->UserController->validateUserData($data)) {
            $this->sendResponse(['success' => false, 'message' => 'Données invalides'], 400);
            return;
        }

        $result = $this->UserController->createUser($data['nom'], $data['prenom'], $data['mail'], $data['password']);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Utilisateur ajouté avec succès']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Échec de l\'ajout de l\'utilisateur'], 500);
        }
    }

    private function handleLoginRequest($data)
    {
        if (!$this->UserController->validateLogin($data)) {
            $this->sendResponse(['success' => false, 'message' => 'Données invalides'], 400);
            return;
        }

        $result = $this->UserController->checkLogin($data['mail'], $data['password']);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Utilisateur connecté avec succès']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Échec de la connexion'], 401);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
