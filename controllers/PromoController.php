<?php

namespace ControllersPromo;

require_once '../models/Promo.php';
require_once '../config/Database.php';

use ModelsPromo\Promo;
use Config\Database;

class PromoController
{
    private $promoModel;

    public function __construct()
    {
        $database = new Database();
        $this->promoModel = new Promo($database->getConnection());
    }

    public function getAllPromos()
    {
        return $this->promoModel->getAllPromos();
    }

    public function getPromoById($id)
    {
        return $this->promoModel->getPromoById($id);
    }

    public function createPromo($data)
    {
        return $this->promoModel->createPromo($data);
    }

    public function updatePromo($id, $data)
    {
        return $this->promoModel->updatePromo($id, $data);
    }

    public function deletePromo($id)
    {
        return $this->promoModel->deletePromo($id);
    }

    public function togglePromoStatus($id)
    {
        return $this->promoModel->togglePromoStatus($id);
    }

    public function getVendorPromos()
    {
        return $this->promoModel->getVendorPromos();
    }

    public function validateVendorPromo($id)
    {
        return $this->promoModel->validateVendorPromo($id);
    }

    public function refuseVendorPromo($id)
    {
        return $this->promoModel->refuseVendorPromo($id);
    }

    public function resetVendorPromo($id)
    {
        return $this->promoModel->resetVendorPromo($id);
    }

    public function getUserPromos($userId)
    {
        return $this->promoModel->getUserPromos($userId);
    }

    public function createUserPromo($data, $userId)
    {
        return $this->promoModel->createUserPromo($data, $userId);
    }

    public function updateUserPromo($id, $data, $userId)
    {
        // Verify that the promo belongs to the user before updating
        $promo = $this->getPromoById($id);
        if (!$promo || $promo['vendeur_id'] != $userId) {
            return false;
        }
        return $this->promoModel->updatePromo($id, $data);
    }

    public function isCodeUnique($code, $excludeId = null)
    {
        return $this->promoModel->isCodeUnique($code, $excludeId);
    }
}
