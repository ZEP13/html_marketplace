<?php

namespace ApiM;

include('../models/Message.php');
include('../controllers/MessageController.php');

use ModelsM\Message;
use ControllersM\MessageController;

class ApiMessage
{
    private $MessageController;

    public function __construct()
    {
        $this->MessageController = new MessageController();
    }

    public function handleRequest()
    {
        $action = isset($_GET['action']) ? $_GET["action"] : null;
        $data = null;

        // Récupérer les données pour les requêtes POST
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
        }

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'getMessages') {
                $this->handlegetMessages($_GET); // Passer les données GET
            } elseif ($action === 'getContacts') {
                $this->handlegetContacts();
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($action === 'sendMessage') {
                $this->handleSendMessage($data); // Passer les données POST
            } else {
                $this->sendResponse(['error' => 'Action non reconnue'], 400);
            }
        } else {
            $this->sendResponse(['error' => 'Méthode non supportée'], 405);
        }
    }

    public function handleSendMessage($data)
    {
        if (isset($_SESSION['user_id'])) {
            $id_sender = $_SESSION['user_id'];
            $send = $this->MessageController->addMessage($id_sender, $data['receiver'], $data['message']);
            if ($send) {
                $this->sendResponse(['success' => true, 'message' => 'Message envoyé']);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Erreur lors de l\'envoi du message']);
            }
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté']);
        }
    }

    public function handlegetMessages($data)
    {
        if (isset($_SESSION['user_id'])) {
            $id_sender = $_SESSION['user_id'];

            $id_receiver = isset($data['id_receiver']) ? $data['id_receiver'] : null;
            if (!$id_receiver) {
                $this->sendResponse(['success' => false, 'message' => 'ID du destinataire manquant'], 400);
                return;
            }

            $messages = $this->MessageController->getMessages($id_sender, $id_receiver);
            if ($messages) {
                $this->sendResponse(['success' => true, 'messages' => $messages]);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Aucun message trouvé']);
            }
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté']);
        }
    }

    public function handlegetContacts()
    {
        if (isset($_SESSION['user_id'])) {
            $id_sender = $_SESSION['user_id'];
            $contacts = $this->MessageController->getContacts($id_sender);
            if ($contacts) {
                $this->sendResponse(['success' => true, 'contacts' => $contacts]);
            } else {
                $this->sendResponse(['success' => false, 'message' => 'Aucun contact trouvé']);
            }
        } else {
            $this->sendResponse(['success' => false, 'message' => 'Utilisateur non connecté']);
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
