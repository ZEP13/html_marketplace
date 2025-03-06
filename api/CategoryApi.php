<?php

namespace ApiCategory;

require_once '../models/Category.php';
require_once '../config/Database.php';
require_once '../controllers/CategoryController.php';

use ControllersCategory\CategoryController;


class ApiCategory
{
    private $CategoryController;

    public function __construct()
    {
        $this->CategoryController = new CategoryController();
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
        if (isset($_POST['action']) && $_POST['action'] === 'addCategory') {
            $this->handleAddCategory($_POST);  // Envoi directement avec $_POST
        } else if (isset($_POST['action']) && $_POST['action'] === 'deleteCategory') {
            $this->handleDeleteCategory($_POST);
        }
    }

    private function handleAddCategory($data)
    {

        $addCategory = $this->CategoryController->addCategory($data['nom']);

        if ($addCategory) {
            $this->sendResponse(['success' => true, 'message' => 'Categorie ajouté à la vente']);
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Impossible d\'ajouter la categorie']);
        }
    }

    private function handleDeleteCategory() {}

    private function handleGetRequest()
    {
        $category = $this->CategoryController->getCategory();  // Utiliser le contrôleur pour récupérer tous les produits
        if ($category) {
            $this->sendResponse($category);  // Retourner les données des produits
        } else {
            $this->sendResponse(['error' => 'Aucune categorie trouvé'], 404);
        }
    }
    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
