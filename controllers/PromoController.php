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

    public function togglePromoStatus($id, $active)
    {
        return $this->promoModel->togglePromoStatus($id, $active);
    }
}
