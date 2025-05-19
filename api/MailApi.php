<?php

namespace ApiMail;

require_once '../models/Mail.php';
require_once '../config/Database.php';

use ModelMail\Mail;
use Config\Database;

class ApiMail
{
    private $mailModel;

    public function __construct()
    {
        $database = new Database();
        $this->mailModel = new Mail($database->getConnection());
    }

    public function handleRequest()
    {
        $action = $_GET['action'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);

        switch ($action) {
            case 'resetPassword':
                $this->handlePasswordReset($data);
                break;
            case 'orderConfirmation':
                $this->handleOrderConfirmation($data);
                break;
            case 'orderShipped':
                $this->handleOrderShipped($data);
                break;
            default:
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
        }
    }

    private function handlePasswordReset($data)
    {
        if (!isset($data['email'])) {
            $this->sendResponse(['error' => 'Email manquant'], 400);
            return;
        }

        $token = bin2hex(random_bytes(32));
        // Sauvegarder le token en base de données...

        if ($this->mailModel->sendPasswordResetEmail($data['email'], $token)) {
            $this->sendResponse(['success' => true]);
        } else {
            $this->sendResponse(['error' => 'Erreur d\'envoi'], 500);
        }
    }

    private function handleOrderConfirmation($data)
    {
        if (!isset($data['orderId'])) {
            $this->sendResponse(['error' => 'ID de commande manquant'], 400);
            return;
        }

        if ($this->mailModel->sendOrderConfirmation($data['orderId'])) {
            $this->sendResponse(['success' => true]);
        } else {
            $this->sendResponse(['error' => 'Erreur d\'envoi'], 500);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
