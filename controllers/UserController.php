<?php

namespace Controllers;

require_once '../models/User.php';
require_once '../config/Database.php';

use Models\User;
use Config\Database;

class UserController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getUserById($id)
    {
        $user = new User($this->db);
        return $user->getUserById($id);
    }

    public function editMail($newMail, $id)
    {
        $user = new User($this->db);
        return $user->editMail($id, $newMail);
    }

    public function checkLogin($mail, $password)
    {
        $user = new User($this->db);
        $userData = $user->checkLogin($mail, $password);

        if ($userData && !$userData['is_banned']) {
            // Stocker toutes les informations importantes dans la session
            $_SESSION['user_id'] = $userData['id_user'];
            $_SESSION['user_mail'] = $userData['user_mail'];
            $_SESSION['user_role'] = $userData['role'];
            $_SESSION['user_nom'] = $userData['user_nom'];
            $_SESSION['user_prenom'] = $userData['user_prenom'];

            return $userData;
        }

        return false;
    }

    public function createUser($nom, $prenom, $mail, $password)
    {
        $user = new User($this->db);
        return $user->createUser($nom, $prenom, $mail, $password);
    }

    public function addImgProfil($img, $id)
    {
        $user = new User($this->db);
        return $user->addImgProfil($img, $id);
    }

    public function getUserProfileImage($id)
    {
        $user = new User($this->db);
        return $user->getUserProfileImage($id);
    }

    public function addUserData($id, $phone, $rue, $code, $num, $city)
    {
        $user = new User($this->db);
        return $user->addUserData($id, $phone, $rue, $code, $num, $city);
    }

    public function validateUserData($data)
    {
        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/';

        if (empty($data['nom']) || empty($data['prenom']) || empty($data['mail']) || empty($data['password'])) {
            return false;
        }
        if (!preg_match($pattern, $data['password'])) {
            return false;
        }
        if (!filter_var($data['mail'], FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return true;
    }

    public function validateLogin($data)
    {
        if (empty($data['mail']) || empty($data['password'])) {
            return false;
        }

        if (!filter_var($data['mail'], FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return true;
    }

    public function getAllUsers()
    {
        $user = new User($this->db);
        return $user->getAllUsers();
    }

    public function changeUserRole($userId, $role)
    {
        $user = new User($this->db);
        return $user->changeUserRole($userId, $role);
    }

    public function banUserChat($userId)
    {
        $user = new User($this->db);
        return $user->banUserChat($userId);
    }

    public function banUserTotal($userId)
    {
        $user = new User($this->db);
        return $user->banUserTotal($userId);
    }

    public function checkChatBan($userId)
    {
        $user = new User($this->db);
        return $user->isChatBanned($userId);
    }

    public function checkAdminRole()
    {
        return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Admin';
    }

    public function getVentesUser($userId)
    {
        $user = new User($this->db);
        return $user->venteUser($userId);
    }
    public function getUserPromoUseStat($id)
    {
        $user = new User($this->db);
        return $user->getUserPromoUseStat($id);
    }
}
