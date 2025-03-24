<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once '../api/UserApi.php';
require_once '../api/ProduitApi.php';
require_once '../api/PanierApi.php';
require_once '../api/CategoryApi.php';
require_once '../api/ReviewApi.php';

use Api\ApiUser;
use ApiCategory\ApiCategory;
use ApiP\ApiProduit;
use ApiPanier\ApiPanier;
use ApiReview\ApiReview;

header('Content-Type: application/json');

$reviewApi = new ApiReview();
$apiUser = new ApiUser();
$apiProduit = new ApiProduit();
$apiPanier = new ApiPanier();
$apicategory = new ApiCategory();



// Initialiser les APIs
$apis = [
    'user' => new ApiUser(),
    'produit' => new ApiProduit(),
    'panier' => new ApiPanier(),
    'category' => new ApiCategory(),
    'review' => new ApiReview(),
];

// Vérifier les paramètres pour router la requête
if (isset($_GET['api']) && isset($apis[$_GET['api']])) {
    $api = $apis[$_GET['api']]; // Sélectionner l'API correspondante

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $api->handleRequest(); // Appeler la méthode handleRequest() de l'API
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $api->handleRequest(); // Appeler la méthode handleRequest() de l'API
    } else {
        echo json_encode(['error' => 'Méthode non supportée'], JSON_PRETTY_PRINT);
    }
} else {
    echo json_encode(['error' => 'API non reconnue ou non spécifiée'], JSON_PRETTY_PRINT);
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $apiProduit->handleRequest();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $apiProduit->handleRequest();
} else {
    $reviewApi->handleRequest();
}
