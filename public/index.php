<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once '../api/UserApi.php';
require_once '../api/ProduitApi.php';
require_once '../api/PanierApi.php';
require_once '../api/CategoryApi.php';
require_once '../api/ReviewApi.php';
require_once '../api/CommandeApi.php';
require_once '../api/MessageApi.php';
require_once '../api/PromoApi.php';


use Api\ApiUser;
use ApiCategory\ApiCategory;
use ApiP\ApiProduit;
use ApiPanier\ApiPanier;
use ApiReview\ApiReview;
use ApiCommande\ApiCommande;
use ApiM\ApiMessage;
use ApiPromo\PromoApi;


header('Content-Type: application/json');

// Initialiser les APIs
$apis = [
    'user' => new ApiUser(),
    'produit' => new ApiProduit(),
    'panier' => new ApiPanier(),
    'category' => new ApiCategory(),
    'review' => new ApiReview(),
    'commande' => new ApiCommande(),
    'message' => new ApiMessage(),
    'promo' => new PromoApi(), // Ensure PromoApi is included and initialized
];

// Vérifier les paramètres pour router la requête
if (isset($_GET['api']) && isset($apis[$_GET['api']])) {
    $api = $apis[$_GET['api']]; // Sélectionner l'API correspondante

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $api->handleRequest(); // Appeler la méthode handleRequest() de l'API
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $api->handleRequest(); // Ensure POST requests are routed correctly
    } else {
        echo json_encode(['error' => 'Méthode non supportée'], JSON_PRETTY_PRINT);
    }
} else {
    echo json_encode(['error' => 'API non reconnue ou non spécifiée'], JSON_PRETTY_PRINT);
}
