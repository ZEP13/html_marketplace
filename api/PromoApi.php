<?php

namespace ApiPromo;

require_once '../controllers/PromoController.php';

use ControllersPromo\PromoController;

class PromoApi
{
    private $promoController;

    public function __construct()
    {
        $this->promoController = new PromoController();
    }

    public function handleRequest($postData = null)
    {
        $action = $_GET['action'] ?? null;

        switch ($action) {
            case 'getAllPromos':
            case 'getPromo': // Add support for 'getPromo' action
                $this->getAllPromos();
                break;
            case 'getPromoById':
                $this->getPromoById($_GET['id'] ?? null);
                break;
            case 'createPromo':
                $this->createPromo($postData);
                break;
            case 'updatePromo':
                $this->updatePromo($postData);
                break;
            case 'deletePromo':
                $this->deletePromo($postData);
                break;
            case 'setActive':
                $this->setActive($postData);
                break;
            default:
                $this->sendResponse(['error' => 'Unknown action'], 400);
        }
    }

    private function getAllPromos()
    {
        $promos = $this->promoController->getAllPromos();
        $this->sendResponse(['success' => true, 'promos' => $promos]);
    }

    private function getPromoById($id)
    {
        if (!$id) {
            $this->sendResponse(['error' => 'ID is required'], 400);
            return;
        }

        $promo = $this->promoController->getPromoById($id);
        if ($promo) {
            $this->sendResponse(['success' => true, 'promo' => $promo]);
        } else {
            $this->sendResponse(['error' => 'Promo not found'], 404);
        }
    }

    private function createPromo($data)
    {
        if ($this->promoController->createPromo($data)) {
            $this->sendResponse(['success' => true, 'message' => 'Promo created successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to create promo'], 500);
        }
    }

    private function updatePromo($data)
    {
        if (!isset($data['id'])) {
            $this->sendResponse(['error' => 'ID is required'], 400);
            return;
        }

        if ($this->promoController->updatePromo($data['id'], $data)) {
            $this->sendResponse(['success' => true, 'message' => 'Promo updated successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to update promo'], 500);
        }
    }

    private function deletePromo($data)
    {
        if (!isset($data['id'])) {
            $this->sendResponse(['error' => 'ID is required'], 400);
            return;
        }

        if ($this->promoController->deletePromo($data['id'])) {
            $this->sendResponse(['success' => true, 'message' => 'Promo deleted successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to delete promo'], 500);
        }
    }

    private function setActive($data)
    {
        if (!isset($data['id']) || !isset($data['active'])) {
            $this->sendResponse(['error' => 'Invalid data: id or active missing'], 400);
            return;
        }

        $id = filter_var($data['id'], FILTER_VALIDATE_INT);
        $active = filter_var($data['active'], FILTER_VALIDATE_INT);

        if ($id === false || $active === false || !in_array($active, [0, 1])) {
            $this->sendResponse(['error' => 'Invalid values for id or active'], 400);
            return;
        }

        $result = $this->promoController->togglePromoStatus($id, $active);

        if ($result) {
            $this->sendResponse(['success' => true, 'message' => 'Promo status updated successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to update promo status'], 500);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
