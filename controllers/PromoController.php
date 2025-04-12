<?php

namespace ControllersPromo;

require_once '../models/Promo.php';
require_once '../config/Database.php';

use ModelsPromo\Promo;
use Config\Database;

class PromoController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function addPromo(
        $code,
        $nom_promo,
        $description,
        $date_debut,
        $date_fin,
        $reduction_value,
        $type_reduction,
        $montant_max,
        $condition_min,
        $vendeur_id,
        $est_globale,
        $actif,
        $validé_par_admin
    ) {
        $promo = new Promo($this->db);
        return $promo->addPromo(
            $code,
            $nom_promo,
            $description,
            $date_debut,
            $date_fin,
            $reduction_value,
            $type_reduction,
            $montant_max,
            $condition_min,
            $vendeur_id,
            $est_globale,
            $actif,
            $validé_par_admin
        );
    }

    public function validatePromo($id_promo)
    {
        $promo = new Promo($this->db);
        return $promo->validatePromo($id_promo);
    }

    public function refusePromo($id_promo)
    {
        $promo = new Promo($this->db);
        return $promo->refusePromo($id_promo);
    }

    public function updatePromo(
        $id_promo,
        $code,
        $nom_promo,
        $description,
        $date_debut,
        $date_fin,
        $reduction_value,
        $type_reduction,
        $montant_max,
        $condition_min
    ) {
        $promo = new Promo($this->db);
        return $promo->updatePromo(
            $id_promo,
            $code,
            $nom_promo,
            $description,
            $date_debut,
            $date_fin,
            $reduction_value,
            $type_reduction,
            $montant_max,
            $condition_min
        );
    }

    public function setPromoActive($id_promo, $active)
    {
        $promo = new Promo($this->db);
        return $promo->setPromoActive($id_promo, $active);
    }

    public function resetPromo($id_promo)
    {
        $promo = new Promo($this->db);
        return $promo->resetPromo($id_promo);
    }

    public function getPromo()
    {
        $promo = new Promo($this->db);
        return $promo->getPromo();
    }

    public function getPromoById($id_promo)
    {
        $promo = new Promo($this->db);
        return $promo->getPromoById($id_promo);
    }

    public function createPromo($data)
    {
        $promo = new Promo($this->db);
        return $promo->addPromo(
            $data['code'],
            $data['nom_promo'],
            $data['description'],
            $data['date_debut'],
            $data['date_fin'],
            $data['reduction_value'],
            $data['type_reduction'],
            $data['montant_max'] ?? null,
            $data['condition_min'] ?? 0,
            $data['vendeur_id'] ?? null,
            $data['est_globale']
        );
    }

    public function applyPromoToCart($code, $panier_produits)
    {
        $promo = new Promo($this->db);
        return $promo->isPromoValid($code, $panier_produits);
    }

    public function deletePromo($id_promo)
    {
        $promo = new Promo($this->db);
        return $promo->deletePromo($id_promo);
    }
}
