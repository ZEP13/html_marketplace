let currentPage = 1;
const itemsPerPage = 9;
let allProducts = [];

document.addEventListener("DOMContentLoaded", function () {
  const searchQuery = new URLSearchParams(window.location.search).get("search");
  if (searchQuery) {
    // Utiliser la nouvelle route API qui filtre les produits actifs et validés
    fetch(`../public/index.php?api=produit&action=getValidProducts`)
      .then((response) => response.json())
      .then((data) => {
        allProducts = data.products || [];
        const filteredProducts = allProducts.filter(
          (product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setupPagination(filteredProducts.length);
        displayProducts(1, filteredProducts);
      });
  } else {
    // Utiliser la nouvelle route API pour le chargement normal
    fetch(`../public/index.php?api=produit&action=getValidProducts`)
      .then((response) => response.json())
      .then((data) => {
        allProducts = data.products || [];
        setupPagination(allProducts.length);
        displayProducts(1);
      });
  }
});

function openDetailProduit(id) {
  document.location.href = `detail_produit.html?id=${id}`;
}

function displayProducts(page, products = allProducts) {
  console.log("Données reçues:", products); // Debug log
  const container = document.querySelector(".card-container");

  if (!container) {
    console.error("Container .card-container non trouvé");
    return;
  }

  container.innerHTML = "";

  // Ensure products is an array and not empty
  const productsArray = Array.isArray(products) ? products : [];

  if (productsArray.length === 0) {
    container.innerHTML =
      '<div class="col-12"><p>Aucun produit trouvé</p></div>';
    return;
  }

  console.log("Nombre de produits:", productsArray.length); // Debug log

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = productsArray.slice(startIndex, endIndex);

  console.log("Produits paginés:", paginatedItems); // Debug log

  let htmlContent = ""; // Accumulate HTML content

  paginatedItems.forEach((produit) => {
    const reviewCount = parseInt(produit.review_count) || 0;
    const averageRating = Math.round(parseFloat(produit.average_rating)) || 0;

    const stockStatus =
      produit.quantite <= 0
        ? "Rupture de stock"
        : produit.quantite < 5
        ? `Plus que ${produit.quantite} en stock`
        : ""; // Ne rien afficher si la quantité est suffisante

    // Créer un élément alertStock spécifique à chaque produit dans la carte
    const stockAlertHtml = `<p class="text-muted small" id="alertStock">${stockStatus}</p>`;

    const reviewsHtml =
      reviewCount > 0
        ? `<div class="text-warning">${"★".repeat(averageRating)}${"☆".repeat(
            5 - averageRating
          )}<span class="text-muted"> (${reviewCount} avis)</span></div>`
        : '<div class="text-muted">Aucun avis</div>';

    const cartButton =
      produit.quantite <= 0
        ? `<a href="#" class="btn btn-secondary panier stop-propagation disabled" title="Produit en rupture de stock">
             <i class="fas fa-cart-plus"></i>
           </a>`
        : `<a href="#" class="btn btn-secondary panier stop-propagation" data-id="${produit.id_produit}">
             <i class="fas fa-cart-plus"></i>
           </a>`;

    htmlContent += `
      <div class="col-12 col-md-4 pb-3" id="produitCard">
        <div class="product-card card product-details" data-id="${
          produit.id_produit
        }">
          ${stockAlertHtml}
          <img
            class="card-img-top"
            src="${produit.image || "../img/imgProduct/default.jpg"}"
            alt="${produit.title || "Image produit"}"
            width="70"
          />
          <div class="card-body">
            <h5 class="card-title">${produit.title}</h5>
            <div class="col">
              <div class="col-md-12">
                <p class="card-text"><strong>Prix: </strong>${
                  produit.price
                } €</p>
              </div>
              <div class="col-md-12">
                ${reviewsHtml}
              </div>
              <div class="col-md-12">
                <p class="card-text description">${produit.description}</p>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <a href="./detail_product.php?id=${
              produit.id_produit
            }" class="btn btn-primary stop-propagation">
              <i class="fas fa-heart"></i>
            </a>
            ${cartButton}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = htmlContent; // Inject the accumulated HTML

  // Add click handlers for product cards
  const productCards = container.querySelectorAll(".product-details");
  productCards.forEach((card) => {
    card.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      openDetailProduit(productId);
    });
  });

  // Ajouter les gestionnaires d'événements pour les boutons "Ajouter au panier"
  const cartButtons = container.querySelectorAll(".panier");
  const alertContainer = document.getElementById("alertContainerfilproduit");

  cartButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation(); // This prevents the click from bubbling up to the card
      event.preventDefault();

      const produitId = this.getAttribute("data-id"); // Récupérer l'ID du produit

      // Appel de la fonction d'ajout au panier
      fetch("../public/index.php?api=panier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addPanier",
          id_produit: produitId,
          quantite: 1,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Mettre à jour le panier sans rechargement
            if (window.updatePanierContent) {
              window.updatePanierContent();
            }
            if (window.updateCartBadge) {
              // Ajouter cette condition
              window.updateCartBadge();
            }
            // Ouvrir le panier automatiquement
            const offcanvasRight = new bootstrap.Offcanvas(
              document.getElementById("offcanvasRight")
            );
            offcanvasRight.show();
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
          }
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout au panier :", error);
        });
    });
  });
}

//affiche les categorie dans la section de filtrage
fetch("../public/index.php?api=category&action=getAllCategories", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    const selecte = document.getElementById("selectCategoryProduit");

    // Check if the response is successful and contains categories
    if (!data.success || !Array.isArray(data.categories)) {
      console.error(
        "Erreur : La réponse ne contient pas de catégories :",
        data
      );
      selecte.innerHTML =
        '<option value="">Erreur lors de la récupération des catégories</option>';
      return;
    }

    if (data.categories.length === 0) {
      selecte.innerHTML =
        '<option value="">Aucune catégorie disponible</option>';
      return;
    }

    // Populate the select element with categories
    data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.category_name;
      selecte.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Erreur lors de la requête :", error);
    const selecte = document.getElementById("selectCategory");
    selecte.innerHTML =
      '<option value="">Erreur lors de la récupération des catégories</option>';
  });

function setupPagination(totalItems) {
  const pagination = document.querySelector(".pagination");
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  // Clear existing pagination
  pagination.innerHTML = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>
  `;

  // Add page numbers
  for (let i = 1; i <= pageCount; i++) {
    pagination.innerHTML += `
      <li class="page-item ${currentPage === i ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  pagination.innerHTML += `
    <li class="page-item ${currentPage === pageCount ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>
  `;

  // Add click handlers
  pagination.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.tagName === "A") {
      const newPage = parseInt(e.target.dataset.page);
      if (newPage >= 1 && newPage <= pageCount) {
        currentPage = newPage;
        displayProducts(currentPage);
        setupPagination(totalItems);
      }
    }
  });
}

function updateRecentProducts(productId) {
  let recentProducts = JSON.parse(
    localStorage.getItem("recentProducts") || "[]"
  );
  let recentProductsData = JSON.parse(
    localStorage.getItem("recentProductsData") || "{}"
  );

  // Supprimer le produit s'il existe déjà
  const index = recentProducts.indexOf(productId);
  if (index > -1) {
    recentProducts.splice(index, 1);
  }

  // Ajouter le produit au début
  recentProducts.unshift(productId);

  // Garder seulement les 10 derniers produits
  if (recentProducts.length > 10) {
    recentProducts = recentProducts.slice(0, 10);
  }

  // Mettre à jour le timestamp
  recentProductsData[productId] = {
    timestamp: new Date().getTime(),
  };

  // Sauvegarder dans le localStorage
  localStorage.setItem("recentProducts", JSON.stringify(recentProducts));
  localStorage.setItem(
    "recentProductsData",
    JSON.stringify(recentProductsData)
  );

  // Déclencher l'événement de mise à jour
  document.dispatchEvent(new CustomEvent("recentProductsUpdated"));
}

// Ajouter l'appel à updateRecentProducts lors du clic sur un produit
document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...

  // Ajouter aux gestionnaires d'événements existants
  document
    .querySelectorAll(".product-card, .btn-primary")
    .forEach((element) => {
      element.addEventListener("click", (e) => {
        const productId = e.currentTarget.getAttribute("data-product-id");
        if (productId) {
          updateRecentProducts(productId);
        }
      });
    });
});
