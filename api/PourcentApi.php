<?php

namespace ApiPourcent;

require_once '../models/Pourcent.php';
require_once '../controllers/PourcentControlleur.php';
require_once '../config/Database.php';


use ControllersPourcent\PourcentController;

class ApiPourcent
{
    private $pourcentController;

    public function __construct()
    {
        $this->pourcentController = new PourcentController;;
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
        if (isset($_GET['id_categorie'])) {
            $id_categorie = $_GET['id_categorie'];
            $pourcent = $this->pourcentController->getPourcentByCategorie($id_categorie);
            $this->sendResponse($pourcent);
        } else {
            $pourcent = $this->pourcentController->getAllPourcent();
            $this->sendResponse($pourcent);
        }
    }

    private function handlePostRequest()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['pourcent']) && isset($data['id_categorie'])) {
            $pourcent = $this->pourcentController->createPourcent($data['pourcent'], $data['id_categorie']);
            if ($pourcent) {
                $this->sendResponse(['success' => true, 'message' => 'Pourcentage créé avec succès']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Erreur lors de la création du pourcentage'], 500);
            }
        } else {
            $this->sendResponse(['error' => 'Données manquantes'], 400);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
