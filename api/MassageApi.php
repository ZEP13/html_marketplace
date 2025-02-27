<?php
include('../Model/Message.php');
include('../controllers/MessageController.php');

use ModelsM\Message;
use ControllersM\MessageController;

class ApiMessageController
{
    private $messageModel;

    public function __construct($db)
    {
        $this->messageModel = new Message($db);
    }

    public function sendMessage($id_sender, $id_receiver, $message)
    {
        if (!empty($message)) {
            $this->messageModel->addMessage($id_sender, $id_receiver, $message);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Le message ne peut pas être vide']);
        }
    }

    public function getMessages($id_sender, $id_receiver)
    {
        $messages = $this->messageModel->getMessage($id_sender, $id_receiver);
        echo json_encode(['status' => 'success', 'messages' => $messages]);
    }
}
