<?php

namespace ApiMail;

require_once '../models/Mail.php';
require_once '../config/Database.php';

use ModelMail\Mail;
use Config\Database;

class ApiMail
{
    private $mailController;
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->mailController = new Mail($this->db);
    }

    public function handleRequest()
    {
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);

            if ($action === 'sendOrderConfirmation') {
                $this->handleSendOrderConfirmation($data);
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }

    private function handleSendOrderConfirmation($data)
    {
        if (!isset($data['id_commande'])) {
            $this->sendResponse(['success' => false, 'message' => 'ID commande manquant'], 400);
            return;
        }

        // Récupérer les détails de la commande et l'email de l'utilisateur
        // Ces détails devraient être récupérés de votre base de données
        $orderDetails = $this->getOrderDetails($data['id_commande']);

        if ($orderDetails && isset($orderDetails['email'])) {
            $result = $this->mailController->sendMailConfirmationCommande(
                $orderDetails['email'],
                $orderDetails
            );

            if ($result) {
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Email de confirmation envoyé'
                ]);
            } else {
                $this->sendResponse([
                    'success' => false,
                    'message' => 'Erreur lors de l\'envoi de l\'email'
                ], 500);
            }
        } else {
            $this->sendResponse([
                'success' => false,
                'message' => 'Impossible de récupérer les détails de la commande'
            ], 404);
        }
    }

    private function getOrderDetails($id_commande)
    {
        // TODO: Implémenter la récupération des détails de la commande
        // Cette méthode devrait retourner un tableau avec les détails de la commande
        // incluant l'email du client, les produits, etc.
    }

    private function sendResponse($data, $statusCode = 200)
    {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
