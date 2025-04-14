<?php

namespace ApiP;

require_once '../models/Produit.php';
require_once '../config/Database.php';
require_once '../controllers/ProduitController.php';

use ControllersP\ProduitController;
use Config\Database;

class ApiProduit
{
    private $ProduitController;
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->ProduitController = new ProduitController();
    }

    public function handleRequest()
    {
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            switch ($action) {
                case 'getValidProducts':
                    $this->getValidProducts();
                    break;
                case 'getProduitsByUser':
                    // Vérifier si l'utilisateur est connecté
                    if (isset($_SESSION['user_id'])) {
                        $id_user = $_SESSION['user_id'];
                        $this->getProduitByIdUser($id_user);
                    } else {
                        $this->sendResponse(['error' => 'Utilisateur non connecté'], 401);
                    }
                    break;
                case 'getAllProduits':
                    $this->getAllProduit();
                    break;
                case 'getAllImages':
                    $this->getAllImage($_GET['id']);
                    break;
                case 'getProduitsById':
                    if (isset($_GET['id']) && !empty($_GET['id'])) {
                        $this->getProduitById($_GET['id']);
                    } else {
                        $this->sendResponse(['error' => 'ID du produit manquant'], 400);
                    }
                    break;
                case 'getAllImage':
                    if (isset($_GET['id']) && !empty($_GET['id'])) {
                        $this->getAllImage($_GET['id']);
                    } else {
                        $this->sendResponse(['error' => 'ID du produit manquant'], 400);
                    }
                    break;
                default:
                    $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);

            switch ($action) {
                case 'addProduit':
                    $this->handleAddProduitToSell($data);
                    break;
                case 'updateProduit':
                    $this->handleEditProduit($data);
                    break;
                case 'deleteProduit':
                    if (isset($_GET['id']) && !empty($_GET['id'])) {
                        $this->deleteProduit($_GET['id']);
                    } else {
                        $this->sendResponse(['error' => 'ID du produit manquant'], 400);
                    }
                    break;
                case 'updateStatus':
                    $this->handleUpdateStatus($data);
                    break;
                case 'resetValidation':
                    if (empty($data['productId'])) {
                        $this->sendResponse(['success' => false, 'message' => 'ID du produit manquant'], 400);
                        return;
                    }
                    $this->handleResetValidation($data);
                    break;
                case 'addImages':
                    $this->handleAddImages($data);
                    break;
                default:
                    $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }

    private function handleAddProduitToSell($data)
    {
        // Vérifier si l'utilisateur est connecté
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
            return;
        }

        $id_user = $_SESSION['user_id'];

        // Pour FormData, les données sont dans $_POST et les fichiers dans $_FILES
        $nom = isset($_POST['nom']) ? $_POST['nom'] : null;
        $description = isset($_POST['description']) ? $_POST['description'] : null;
        $prix = isset($_POST['prix']) ? $_POST['prix'] : null;
        $quantite = isset($_POST['quantite']) ? $_POST['quantite'] : null;
        $category = isset($_POST['category']) ? $_POST['category'] : null;
        $actif = isset($_POST['actif']) ? $_POST['actif'] : 0;

        // Debug
        error_log("Données reçues: " . print_r($_POST, true));
        error_log("Fichiers reçus: " . print_r($_FILES, true));

        // Vérifier les données obligatoires
        if (!$nom || !$description || !$prix || !$quantite || !$category) {
            $this->sendResponse([
                'success' => false,
                'message' => 'Des informations sont manquantes pour le produit',
                'received' => [
                    'nom' => $nom,
                    'description' => $description,
                    'prix' => $prix,
                    'quantite' => $quantite,
                    'category' => $category
                ]
            ], 400);
            return;
        }

        // Gérer l'upload de l'image
        if (!isset($_FILES['img']) || $_FILES['img']['error'] !== UPLOAD_ERR_OK) {
            $this->sendResponse(['success' => false, 'message' => 'Image manquante ou erreur lors du téléchargement'], 400);
            return;
        }

        $uploadDir = '../img/imgProduct/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = uniqid(time(), true) . '.' . pathinfo($_FILES['img']['name'], PATHINFO_EXTENSION);
        $uploadFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['img']['tmp_name'], $uploadFile)) {
            $stmt = $this->db->prepare("INSERT INTO products (user_id, title, description, price, quantite, image, category, actif) VALUES (:id_user, :nom, :description, :prix, :quantite, :img, :category, :actif)");

            $stmt->bindValue(':id_user', $id_user);
            $stmt->bindValue(':nom', $nom);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':prix', $prix);
            $stmt->bindValue(':quantite', $quantite);
            $stmt->bindValue(':img', $uploadFile);
            $stmt->bindValue(':category', $category);
            $stmt->bindValue(':actif', $actif);

            $result = $stmt->execute();

            if ($result) {
                $lastInsertId = $this->db->lastInsertId();
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Produit ajouté avec succès',
                    'productId' => $lastInsertId
                ]);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Erreur lors de l\'ajout du produit']);
            }
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de l\'upload de l\'image']);
        }
    }

    private function handleEditProduit($data)
    {
        // Récupérer les données du formulaire
        $id = isset($_POST['id']) ? $_POST['id'] : null;
        $title = isset($_POST['title']) ? $_POST['title'] : null;
        $description = isset($_POST['description']) ? $_POST['description'] : null;
        $price = isset($_POST['price']) ? $_POST['price'] : null;
        $quantite = isset($_POST['quantite']) ? $_POST['quantite'] : null;
        $category = isset($_POST['category']) ? $_POST['category'] : null;
        $actif = isset($_POST['actif']) ? $_POST['actif'] : 0;

        // Debug
        error_log('POST data: ' . print_r($_POST, true));
        error_log('FILES data: ' . print_r($_FILES, true));

        // Vérifier si l'utilisateur est connecté
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
            return;
        }

        // Vérifier les données obligatoires
        if (!$id || !$title || !$description || !$price || !$quantite || !$category) {
            $this->sendResponse([
                'success' => false,
                'message' => 'Des informations sont manquantes pour le produit',
                'received' => [
                    'id' => $id,
                    'title' => $title,
                    'description' => $description,
                    'price' => $price,
                    'quantite' => $quantite,
                    'category' => $category
                ]
            ], 400);
            return;
        }

        // Gestion de l'image
        $image = '';
        if (isset($_FILES['img']) && $_FILES['img']['error'] == 0) {
            $image = $this->uploadImage($_FILES['img']);
        } elseif (isset($_POST['current_image'])) {
            $image = $_POST['current_image'];
        }

        // Appeler le contrôleur pour mettre à jour le produit
        $updated = $this->ProduitController->updateProduit(
            $id,
            $_SESSION['user_id'],
            $title,
            $description,
            $price,
            $quantite,
            $image,
            $category,
            $actif
        );

        if ($updated) {
            $this->sendResponse(['success' => true, 'message' => 'Produit mis à jour avec succès']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Impossible de mettre à jour le produit']);
        }
    }

    private function handleUpdateStatus($data)
    {
        if (empty($data['productId']) || empty($data['status'])) {
            $this->sendResponse(['success' => false, 'message' => 'Données manquantes'], 400);
            return;
        }

        $comment = isset($data['comment']) ? $comment = $data['comment'] : '';
        $result = $this->ProduitController->updateProductStatus($data['productId'], $data['status'], $comment);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Statut du produit mis à jour avec succès']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la mise à jour du statut'], 500);
        }
    }

    private function handleResetValidation($data)
    {
        if (empty($data['productId'])) {
            $this->sendResponse(['success' => false, 'message' => 'ID du produit manquant'], 400);
            return;
        }

        $result = $this->ProduitController->resetValidation($data['productId']);

        if ($result) {
            $this->sendResponse([
                'success' => true,
                'message' => 'Statut de validation réinitialisé'
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors de la réinitialisation du statut'
            ], 500);
        }
    }

    private function handleAddImages($data)
    {
        // Debug log
        error_log("POST data: " . print_r($_POST, true));
        error_log("FILES data: " . print_r($_FILES, true));

        // Vérifiez si productId et images sont fournis
        if (empty($_POST['productId']) || !isset($_FILES['images'])) {
            $this->sendResponse(['success' => false, 'message' => 'Données manquantes ou invalides'], 400);
            return;
        }

        $productId = $_POST['productId'];
        $uploadedImages = [];
        $uploadDir = '../img/imgProduct/';

        // Ensure upload directory exists
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Loop through each uploaded file
        foreach ($_FILES['images'] as $key => $all) {
            foreach ($all as $i => $val) {
                $files[$i][$key] = $val;
            }
        }

        foreach ($files as $file) {
            if ($file['error'] === UPLOAD_ERR_OK) {
                $fileName = uniqid(time(), true) . '_' . basename($file['name']);
                $uploadFile = $uploadDir . $fileName;

                if (move_uploaded_file($file['tmp_name'], $uploadFile)) {
                    $uploadedImages[] = $uploadFile;
                }
            }
        }

        if (empty($uploadedImages)) {
            $this->sendResponse(['success' => false, 'message' => 'Aucune image n\'a pu être téléchargée'], 400);
            return;
        }

        // Save images to database
        $result = $this->ProduitController->AddAllImgProduit($productId, $uploadedImages);

        if ($result) {
            $this->sendResponse([
                'success' => true,
                'message' => count($uploadedImages) . ' image(s) ajoutée(s) avec succès'
            ]);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Erreur lors de l\'ajout des images'], 500);
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
        $products = $this->ProduitController->getAllProduit();
        if ($products) {
            $this->sendResponse([
                'success' => true,
                'products' => $products
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors de la récupération des produits'
            ], 500);
        }
    }
    private function getAllImage($id)
    {
        // Vérifier si l'id est valide
        if (!$id || !is_numeric($id)) {
            $this->sendResponse([
                'success' => false,
                'message' => 'ID de produit invalide'
            ], 400);
            return;
        }

        $images = $this->ProduitController->getAllImage($id);
        if ($images) {
            $this->sendResponse([
                'success' => true,
                'products' => $images
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors de la récupération des images'
            ], 500);
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

    private function getValidProducts()
    {
        $products = $this->ProduitController->getValidatedProducts();
        if ($products) {
            $this->sendResponse([
                'success' => true,
                'products' => $products
            ]);
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Erreur lors de la récupération des produits'
            ], 500);
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
