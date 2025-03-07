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

    public function handlePostRequest()
    {
        // Pas besoin de json_decode, car nous utilisons multipart/form-data
        if (isset($_POST['action']) && $_POST['action'] === 'addProduit') {
            $this->handleAddProduitToSell($_POST);  // Envoi directement avec $_POST
        } else if (isset($_POST['action']) && $_POST['action'] === 'editProduit') {
            $this->handleEditProduit($_POST);
        }
    }

    private function handleAddProduitToSell($data)
    {
        // Check if the user is logged in
        if (isset($_SESSION['user_id'])) {
            $id_user = $_SESSION['user_id']; // Get the user ID from the session
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Aucun utilisateur trouvé dans la session'], 500);
            return;
        }

        // Check if product data is valid
        if (empty($data['nom']) || empty($data['description']) || empty($data['prix']) || empty($data['quantite']) || empty($data['category'])) {
            $this->sendResponse(['success' => false, 'message' => 'Des informations sont manquantes pour le produit'], 400);
            return;
        }

        // Define the upload directory for the product image
        $uploadDir = '../img/imgProduct/';

        // Create the directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);  // Create the folder with appropriate permissions
        }

        // Check if an image file is uploaded
        if (isset($_FILES['img']) && $_FILES['img']['error'] == 0) {
            $fileName = uniqid(time(), true) . '.' . pathinfo($_FILES['img']['name'], PATHINFO_EXTENSION);
            $uploadFile = $uploadDir . $fileName;

            // Check the file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($_FILES['img']['type'], $allowedTypes)) {
                $this->sendResponse(['success' => false, 'message' => 'Type de fichier non autorisé']);
                return;
            }

            // Check the file size (max 2 MB)
            $maxFileSize = 2 * 1024 * 1024; // 2 MB
            if ($_FILES['img']['size'] > $maxFileSize) {
                $this->sendResponse(['success' => false, 'message' => 'Le fichier est trop volumineux']);
                return;
            }

            // Attempt to move the uploaded file to the designated directory
            if (move_uploaded_file($_FILES['img']['tmp_name'], $uploadFile)) {
                // Call the function to add the product to the sellable items
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

                // Respond based on the outcome of the addProduit action
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


    //afaire pour eddit produit en vente
    private function handleEditProduit() {}


    private function handleGetRequest()
    {
        // Vérifier si un ID est présent dans l'URL pour récupérer un produit spécifique
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            // Appeler la méthode pour récupérer un produit par son ID
            $this->getProduitById($_GET['id']);
        } else {
            // Sinon, récupérer tous les produits
            $this->getAllProduit();
        }
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
        $produit = $this->ProduitController->getProduitById($id);  // Utiliser le contrôleur pour récupérer le produit par ID
        if ($produit) {
            $this->sendResponse($produit);  // Retourner les données du produit
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
