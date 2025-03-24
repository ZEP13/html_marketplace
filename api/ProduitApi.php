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
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'getProduitsByUser') {
                // Vérifier si l'utilisateur est connecté
                if (isset($_SESSION['user_id'])) {
                    $id_user = $_SESSION['user_id'];
                    $this->getProduitByIdUser($id_user);
                } else {
                    $this->sendResponse(['error' => 'Utilisateur non connecté'], 401);
                }
            } elseif ($action === 'getAllProduits') {
                $this->getAllProduit();
            } elseif ($action === 'getProduitsById') {
                if (isset($_GET['id']) && !empty($_GET['id'])) {
                    $this->getProduitById($_GET['id']);
                } else {
                    $this->sendResponse(['error' => 'ID du produit manquant'], 400);
                }
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($action === 'addProduit') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleAddProduitToSell($data);
            } elseif ($action === 'updateProduit') {
                $data = json_decode(file_get_contents('php://input'), true);
                $this->handleEditProduit($data);
            } elseif ($action === 'deleteProduit') {
                if (isset($_GET['id']) && !empty($_GET['id'])) {
                    $this->deleteProduit($_GET['id']);
                } else {
                    $this->sendResponse(['error' => 'ID du produit manquant'], 400);
                }
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }


    private function handleAddProduitToSell($data)
    {
        // Vérifier si l'utilisateur est connecté
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id'];
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Aucun utilisateur trouvé dans la session'], 500);
            return;
        }

        // Vérifier les données du produit
        if (empty($data['nom']) || empty($data['description']) || empty($data['prix']) || empty($data['quantite']) || empty($data['category'])) {
            $this->sendResponse(['success' => false, 'message' => 'Des informations sont manquantes pour le produit'], 400);
            return;
        }

        // Définir le répertoire d'upload pour les images
        $uploadDir = '../img/imgProduct/';

        // Créer le répertoire s'il n'existe pas
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Vérifier si une image est téléchargée
        if (isset($_FILES['img']) && $_FILES['img']['error'] == 0) {
            $fileName = uniqid(time(), true) . '.' . pathinfo($_FILES['img']['name'], PATHINFO_EXTENSION);
            $uploadFile = $uploadDir . $fileName;

            // Vérifier le type de fichier
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($_FILES['img']['type'], $allowedTypes)) {
                $this->sendResponse(['success' => false, 'message' => 'Type de fichier non autorisé']);
                return;
            }

            // Vérifier la taille du fichier (max 2 MB)
            $maxFileSize = 2 * 1024 * 1024; // 2 MB
            if ($_FILES['img']['size'] > $maxFileSize) {
                $this->sendResponse(['success' => false, 'message' => 'Le fichier est trop volumineux']);
                return;
            }

            // Déplacer le fichier téléchargé
            if (move_uploaded_file($_FILES['img']['tmp_name'], $uploadFile)) {
                // Ajouter le produit à la base de données
                $addProduit = $this->ProduitController->addProduitToSell(
                    $id_user,
                    $data['nom'],
                    $data['description'],
                    $data['prix'],
                    $data['quantite'],
                    $uploadFile,
                    $data['category'],
                    $data['actif']
                );

                if ($addProduit) {
                    $this->sendResponse(['success' => true, 'message' => 'Produit ajouté à la vente']);
                } else {
                    $this->sendResponse(['success' => false, 'message' => 'Impossible d\'ajouter le produit à la vente']);
                }
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Erreur lors du téléchargement du fichier']);
            }
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Aucune image téléchargée ou erreur de fichier']);
        }
    }

    private function handleEditProduit($data)
    {
        // Use $_POST and $_FILES for FormData
        $data = $_POST;
        // Vérifier si l'utilisateur est connecté
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
            return;
        }

        // Vérifier les données obligatoires
        if (empty($data['id']) || empty($data['title']) || empty($data['description']) || empty($data['price']) || empty($data['quantite']) || empty($data['category'])) {
            error_log('Données manquantes : ' . print_r($data, true));
            $this->sendResponse(['success' => false, 'message' => 'Des informations sont manquantes pour le produit'], 400);
            return;
        }

        // Handle image upload
        $image = isset($_FILES['img']) && $_FILES['img']['error'] == 0
            ? $this->uploadImage($_FILES['img'])
            : (isset($data['current_image']) ? $data['current_image'] : null);

        if ($image === false && !isset($data['current_image'])) {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors du téléchargement de l\'image']);
            return;
        }

        // Appeler le contrôleur pour mettre à jour le produit
        $updated = $this->ProduitController->updateProduit(
            $data['id'],
            $_SESSION['user_id'],
            $data['title'],
            $data['description'],
            $data['price'],
            $data['quantite'],
            $image,
            $data['category'],
            isset($data['actif']) ? $data['actif'] : 0
        );

        if ($updated) {
            $this->sendResponse(['success' => true, 'message' => 'Produit mis à jour avec succès']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Impossible de mettre à jour le produit']);
        }
    }

    private function uploadImage($file)
    {
        $uploadDir = '../img/imgProduct/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Vérifier le type de fichier
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($file['type'], $allowedTypes)) {
            return false;
        }

        // Vérifier la taille du fichier (max 2 MB)
        $maxFileSize = 2 * 1024 * 1024;
        if ($file['size'] > $maxFileSize) {
            return false;
        }

        $fileName = uniqid(time(), true) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $uploadFile = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $uploadFile)) {
            return $uploadFile;
        }

        return false;
    }

    private function getAllProduit()
    {
        $produit = $this->ProduitController->getAllProduit();  // Utiliser le contrôleur pour récupérer tous les produits
        if ($produit) {
            $this->sendResponse($produit);  // Retourner les données des produits
        } else {
            $this->sendResponse(['error' => 'Aucun produit trouvé'], 404);
        }
    }

    private function getProduitById($id)
    {
        $produit = $this->ProduitController->getProduitById($id);
        if ($produit) {
            $this->sendResponse(['success' => true, 'produit' => $produit]);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Produit introuvable'], 404);
        }
    }
    private function getProduitByIdUser($id_user)
    {
        $produit = $this->ProduitController->getProduitByIdUser($id_user);
        if ($produit) {
            $this->sendResponse($produit);  // Retourner les données du produit
        } else {
            $this->sendResponse(['message' => 'Aucun produit mis en vente pour le moment'], 404);
        }
    }

    private function deleteProduit($id)
    {
        $produit = $this->ProduitController->deleteProduit($id);
        if ($produit) {
            $this->sendResponse(['message' => 'Produit supprimé avec succès']);
        } else {
            $this->sendResponse(['error' => 'Impossible de supprimer le produit'], 404);
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
