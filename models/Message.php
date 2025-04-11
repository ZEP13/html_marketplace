<?php

namespace ModelsM;

require_once '../config/Database.php';

use Config\Database;
use PDO;
use PDOException;

class Message
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getMessages($id_sender, $id_receiver)
    {
        try {
            $query = "SELECT 
                m.id AS message_id,
                m.message,
                m.created_at,
                m.sender_id,
                s.user_prenom AS sender_prenom,
                s.user_nom AS sender_nom,
                m.receiver_id,
                r.user_prenom AS receiver_prenom,
                r.user_nom AS receiver_nom
            FROM messages m
            JOIN users s ON m.sender_id = s.id_user
            JOIN users r ON m.receiver_id = r.id_user
            WHERE (m.sender_id = :sender_id AND m.receiver_id = :receiver_id)
               OR (m.sender_id = :receiver_id AND m.receiver_id = :sender_id)
            ORDER BY m.created_at ASC"; // Changer en ASC pour avoir du plus ancien au plus récent

            $stmt = $this->db->prepare($query);
            $stmt->execute(['sender_id' => $id_sender, 'receiver_id' => $id_receiver]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function addMessage($id_sender, $id_receiver, $message)
    {
        try {
            $sql = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (:sender_id, :receiver_id, :message)";
            $stmt = $this->db->prepare($sql);

            return $stmt->execute(['sender_id' => $id_sender, 'receiver_id' => $id_receiver, 'message' => $message]);
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de l'insertion : " . $e->getMessage());
            return false;
        }
    }
    public function getContacts($id_sender)
    {
        try {
            $contactsQuery = "
            SELECT DISTINCT 
                   CASE
                       WHEN m.sender_id = :sender_id THEN m.receiver_id
                       ELSE m.sender_id
                   END AS contact_id,
                   u.user_prenom, u.user_nom
            FROM messages m
            JOIN users u ON u.id_user = 
                CASE
                    WHEN m.sender_id = :sender_id THEN m.receiver_id
                    ELSE m.sender_id
                END
            WHERE (m.sender_id = :sender_id OR m.receiver_id = :sender_id)
        ";
            $contactsStmt = $this->db->prepare($contactsQuery);
            $contactsStmt->execute(['sender_id' => $id_sender]);
            return $contactsStmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Log l'erreur et retour
            error_log("Erreur lors de l'insertion : " . $e->getMessage());
            return false;
        }
    }
}
