<?php

namespace ControllersM;

require_once '../models/Mail.php';
require_once '../config/Database.php';

use ModelMail\Mail;
use Config\Database;

class MailController
{
    private $mailModel;

    public function __construct()
    {
        $database = new Database();
        $this->mailModel = new Mail($database->getConnection());
    }

    public function sendOrderConfirmationEmail($orderId)
    {
        // Déléguer la récupération des données au modèle
        $orderDetails = $this->mailModel->getOrderDetails($orderId);

        if (!$orderDetails) {
            return false;
        }

        // Envoyer l'email avec les détails récupérés
        return $this->mailModel->sendMailConfirmationCommande(
            $orderDetails['email'],
            $orderDetails
        );
    }

    public function sendRegistrationEmail($userDetails)
    {
        return $this->mailModel->sendMailConfirmationInscription(
            $userDetails['email'],
            $userDetails
        );
    }

    public function sendPasswordResetEmail($email, $resetLink)
    {
        return $this->mailModel->sendMailConfirmationMotDePasseOublie(
            $email,
            $resetLink
        );
    }
}
