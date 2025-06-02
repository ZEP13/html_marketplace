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
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'getUser') {
                $this->getUser();
            } else if ($action === 'getUserById') {
                $this->getUserById($_GET['id']);
            } else if ($action === 'getSessionId') {
                $this->handlegetSessionId();
            } else if ($action === 'getSession') {
                $this->handlegetSession();
            } else if ($action === 'getAllUsers') {
                $this->getAllUsers();
            } else if ($action === 'getVentesUser') {
                $this->handleGetVentesUser();
            } else if ($action === 'checkChatBan') {
                $this->handleCheckChatBan();
            } else if ($action === 'promoStat') {
                $this->handlePromoStat();
            } else if ($action === 'checkAdminRole') {
                $isAdmin = $this->UserController->checkAdminRole();
                $this->sendResponse([
                    'success' => true,
                    'isAdmin' => $isAdmin,
                    'debug' => [
                        'session_exists' => isset($_SESSION),
                        'user_role' => $_SESSION['user_role'] ?? 'non défini'
                    ]
                ]);
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($action === 'login') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleLoginRequest($data);
            } elseif ($action === 'register') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleRegisterRequest($data);
            } elseif ($action === 'logout') {
                $this->handleLogoutRequest();
            } elseif ($action === 'editMail') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleEditMailRequest($data);
            } elseif ($action === 'addImgProfil') {
                $this->handleAddImgProfilRequest($_POST);
            } else if ($action === 'addInfo') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleAddInfoUser($_POST);
            } else if ($action === 'changeRole') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleChangeRole($data);
            } else if ($action === 'banUser') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleBanUser($data);
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }

    private function getUser()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['error' => 'Non connecté'], 401);
            return;
        }

        $user = $this->UserController->getUserById($_SESSION['user_id']);

        if ($user) {
            // Assurons-nous que le rôle est correctement inclus
            $this->sendResponse([
                'success' => true,
                'id' => $user->id,
                'role' => $user->role, // S'assurer que le rôle est envoyé
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'mail' => $user->mail,
                'imgProfil' => $user->img,
            ]);
        } else {
            $this->sendResponse(['error' => 'Utilisateur non trouvé'], 404);
        }
    }

    private function getUserById($id)
    {
        $user = $this->UserController->getUserById($id);
        if ($user) {
            $this->sendResponse([
                'success' => true,
                'user' => $user
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'error' => 'Utilisateur non trouvé'
            ], 404);
        }
    }
    private function handleAddInfoUser($data)
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
            return;
        }

        // Récupérer le contenu JSON brut
        $jsonData = json_decode(file_get_contents('php://input'), true);

        if (!$jsonData) {
            $this->sendResponse([
                'success' => false,
                'message' => 'Données invalides'
            ], 400);
            return;
        }

        // Vérifier que toutes les données requises sont présentes
        $requiredFields = ['tel', 'rue', 'numero', 'code', 'city'];
        foreach ($requiredFields as $field) {
            if (!isset($jsonData[$field]) || empty($jsonData[$field])) {
                $this->sendResponse([
                    'success' => false,
                    'message' => "Le champ $field est requis"
                ], 400);
                return;
            }
        }

        $result = $this->UserController->addUserData(
            $_SESSION['user_id'],
            $jsonData['tel'],
            $jsonData['rue'],
            $jsonData['numero'],
            $jsonData['code'],
            $jsonData['city']
        );

        if ($result) {
            $this->sendResponse([
                'success' => true,
                'message' => 'Informations de commande ajoutées avec succès'
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Échec de l\'ajout des informations'
            ], 500);
        }
    }
    private function handleLoginRequest($data)
    {
        if (!$this->UserController->validateLogin($data)) {
            $this->sendResponse(['success' => false, 'message' => 'Données invalides'], 400);
            return;
        }

        $userData = $this->UserController->checkLogin($data['mail'], $data['password']);

        if ($userData) {
            $response = [
                'success' => true,
                'message' => 'Utilisateur connecté avec succès',
                'role' => $userData['role']
            ];
            $this->sendResponse($response);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Échec de la connexion'], 401);
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

    private function handleLogoutRequest()
    {
        if (isset($_SESSION['user_id'])) {
            session_unset();
            session_destroy();
            $this->sendResponse(['success' => true, 'message' => 'Déconnexion réussie']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Aucune session active'], 400);
        }
    }

    private function handleEditMailRequest($data)
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
    public function handlegetSession()
    {
        if (isset($_SESSION['user_id'])) {
            $response = [
                'success' => true,
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ];
        }
        $this->sendResponse($response);
    }
    public function handlegetSessionId()
    {
        if (isset($_SESSION['user_id'])) {
            $response = [
                'success' => true,
                'id' => $_SESSION['user_id']
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ];
        }
        $this->sendResponse($response);
    }
    private function handleAddImgProfilRequest($data)
    {
        // Chemin du dossier où les images sont stockées
        $uploadDir = '../img/imgUserProfil/';

        // Vérifier si le dossier existe et le créer si nécessaire
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);  // Créer le dossier s'il n'existe pas
        }

        // Vérifier si le fichier est bien une image
        if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] == 0) {

            // Sécurisation du nom de fichier (générer un nom unique)
            $fileName = uniqid(time(), true) . '.' . pathinfo($_FILES['profileImage']['name'], PATHINFO_EXTENSION);
            $uploadFile = $uploadDir . $fileName;

            // Vérifier le type MIME du fichier
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (in_array($_FILES['profileImage']['type'], $allowedTypes)) {

                // Vérifier la taille du fichier (par exemple 2 MB max)
                $maxFileSize = 2 * 1024 * 1024; // 2 MB
                if ($_FILES['profileImage']['size'] > $maxFileSize) {
                    $this->sendResponse(['success' => false, 'message' => 'Le fichier est trop volumineux']);
                    return;
                }

                // Récupérer l'ancienne image depuis la base de données ou la session
                // Supposons que la méthode getUserProfileImage() renvoie l'URL de l'ancienne image.
                $oldProfileImage = $this->UserController->getUserProfileImage($_SESSION['user_id']);

                // Si une ancienne image existe, la supprimer
                if ($oldProfileImage && file_exists($oldProfileImage)) {
                    unlink($oldProfileImage);  // Supprimer le fichier de l'ancienne image
                }

                // Déplacer le fichier vers le répertoire cible
                if (move_uploaded_file($_FILES['profileImage']['tmp_name'], $uploadFile)) {
                    // Ajouter l'URL du fichier dans la base de données
                    $result = $this->UserController->addImgProfil($uploadFile, $_SESSION['user_id']);  // Utiliser l'ID utilisateur de la session
                    if ($result) {
                        $this->sendResponse([
                            'success' => true,
                            'newProfileImageUrl' => $uploadFile,  // Ou l'URL complète si vous voulez
                            'message' => 'PP modifiée avec succès'
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
            // Si aucun fichier n'est envoyé, réinitialiser l'image à l'image par défaut (et ajouter cette information dans la base de données)
            $result = $this->UserController->addImgProfil('', $_SESSION['user_id']);  // Enregistrer une valeur vide dans la base de données

            if ($result) {
                // Réinitialiser l'image de profil à l'image par défaut (lien sans mise à jour en base de données)
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Image de profil réinitialisée à l\'image par défaut'
                ]);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la réinitialisation de la photo de profil']);
            }
        }
    }

    private function getAllUsers()
    {
        $users = $this->UserController->getAllUsers();
        if ($users) {
            $this->sendResponse([
                'success' => true,
                'users' => $users
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs'
            ], 500);
        }
    }

    private function handleChangeRole($data)
    {
        if (empty($data['userId']) || empty($data['role'])) {
            $this->sendResponse([
                'success' => false,
                'message' => 'Données manquantes'
            ], 400);
            return;
        }

        $result = $this->UserController->changeUserRole($data['userId'], $data['role']);
        if ($result) {
            $this->sendResponse([
                'success' => true,
                'message' => 'Rôle modifié avec succès'
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors de la modification du rôle'
            ], 500);
        }
    }

    private function handleBanUser($data)
    {
        if (empty($data['userId']) || empty($data['banType'])) {
            $this->sendResponse([
                'success' => false,
                'message' => 'Données manquantes'
            ], 400);
            return;
        }

        $result = false;
        if ($data['banType'] === 'chat') {
            $result = $this->UserController->banUserChat($data['userId']);
        } else if ($data['banType'] === 'total') {
            $result = $this->UserController->banUserTotal($data['userId']);
        }

        if ($result) {
            $this->sendResponse([
                'success' => true,
                'message' => 'Utilisateur banni avec succès'
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors du bannissement'
            ], 500);
        }
    }

    private function handleCheckChatBan()
    {
        $userId = isset($_GET['userId']) ? $_GET['userId'] : $_SESSION['user_id'];

        if (!$userId) {
            $this->sendResponse([
                'success' => false,
                'message' => 'ID utilisateur manquant'
            ], 400);
            return;
        }

        $isBanned = $this->UserController->checkChatBan($userId);
        $this->sendResponse([
            'success' => true,
            'chat_ban' => $isBanned
        ]);
    }

    private function handleGetVentesUser()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
            return;
        }

        $ventes = $this->UserController->getVentesUser($_SESSION['user_id']);
        if ($ventes) {
            $this->sendResponse([
                'success' => true,
                'ventes' => $ventes
            ]);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Aucune vente trouvée'], 404);
        }
    }

    private function handlePromoStat()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
            return;
        }

        $promoStat = $this->UserController->getUserPromoUseStat($_SESSION['user_id']);
        if ($promoStat) {
            $this->sendResponse([
                'success' => true,
                'promoStat' => $promoStat
            ]);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Aucune statistique de promotion trouvée'], 404);
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
