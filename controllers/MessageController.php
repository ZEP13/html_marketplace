<?php

namespace ControllersM;

require_once '../models/Message.php';
require_once '../config/Database.php';

use ModelsM\Message;
use Models\User;
use Config\Database;

class MessageController
{
    private $messageModel;
    private $userModel;

    public function __construct($db)
    {
        $this->messageModel = new Message($db);
        $this->userModel = new User($db);
    }

    public function showConversation($id_sender, $id_receiver)
    {
        $messages = $this->messageModel->getMessage($id_sender, $id_receiver);
        $contacts = $this->messageModel->getContacts($id_sender);
        $receiver = $this->userModel->getUserById($id_receiver);

        return ['messages' => $messages, 'contacts' => $contacts, 'receiver' => $receiver];
    }

    public function sendMessage($id_sender, $id_receiver, $message)
    {
        $this->messageModel->addMessage($id_sender, $id_receiver, $message);
    }
}
