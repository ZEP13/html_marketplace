<?php

namespace ControllersCategory;

require_once '../models/Category.php';
require_once '../config/Database.php';

use ModelsCategory\Category;
use Config\Database;

class CategoryController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getCategory()
    {
        $Category = new Category($this->db);
        return $Category->getCategory();
    }

    public function addCategory($nom)
    {
        $Category = new Category($this->db);
        return $Category->addCategory($nom);
    }
}
