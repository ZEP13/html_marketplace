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
        if (isset($_POST['action']) && $_POST['action'] === 'addImgProfil') {
            $this->handleaddImgProfilRequest($_POST);
        } else {
            $data = json_decode(file_get_contents('php://input'), true);

            if (isset($data['action']) && $data['action'] === 'login') {
                $this->handleLoginRequest($data);
            } else if ($data['action'] === 'EditMail') {
                $this->handleEdditMailRequest($data);
            } else if ($data['action'] === 'logout') {
                $this->handleLogoutRequest();
            } else {
                $this->handleRegisterRequest($data);
            }
        }
    }

    private function handleaddImgProfilRequest($data)
    {
        // Chemin du dossier où les images sont stockées
        $uploadDir = '../img/imgUserProfil/';

        // Vérifier si le dossier existe et le créer si nécessaire
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);  // Créer le dossier s'il n'existe pas
        }

        // Sécurisation du nom de fichier (générer un nom unique)
        $fileName = uniqid(time(), true) . '.' . pathinfo($_FILES['profileImage']['name'], PATHINFO_EXTENSION);
        $uploadFile = $uploadDir . $fileName;

        // Vérifier si le fichier est bien une image
        if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] == 0) {

            // Vérifier le type MIME du fichier
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (in_array($_FILES['profileImage']['type'], $allowedTypes)) {

                // Vérifier la taille du fichier (par exemple 2 MB max)
                $maxFileSize = 2 * 1024 * 1024; // 2 MB
                if ($_FILES['profileImage']['size'] > $maxFileSize) {
                    $this->sendResponse(['success' => false, 'message' => 'Le fichier est trop volumineux']);
                    return;
                }

                // Déplacer le fichier vers le répertoire cible
                if (move_uploaded_file($_FILES['profileImage']['tmp_name'], $uploadFile)) {
                    // Ajouter l'URL du fichier dans la base de données
                    $result = $this->UserController->addImgProfil($fileName, $_SESSION['user_id']);  // Utiliser l'ID utilisateur de la session
                    if ($result) {
                        $this->sendResponse([
                            'success' => true,
                            'newProfileImageUrl' => $uploadFile,  // Ou l'URL complète si vous voulez
                        ]);
                    } else {
                        $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la mise à jour en base de données']);
                    }
                } else {
                    $this->sendResponse(['success' => false, 'message' => 'Erreur lors de l\'upload']);
                }
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Fichier invalide']);
            }
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Aucun fichier reçu']);
        }
    }

    private function handleLogoutRequest()
    {
        if (isset($_SESSION['user_id'])) {

            session_unset();
            session_destroy();

            $this->sendResponse(['success' => true, 'message' => 'Déconnexion réussie']);
        } else {
            $this->sendResponse(['success' => true, 'message' => 'erreur de deconnexion']);
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
