<?php

namespace ControllersM;

require_once '../models/Message.php';
require_once '../config/Database.php';

use ModelsM\Message;
use Models\User;
use Config\Database;

class MessageController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getMessages($id_user, $id_receiver)
    {
        $message = new Message($this->db);
        return $message->getMessages($id_user, $id_receiver);
    }

    public function addMessage($id_user, $id_receiver, $message)
    {
        $message = new Message($this->db);
        return $message->addMessage($id_user, $id_receiver, $message);
    }
    public function getContacts($id_user)
    {
        $message = new Message($this->db);
        return $message->getContacts($id_user);
    }
}
