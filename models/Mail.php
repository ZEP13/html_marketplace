<?php

namespace ModelMail;

require_once '../config/Database.php';
require_once '../config/MailConfig.php';
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Config\MailConfig;
use PDO;

class Mail
{
    private $db;
    private $mail;

    public function __construct($db)
    {
        $this->db = $db;
        $this->initializeMailer();
    }

    private function initializeMailer()
    {
        $this->mail = new PHPMailer(true);
        $this->mail->isSMTP();
        $this->mail->Host = MailConfig::SMTP_HOST;
        $this->mail->SMTPAuth = true;
        $this->mail->Username = MailConfig::SMTP_USERNAME;
        $this->mail->Password = MailConfig::SMTP_PASSWORD;
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port = MailConfig::SMTP_PORT;
        $this->mail->setFrom(MailConfig::SMTP_FROM, MailConfig::SMTP_FROM_NAME);
        $this->mail->CharSet = 'UTF-8';
    }

    public function sendPasswordResetEmail($email, $token)
    {
        $resetLink = "http://localhost/html_marketplace/views/reset_password.html?token=" . $token;
        $subject = "Réinitialisation de votre mot de passe";
        $body = $this->generatePasswordResetTemplate($resetLink);
        return $this->sendMail($email, $subject, $body);
    }

    public function sendOrderConfirmation($orderId)
    {
        $orderDetails = $this->getOrderDetails($orderId);
        if (!$orderDetails) return false;

        $subject = "Confirmation de votre commande #" . $orderId;
        $body = $this->generateOrderConfirmationTemplate($orderDetails);
        return $this->sendMail($orderDetails['email'], $subject, $body);
    }

    public function sendOrderShipped($orderId)
    {
        $orderDetails = $this->getOrderDetails($orderId);
        if (!$orderDetails) return false;

        $subject = "Votre commande #" . $orderId . " a été expédiée";
        $body = $this->generateOrderShippedTemplate($orderDetails);
        return $this->sendMail($orderDetails['email'], $subject, $body);
    }

    private function sendMail($to, $subject, $body)
    {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($to);
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body = $body;
            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Erreur d'envoi d'email: " . $e->getMessage());
            return false;
        }
    }

    // Templates HTML
    private function generatePasswordResetTemplate($resetLink)
    {
        return "
            <h1>Réinitialisation de votre mot de passe</h1>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p><a href='{$resetLink}'>Cliquez ici pour réinitialiser votre mot de passe</a></p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        ";
    }

    private function generateOrderConfirmationTemplate($orderDetails)
    {
        $productsHtml = '';
        foreach ($orderDetails['produits'] as $produit) {
            $productsHtml .= "
                <tr>
                    <td>{$produit['nom']}</td>
                    <td>{$produit['quantite']}</td>
                    <td>{$produit['prix']}€</td>
                    <td>" . ($produit['prix'] * $produit['quantite']) . "€</td>
                </tr>";
        }

        return "
            <h1>Confirmation de commande #{$orderDetails['id_commande']}</h1>
            <p>Merci pour votre commande !</p>
            <table>
                <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
                {$productsHtml}
                <tr>
                    <td colspan='3'><strong>Total</strong></td>
                    <td><strong>{$orderDetails['total']}€</strong></td>
                </tr>
            </table>
        ";
    }

    private function generateOrderShippedTemplate($orderDetails)
    {
        return "
            <h1>Votre commande a été expédiée</h1>
            <p>Bonne nouvelle ! Votre commande #{$orderDetails['id_commande']} a été expédiée.</p>
            <p>Vous recevrez bientôt vos produits.</p>
        ";
    }

    public function getOrderDetails($orderId)
    {
        try {
            // Récupérer les détails de la commande
            $stmt = $this->db->prepare("
                SELECT c.*, u.user_mail, u.user_nom, u.user_prenom
                FROM commande c
                JOIN users u ON c.id_user_commande = u.id_user
                WHERE c.id_commande = :orderId
            ");
            $stmt->execute(['orderId' => $orderId]);
            $orderInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$orderInfo) {
                return false;
            }

            // Récupérer les produits de la commande
            $stmt = $this->db->prepare("
                SELECT p.title as nom, p.price as prix, pa.quantite_panier as quantite
                FROM panier pa
                JOIN products p ON pa.id_produit = p.id_produit
                WHERE pa.id_commande_panier = :orderId
            ");
            $stmt->execute(['orderId' => $orderId]);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculer le total
            $total = array_reduce($products, function ($sum, $product) {
                return $sum + ($product['prix'] * $product['quantite']);
            }, 0);

            // Préparer les détails de la commande
            return [
                'id_commande' => $orderId,
                'email' => $orderInfo['user_mail'],
                'nom_client' => $orderInfo['user_nom'] . ' ' . $orderInfo['user_prenom'],
                'date_commande' => $orderInfo['date_commande'],
                'produits' => $products,
                'total' => $total
            ];
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération des détails de la commande : " . $e->getMessage());
            return false;
        }
    }
}
