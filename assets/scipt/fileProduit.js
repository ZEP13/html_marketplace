let currentPage = 1;
const itemsPerPage = 15;
let allProducts = [];

document.addEventListener("DOMContentLoaded", function () {
  // Afficher le loader
  const loader = document.getElementById("loader");
  loader.classList.remove("loader-hidden");

  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get("category");
  const searchQuery = urlParams.get("search");
  const marqueQuery = urlParams.get("marque");

  // Fonction pour cacher le loader
  function hideLoader() {
    loader.classList.add("loader-hidden");
  }

  // Modifier les fetch existants pour gérer le loader
  if (marqueQuery) {
    // Utiliser la nouvelle route API pour les produits filtrés par marque
    fetch(
      `../public/index.php?api=produit&action=getByMarque&marque=${encodeURIComponent(
        marqueQuery
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          allProducts = data.products;
          setupPagination(allProducts.length);
          displayProducts(1, allProducts);
        } else {
          const container = document.querySelector(".card-container");
          if (container) {
            container.innerHTML = `
              <div class="text-center my-5">
                <h3>Aucun produit trouvé pour la marque : "${marqueQuery}"</h3>
              </div>`;
          }
        }
      })
      .finally(() => {
        hideLoader();
      });
  } else if (categoryId) {
    // Charger d'abord tous les produits
    fetch(`../public/index.php?api=produit&action=getValidProducts`)
      .then((response) => response.json())
      .then((data) => {
        allProducts = data.products || [];

        // Attendre que les catégories soient chargées
        waitForElement("#selectCategoryProduit")
          .then(() => {
            const selectCategory = document.getElementById(
              "selectCategoryProduit"
            );
            selectCategory.value = categoryId;

            // Filtrer les produits par catégorie
            const filteredProducts = allProducts.filter((product) => {
              // Convertir les deux valeurs en chaînes pour la comparaison
              return String(product.category) === String(categoryId);
            });

            console.log("Produits filtrés:", filteredProducts); // Debug
            console.log("Catégorie recherchée:", categoryId); // Debug

            // Mettre à jour l'affichage
            setupPagination(filteredProducts.length);
            displayProducts(1, filteredProducts);
          })
          .catch((error) =>
            console.error("Erreur lors de l'application du filtre:", error)
          );
      })
      .finally(() => {
        hideLoader();
      });
  } else if (searchQuery) {
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
      })
      .finally(() => {
        hideLoader();
      });
  } else {
    // Utiliser la nouvelle route API pour le chargement normal
    fetch(`../public/index.php?api=produit&action=getValidProducts`)
      .then((response) => response.json())
      .then((data) => {
        allProducts = data.products || [];
        setupPagination(allProducts.length);
        displayProducts(1);
      })
      .finally(() => {
        hideLoader();
      });
  }
});

function openDetailProduit(id) {
  document.location.href = `detail_produit.html?id=${id}`;
}

// Ajouter la fonction checkSession
function checkSession() {
  return fetch("../public/index.php?api=user&action=getSessionId", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        window.location.href = "../views/login.html";
        return false;
      }
      return true;
    });
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
            <a href="./detail_produit.html?id=${
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
    button.addEventListener("click", async function (event) {
      event.stopPropagation();
      event.preventDefault();

      const hasSession = await checkSession();
      if (!hasSession) return;

      const produitId = this.getAttribute("data-id");

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
            if (window.updatePanierContent) {
              window.updatePanierContent();
            }
            if (window.updateCartBadge) {
              window.updateCartBadge();
            }
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

        // Scroll with offset
        const container = document.querySelector(".hautdefil");
        if (container) {
          const offset = 150; // Ajustez cette valeur pour définir la distance au-dessus
          const containerPosition =
            container.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: containerPosition - offset,
            behavior: "smooth",
          });
        }
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

// Ajouter cette fonction utilitaire
function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve();
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
