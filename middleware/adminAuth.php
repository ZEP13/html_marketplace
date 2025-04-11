<?php
session_start();

function isAdmin()
{
    // Vérifier si l'utilisateur est connecté et a le rôle admin
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role'])) {
        return false;
    }

    return $_SESSION['user_role'] === 'Admin';
}

// Vérification plus stricte
if (!isAdmin()) {
    header('HTTP/1.1 403 Forbidden');
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Accès non autorisé',
        'debug' => [
            'session_exists' => isset($_SESSION),
            'user_id_exists' => isset($_SESSION['user_id']),
            'user_role' => $_SESSION['user_role'] ?? 'non défini'
        ]
    ]);
    exit();
}
