<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../api/UserApi.php';

use Api\ApiUser;

header('Content-Type: application/json');

$apiUser = new ApiUser();
$apiUser->handleRequest();
