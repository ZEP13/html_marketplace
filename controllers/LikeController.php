<?php

namespace ControllersLike;

require_once '../models/Like.php';
require_once '../config/Database.php';

use ModelsLike\Like;
use Config\Database;

class LikeController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function addLike($userId, $idProduit)
    {
        $like = new Like($this->db);
        return $like->addLike($userId, $idProduit);
    }

    public function removeLike($userId, $idProduit)
    {
        $like = new Like($this->db);
        return $like->removeLike($userId, $idProduit);
    }

    public function getLikesByUser($userId)
    {
        $like = new Like($this->db);
        return $like->getLikesByUser($userId);
    }
}
