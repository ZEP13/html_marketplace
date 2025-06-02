document.addEventListener("DOMContentLoaded", function () {
  loadTrendingProducts();
  loadCategories();
  loadActivePromotions();
});

function loadTrendingProducts() {
  fetch("../public/index.php?api=produit&action=getValidProducts")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur réseau");
      return response.json();
    })
    .then((data) => {
      if (data.success && data.products) {
        const trendingProducts = data.products
          .filter((p) => p.valide === 1 && p.actif === 1)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4);

        displayTrendingProducts(trendingProducts);
      } else {
        throw new Error("Format de données invalide");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      const trendingContainer = document.querySelector("#trendingProducts");
      if (trendingContainer) {
        trendingContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger text-center">
              Erreur lors du chargement des produits tendances
            </div>
          </div>`;
      }
    });
}

function loadCategories() {
  fetch("../public/index.php?api=category&action=getAllCategories")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur réseau");
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        const categoriesContainer = document.querySelector(
          "#categoriesContainer"
        );
        let html = "";
        const categoriesImg = [
          "../img/categorieImg/CategorieEnfant.jpg",
          "../img/categorieImg/CategorieGaming.jpg",
          "../img/categorieImg/CategorieSport.jpg",
        ];
        data.categories.slice(0, 3).forEach((category, index) => {
          html += `
            <div class="col-md-4">
                <div class="category-card" onclick="redirectToProducts(${category.id}, '${category.category_name}')" style="cursor: pointer;">
                    <img src="${categoriesImg[index]}" 
                         alt="${category.category_name}"
                         onerror="this.src='../img/imgProduct/default.jpg'">
                    <div class="category-overlay">
                        <h3>${category.category_name}</h3>
                        <p>Explorer la catégorie</p>
                    </div>
                </div>
            </div>`;
        });

        categoriesContainer.innerHTML = html;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      const categoriesContainer = document.querySelector(
        "#categoriesContainer"
      );
      if (categoriesContainer) {
        categoriesContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger text-center">
              Erreur lors du chargement des catégories
            </div>
          </div>`;
      }
    });
}

// Ajouter cette nouvelle fonction pour la redirection
function redirectToProducts(categoryId, categoryName) {
  window.location.href = `file_produit.html?category=${categoryId}`;
}

function loadActivePromotions() {
  fetch("../public/index.php?api=promo&action=getPromo")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur réseau");
      return response.json();
    })
    .then((data) => {
      if (data.success && Array.isArray(data.promos)) {
        // Filtrer les promos qui sont :
        // 1. Créées par l'admin
        // 2. Actives
        // 3. Dans la période de validité
        const currentDate = new Date().getTime();
        const activeAdminPromos = data.promos.filter((promo) => {
          const startDate = new Date(promo.date_debut).getTime();
          const endDate = new Date(promo.date_fin).getTime();

          return (
            promo.ajoute_par_admin === 1 &&
            promo.actif === 1 &&
            currentDate >= startDate &&
            currentDate <= endDate
          );
        });

        displayPromotions(activeAdminPromos);
      } else {
        throw new Error("Format de données invalide");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      const promoContainer = document.querySelector("#promoContainer");
      if (promoContainer) {
        promoContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-info text-center">
              Aucune promotion disponible pour le moment
            </div>
          </div>`;
      }
    });
}

function displayTrendingProducts(products) {
  const trendingContainer = document.querySelector("#trendingProducts");
  if (!trendingContainer) return;

  if (products.length === 0) {
    trendingContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Aucun produit tendance disponible
        </div>
      </div>`;
    return;
  }

  let html = products
    .map(
      (product) => `
    <div class="col-md-3">
      <div class="feature-card card h-100">
        <div class="position-relative">
          <span class="position-absolute badge bg-danger" style="top: 10px; right: 10px">HOT</span>
          <img src="${product.image || "../img/imgProduct/default.jpg"}" 
               class="card-img-top" 
               alt="${product.title}"
               onerror="this.src='../img/imgProduct/default.jpg'">
        </div>
        <div class="card-body">
          <h5 class="card-title">${product.title}</h5>
          <p class="text-primary fw-bold">${product.price} €</p>
          <div class="d-flex justify-content-center">
            <a href="detail_produit.html?id=${product.id_produit}" 
               class="btn btn-outline-primary btn-sm">
              Voir le produit
            </a>
          </div>
        </div>
      </div>
    </div>`
    )
    .join("");

  trendingContainer.innerHTML = html;
}

function displayPromotions(promos) {
  const promoContainer = document.querySelector("#promoContainer");
  if (!promoContainer) return;

  if (promos.length === 0) {
    promoContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Aucune promotion disponible pour le moment
        </div>
      </div>`;
    return;
  }

  const html = promos
    .slice(0, 2)
    .map(
      (promo) => `
    <div class="col-md-6">
      <div class="feature-card card">
        <div class="row g-0">
          <div class="col-md-4">
            <div class="promo-image-container bg-light d-flex align-items-center justify-content-center" style="height: 100%;">
              <i class="fas fa-tag fa-3x text-primary"></i>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${promo.nom_promo || "Promotion"}</h5>
              <p class="card-text">${promo.description || ""}</p>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary">CODE: ${promo.code}</span>
                <span class="badge bg-success">${
                  promo.type_reduction === "pourcentage"
                    ? promo.reduction_value + "%"
                    : promo.reduction_value + "€"
                }</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`
    )
    .join("");

  promoContainer.innerHTML = html;
}
