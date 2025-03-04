<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once '../api/UserApi.php';
require_once '../api/ProduitApi.php';
require_once '../api/PanierApi.php';

use Api\ApiUser;
use ApiP\ApiProduit;
use ApiPanier\ApiPanier;


header('Content-Type: application/json');

$apiUser = new ApiUser();
$apiProduit = new ApiProduit();
$apiPanier = new ApiPanier();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $apiPanier->handleRequest();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $apiPanier->handleRequest();
} else {
    $apiUser->handleRequest();
}
