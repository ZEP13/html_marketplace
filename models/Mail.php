<?php

namespace ModelMail;

require_once '../config/Database.php';
require_once '../mailler/src/PHPMailer.php';
require_once '../mailler/src/SMTP.php';
require_once '../mailler/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

use Config\Database;
use PDO;
use PDOException;

class Mail
{
    private $db;
    private $mail;

    public function __construct($db)
    {
        $this->db = $db;
        $this->mail = new PHPMailer(true);

        // Configuration du serveur SMTP Gmail
        $this->mail->isSMTP();
        $this->mail->Host = 'smtp.gmail.com';
        $this->mail->SMTPAuth = true;
        $this->mail->Username = 'votre-email@gmail.com'; // À remplacer
        $this->mail->Password = 'votre-mot-de-passe-app'; // À remplacer par un mot de passe d'application
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port = 587;
        $this->mail->CharSet = 'UTF-8';
    }

    // Méthode générique pour envoyer un e-mail
    private function sendMail($to, $subject, $body)
    {
        try {
            // Configuration SMTP
            $this->mail->setFrom('no-reply@votresite.com', 'Votre Site');
            $this->mail->addAddress($to);

            // Contenu de l'e-mail
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body    = $body;
            $this->mail->AltBody = strip_tags($body); // Texte alternatif en cas de problème avec le HTML

            // Envoi de l'e-mail
            $this->mail->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    // Envoi de l'e-mail de confirmation de commande
    public function sendMailConfirmationCommande($to, $orderDetails)
    {
        $subject = "Confirmation de votre commande";
        $body = $this->generateOrderSummary($orderDetails);
        return $this->sendMail($to, $subject, $body);
    }

    // Envoi de l'e-mail de confirmation d'achat
    public function sendMailConfirmationAchat($to, $purchaseDetails)
    {
        $subject = "Confirmation de votre achat";
        $body = $this->generatePurchaseSummary($purchaseDetails);
        return $this->sendMail($to, $subject, $body);
    }

    // Envoi de l'e-mail de confirmation d'inscription
    public function sendMailConfirmationInscription($to, $userDetails)
    {
        $subject = "Confirmation de votre inscription";
        $body = $this->generateRegistrationSummary($userDetails);
        return $this->sendMail($to, $subject, $body);
    }

    // Envoi de l'e-mail de confirmation de mot de passe oublié
    public function sendMailConfirmationMotDePasseOublie($to, $resetLink)
    {
        $subject = "Réinitialisation de votre mot de passe";
        $body = $this->generatePasswordResetSummary($resetLink);
        return $this->sendMail($to, $subject, $body);
    }

    // Résumé de la commande (HTML)
    private function generateOrderSummary($orderDetails)
    {
        $message = "<html><body>";
        $message .= "<h2>Confirmation de votre commande #{$orderDetails['id_commande']}</h2>";
        $message .= "<p>Merci pour votre commande sur notre marketplace!</p>";

        $message .= "<h3>Détails de votre commande:</h3>";
        $message .= "<table style='width: 100%; border-collapse: collapse;'>";
        $message .= "<tr style='background-color: #f8f9fa;'>
                        <th style='padding: 10px; border: 1px solid #dee2e6;'>Produit</th>
                        <th style='padding: 10px; border: 1px solid #dee2e6;'>Quantité</th>
                        <th style='padding: 10px; border: 1px solid #dee2e6;'>Prix unitaire</th>
                        <th style='padding: 10px; border: 1px solid #dee2e6;'>Total</th>
                    </tr>";

        foreach ($orderDetails['produits'] as $produit) {
            $total = $produit['prix'] * $produit['quantite'];
            $message .= "<tr>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>{$produit['nom']}</td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>{$produit['quantite']}</td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>{$produit['prix']}€</td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>{$total}€</td>
                        </tr>";
        }

        $message .= "<tr style='background-color: #f8f9fa;'>
                        <td colspan='3' style='padding: 10px; border: 1px solid #dee2e6; text-align: right;'><strong>Total</strong></td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>{$orderDetails['total']}€</strong></td>
                    </tr>";
        $message .= "</table>";

        $message .= "<p>Nous vous tiendrons informé de l'état de votre commande.</p>";
        $message .= "<p>Cordialement,<br>L'équipe de la marketplace</p>";
        $message .= "</body></html>";

        return $message;
    }

    // Résumé de l'achat (HTML)
    private function generatePurchaseSummary($purchaseDetails)
    {
        $message = "<h1>Résumé de votre achat</h1>";
        $message .= "<p><strong>ID Achat:</strong> " . $purchaseDetails['id_achat'] . "</p>";
        $message .= "<p><strong>Montant total:</strong> " . $purchaseDetails['total'] . "€</p>";
        $message .= "<h2>Détails de l'achat</h2>";

        foreach ($purchaseDetails['produits'] as $produit) {
            $message .= "<p>" . $produit['nom'] . " - " . $produit['quantite'] . " x " . $produit['prix'] . "€</p>";
        }

        $message .= "<p>Merci pour votre achat!</p>";
        return $message;
    }

    // Résumé de l'inscription (HTML)
    private function generateRegistrationSummary($userDetails)
    {
        $message = "<h1>Confirmation de votre inscription</h1>";
        $message .= "<p><strong>Nom:</strong> " . $userDetails['nom'] . "</p>";
        $message .= "<p><strong>Email:</strong> " . $userDetails['email'] . "</p>";
        $message .= "<p>Bienvenue sur notre site! Vous pouvez maintenant commencer à utiliser nos services.</p>";
        return $message;
    }

    // Résumé de la réinitialisation du mot de passe (HTML)
    private function generatePasswordResetSummary($resetLink)
    {
        $message = "<h1>Réinitialisation de votre mot de passe</h1>";
        $message .= "<p>Vous avez demandé à réinitialiser votre mot de passe.</p>";
        $message .= "<p><a href='" . $resetLink . "'>Cliquez ici pour réinitialiser votre mot de passe</a></p>";
        return $message;
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
