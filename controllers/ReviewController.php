<?php

namespace ControllersReview;

require_once '../models/Review.php';
require_once '../config/Database.php';

use ModelsReview\Review;
use Config\Database;

class ReviewController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getReveiwByProduct($id)
    {
        $review = new Review($this->db);
        return $review->getReveiwByProduct($id);
    }
    public function getAllReview()
    {
        $review = new Review($this->db);
        return $review->getAllReview();
    }

    public function AddReview($id_user, $id_produit, $rating, $commentaire)
    {
        $review = new Review($this->db);
        return $review->AddReview($id_user, $id_produit, $rating, $commentaire);
    }
}
