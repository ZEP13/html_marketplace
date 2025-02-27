<?php

namespace Models;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class User
{
    public $id;
    public $nom;
    public $prenom;
    public $mail;
    public $password;
    public $phone;
    public $role;
    public $img;
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getUserById($id)
    {
        try {
            $query = "SELECT * FROM users WHERE id_user = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $user = new self($this->db);
                $user->id = $row['id_user'];
                $user->nom = $row['user_nom'];
                $user->prenom = $row['user_prenom'];
                $user->mail = $row['user_mail'];
                $user->phone = $row['user_phone'];
                $user->img = $row['user_img'];
                $user->role = $row['role'];
                return $user;
            }
            return null;
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function createUser($nom, $prenom, $mail, $password)
    {
        try {
            // Hacher le mot de passe avant l'insertion
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            // Requête d'insertion
            $sql = 'INSERT INTO `users`(`user_nom`, `user_prenom`, `user_mail`, `user_password`) VALUES (:user_nom, :user_prenom, :user_mail, :user_password)';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_nom', $nom);
            $stmt->bindValue(':user_prenom', $prenom);
            $stmt->bindValue(':user_mail', $mail);
            $stmt->bindValue(':user_password', $hashedPassword);
            return $stmt->execute();
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de l'insertion : " . $e->getMessage());
            return false;
        }
    }

    public function checkLogin($mail, $password)
    {
        try {
            // Requête de sélection
            $sql = 'SELECT * FROM `users` WHERE `user_mail` = :user_mail';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_mail', $mail);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Vérifier si l'utilisateur existe
            if ($user) {
                // Vérifier si le mot de passe est correct
                if (password_verify($password, $user['user_password'])) {
                    return $user;
                }
            }
            return false;
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de la sélection : " . $e->getMessage());
            return false;
        }
    }
    public function editMail($id, $newMail)
    {
        try {
            // Requête de mise à jour
            $sql = 'UPDATE `users` SET `user_mail` = :user_mail WHERE `id_user` = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_mail', $newMail);
            $stmt->bindValue(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de la mise à jour : " . $e->getMessage());
            return false;
        }
    }

    public function addImgProfil($img, $id)
    {
        try {
            // Requête de mise à jour
            $sql = 'UPDATE `users` SET `user_img` = :user_img WHERE `id_user` = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_img', $img);
            $stmt->bindValue(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de la mise à jour : " . $e->getMessage());
            return false;
        }
    }
    public function addPhoneUser($phone, $id)
    {
        try {
            // Requête de mise à jour
            $sql = 'UPDATE `users` SET `user_phone` = :user_phone WHERE `id_user` = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_phone', $phone);
            $stmt->bindValue(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de la mise à jour : " . $e->getMessage());
            return false;
        }
    }
    public function changeRoleUser($role, $id)
    {
        try {
            // Requête de mise à jour
            $sql = 'UPDATE `users` SET `role` = :role WHERE `id_user` = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':role', $role);
            $stmt->bindValue(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de la mise à jour : " . $e->getMessage());
            return false;
        }
    }
}
