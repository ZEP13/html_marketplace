<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../api/UserApi.php';
require_once '../api/ProduitApi.php';

use Api\ApiUser;
use ApiP\ApiProduit;

header('Content-Type: application/json');

$apiUser = new ApiUser();
$apiUser->handleRequest();

$apiProduit = new ApiProduit();
$apiProduit->handleRequest();
