<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once '../api/UserApi.php';
require_once '../api/ProduitApi.php';
require_once '../api/PanierApi.php';
require_once '../api/CategoryApi.php';

use Api\ApiUser;
use ApiCategory\ApiCategory;
use ApiP\ApiProduit;
use ApiPanier\ApiPanier;


header('Content-Type: application/json');

$apiUser = new ApiUser();
$apiProduit = new ApiProduit();
$apiPanier = new ApiPanier();
$apicategory = new ApiCategory();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $apiUser->handleRequest();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $apiUser->handleRequest();
} else {
    $apiProduit->handleRequest();
}
