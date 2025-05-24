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
    public function getUserProfileImage($id)
    {
        try {
            $query = "SELECT user_img FROM users WHERE id_user = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id', $id);
            $stmt->execute();

            // Utiliser fetch() pour récupérer une seule ligne
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            // Vérifier si un résultat a été trouvé
            if ($result) {
                return $result['user_img'];  // Retourner le chemin de l'image
            } else {
                return null;  // Aucun résultat, retourner null
            }
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
            $sql = 'SELECT * FROM users WHERE user_mail = :user_mail';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_mail', $mail);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if (password_verify($password, $user['user_password'])) {
                    // Retourner toutes les informations nécessaires
                    return [
                        'id_user' => $user['id_user'],
                        'user_mail' => $user['user_mail'],
                        'role' => $user['role'],
                        'is_banned' => $user['is_banned'],
                        'user_nom' => $user['user_nom'],
                        'user_prenom' => $user['user_prenom']
                    ];
                }
            }
            return false;
        } catch (PDOException $e) {
            error_log("Erreur lors de la sélection : " . $e->getMessage());
            return false;
        }
    }

    public function verifyRole($userId, $requiredRole)
    {
        try {
            $sql = 'SELECT role FROM users WHERE id_user = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $userId);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            return $user && $user['role'] === $requiredRole;
        } catch (PDOException $e) {
            error_log("Erreur lors de la vérification du rôle : " . $e->getMessage());
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

    public function addUserData($id, $phone, $rue, $code, $num, $city)
    {
        try {
            // Correct query with consistent parameter spacing
            $sql = 'UPDATE `users` SET `user_phone` = :user_phone, `rue` = :user_rue, `codePostal` = :user_code, `numMaison` = :user_num, `city` = :user_city WHERE `id_user` = :id';

            // Prepare the statement
            $stmt = $this->db->prepare($sql);

            // Bind values
            $stmt->bindValue(':user_phone', $phone);
            $stmt->bindValue(':user_rue', $rue);
            $stmt->bindValue(':user_code', $code);
            $stmt->bindValue(':user_num', $num);
            $stmt->bindValue(':user_city', $city);
            $stmt->bindValue(':id', $id);

            // Execute the query and return the result
            return $stmt->execute();
        } catch (PDOException $e) {
            // Log the error for further inspection
            error_log("Erreur lors de la mise à jour des données utilisateur : " . $e->getMessage());
            return false;
        }
    }

    // Ajout de la méthode getAllUsers
    public function getAllUsers()
    {
        try {
            $query = "SELECT * FROM users";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des utilisateurs : " . $e->getMessage());
            return false;
        }
    }

    // Correction du nom de la méthode pour correspondre à l'appel dans le controller
    public function changeUserRole($id, $role)
    {
        try {
            $sql = 'UPDATE `users` SET `role` = :role WHERE `id_user` = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':role', $role);
            $stmt->bindValue(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de la mise à jour : " . $e->getMessage());
            return false;
        }
    }

    public function banUserChat($id)
    {
        try {
            $sql = 'UPDATE `users` SET `chat_ban` = 1 WHERE `id_user` = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors du bannissement chat : " . $e->getMessage());
            return false;
        }
    }

    public function banUserTotal($id)
    {
        try {
            $sql = 'UPDATE `users` SET `is_banned` = 1 WHERE `id_user` = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors du bannissement total : " . $e->getMessage());
            return false;
        }
    }

    public function isChatBanned($userId)
    {
        try {
            $query = "SELECT chat_ban FROM users WHERE id_user = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? (bool)$result['chat_ban'] : false;
        } catch (PDOException $e) {
            error_log("Erreur lors de la vérification du ban chat : " . $e->getMessage());
            return false;
        }
    }

    public function venteUser($id)
    {
        try {
            $query = "SELECT COUNT(*) as vente_count FROM panier JOIN products ON panier.id_produit = products.id_produit WHERE products.user_id = :id and panier.achete = 1";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? (int)$result['vente_count'] : 0;
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des ventes de l'utilisateur : " . $e->getMessage());
            return false;
        }
    }
    public function getUserPromoUseStat($id)
    {
        try {
            $query = "SELECT COUNT(*) as promo_count FROM commande JOIN promotions ON commande.promo_id = promotions.id WHERE promotions.vendeur_id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? (int)$result['promo_count'] : 0;
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des statistiques d'utilisation des promotions de l'utilisateur : " . $e->getMessage());
            return false;
        }
    }
}
