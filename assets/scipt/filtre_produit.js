(function () {
  // Variables locales au module
  const itemsPerPage = 15;
  let currentPage = 1;
  let filteredProductsList = [];
  let searchResults = []; // Nouvelle variable pour stocker les résultats de recherche

  function isInStock(produit) {
    return produit.stock > 0;
  }

  function byMostSellItem() {
    return fetch(
      "../public/index.php?api=commande&action=getComandeByMostSell",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((reponse) => reponse.json())
      .then((data) => {
        console.log(data);
        return data.commande;
      });
  }

  function byMostRatedItem() {
    return fetch(`../public/index.php?api=review&action=getAllReview`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((reponse) => reponse.json())
      .then((dataReview) => {
        console.log(dataReview);
        return dataReview.review;
      })
      .catch((error) => {
        console.error("Erreur lors de la requête:", error);
      });
  }

  function byLowerPrice(sortOrder = "asc") {
    fetch(`../public/index.php?api=produit&action=getAllProduits`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        // Vérifier si data contient des produits dans le nouveau format
        if (!data.success || !Array.isArray(data.products)) {
          console.error(
            "Les données ne sont pas dans le format attendu:",
            data
          );
          return;
        }

        // Sort based on the 'price' field
        const sortedProduits = [...data.products].sort((a, b) => {
          if (sortOrder === "asc") {
            return parseFloat(a.price) - parseFloat(b.price);
          } else if (sortOrder === "desc") {
            return parseFloat(b.price) - parseFloat(a.price);
          }
          return 0;
        });

        // Display sorted products using the existing displayProducts function
        displayProducts(1, sortedProduits);
      })
      .catch((error) => {
        console.error("Erreur lors de la requête:", error);
      });
  }

  function displayProducts(page, products) {
    const container = document.querySelector(".card-container");
    if (!container) return;

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = `
      <div class="text-center my-5">
        <h3>Pas de produit trouvé</h3>
        <p class="mt-3">
          <a href="./file_produit.html" class="btn btn-primary">
            Voir tous les produits
          </a>
        </p>
      </div>`;
      document
        .querySelector(".pagination")
        ?.style.setProperty("display", "none");
      return;
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = products.slice(startIndex, endIndex);

    let htmlContent = "";
    paginatedItems.forEach((product) => {
      const reviewCount = parseInt(product.review_count) || 0;
      const averageRating = Math.round(parseFloat(product.average_rating)) || 0;
      const stockStatus =
        product.quantite <= 0
          ? "Rupture de stock"
          : product.quantite < 5
          ? `Plus que ${product.quantite} en stock`
          : "";

      htmlContent += `
      <div class="col-12 col-md-4 pb-3" id="produitCard">
        <div class="product-card card product-details" data-id="${
          product.id_produit
        }">
          <p class="text-muted small" id="alertStock">${stockStatus}</p>
          <img class="card-img-top" src="${
            product.image || "../img/imgProduct/default.jpg"
          }" alt="${product.title}"/>
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <div class="col">
              <div class="col-md-12">
                <p class="card-text"><strong>Prix: </strong>${
                  product.price
                } €</p>
              </div>
              <div class="col-md-12">
                <div class="text-warning">
                  ${"★".repeat(averageRating)}${"☆".repeat(5 - averageRating)}
                  <span class="text-muted">(${reviewCount} avis)</span>
                </div>
              </div>
              <div class="col-md-12">
                <p class="card-text description">${product.description}</p>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <a href="#" class="btn btn-primary stop-propagation">
              <i class="fas fa-heart"></i>
            </a>
            ${
              product.quantite <= 0
                ? `<a href="#" class="btn btn-secondary panier stop-propagation disabled" title="Produit en rupture de stock">
                   <i class="fas fa-cart-plus"></i>
                 </a>`
                : `<a href="#" class="btn btn-secondary panier stop-propagation" data-id="${product.id_produit}">
                   <i class="fas fa-cart-plus"></i>
                 </a>`
            }
          </div>
        </div>
      </div>
    `;
    });

    container.innerHTML = htmlContent;
    setupPagination(products.length);
  }

  // Add setupPagination at module level
  function setupPagination(totalItems) {
    const pagination = document.querySelector(".pagination");
    if (!pagination) return;

    const pageCount = Math.ceil(totalItems / itemsPerPage);
    pagination.innerHTML = "";

    // Bouton Previous
    pagination.innerHTML += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${
          currentPage - 1
        }">Previous</a>
      </li>
    `;

    // Pages numérotées
    for (let i = 1; i <= pageCount; i++) {
      pagination.innerHTML += `
        <li class="page-item ${currentPage === i ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Bouton Next
    pagination.innerHTML += `
      <li class="page-item ${currentPage === pageCount ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
      </li>
    `;

    // Remove any existing listeners
    pagination.removeEventListener("click", paginationClickHandler);
    // Add click handler
    pagination.addEventListener("click", paginationClickHandler);
  }

  // Separate handler function for pagination clicks
  function paginationClickHandler(e) {
    e.preventDefault();
    if (e.target.tagName === "A" && e.target.dataset.page) {
      const newPage = parseInt(e.target.dataset.page);
      const totalPages = Math.ceil(filteredProductsList.length / itemsPerPage);

      if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayProducts(currentPage, filteredProductsList);
        setupPagination(filteredProductsList.length);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Récupérer uniquement les éléments nécessaires
    const filterButton = document.querySelector(
      '.btn-outline-primary:not([data-action="reset"])'
    );
    const resetButton = document.querySelector('[data-action="reset"]');

    const selectCategory = document.getElementById("selectCategoryProduit");
    const priceRange = document.getElementById("priceRange");
    const priceValueText = document.getElementById("priceValue");
    const sortSelect = document.querySelector('select[name="like"]');
    const stockCheckbox = document.getElementById("flexCheckDefault");
    const ratingSelect = document.querySelector('select[name="rating"]');

    // Garder uniquement les listeners pour les boutons de filtre
    if (filterButton) {
      filterButton.addEventListener("click", function (e) {
        e.preventDefault();
        applyFilters();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function (e) {
        e.preventDefault();
        resetFilters();
      });
    }

    // Fonction displayProducts globale
    window.displayProducts = function (page, products) {
      const container = document.querySelector(".card-container");
      if (!container) return;

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `
      <div class="text-center my-5">
        <h3>Pas de produit trouvé</h3>
        <p class="mt-3">
          <a href="./file_produit.html" class="btn btn-primary">
            Voir tous les produits
          </a>
        </p>
      </div>`;
        document
          .querySelector(".pagination")
          ?.style.setProperty("display", "none");
        return;
      }

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedItems = products.slice(startIndex, endIndex);

      // Générer le HTML des produits
      let htmlContent = "";
      paginatedItems.forEach((produit) => {
        const reviewCount = parseInt(produit.review_count) || 0;
        const averageRating =
          Math.round(parseFloat(produit.average_rating)) || 0;
        const stockStatus =
          produit.quantite <= 0
            ? "Rupture de stock"
            : produit.quantite < 5
            ? `Plus que ${produit.quantite} en stock`
            : "";

        htmlContent += `
        <div class="col-12 col-md-4 pb-3" id="produitCard">
          <div class="product-card card product-details" data-id="${
            produit.id_produit
          }">
            <p class="text-muted small" id="alertStock">${stockStatus}</p>
            <img class="card-img-top" src="${
              produit.image || "../img/imgProduct/default.jpg"
            }" alt="${produit.title}"/>
            <div class="card-body">
              <h5 class="card-title">${produit.title}</h5>
              <div class="col">
                <div class="col-md-12">
                  <p class="card-text"><strong>Prix: </strong>${
                    produit.price
                  } €</p>
                </div>
                <div class="col-md-12">
                  <div class="text-warning">
                    ${"★".repeat(averageRating)}${"☆".repeat(5 - averageRating)}
                    <span class="text-muted">(${reviewCount} avis)</span>
                  </div>
                </div>
                <div class="col-md-12">
                  <p class="card-text description">${produit.description}</p>
                </div>
              </div>
            </div>
            <div class="btn-container">
              <a href="#" class="btn btn-primary stop-propagation">
                <i class="fas fa-heart"></i>
              </a>
              ${
                produit.quantite <= 0
                  ? `<a href="#" class="btn btn-secondary panier stop-propagation disabled" title="Produit en rupture de stock">
                     <i class="fas fa-cart-plus"></i>
                   </a>`
                  : `<a href="#" class="btn btn-secondary panier stop-propagation" data-id="${produit.id_produit}">
                     <i class="fas fa-cart-plus"></i>
                   </a>`
              }
            </div>
          </div>
        </div>
      `;
      });

      container.innerHTML = htmlContent;
      setupPagination(products.length);
    };

    // Fonction pour initialiser et mettre à jour l'affichage du prix
    function initializePriceRange() {
      fetch(`../public/index.php?api=produit&action=getAllProduits`)
        .then((response) => response.json())
        .then((data) => {
          const products = data.success && data.products ? data.products : [];
          if (products.length > 0) {
            const maxPrice = Math.ceil(
              Math.max(...products.map((p) => parseFloat(p.price)))
            );

            // Mise à jour des attributs du range
            priceRange.setAttribute("max", maxPrice);
            priceRange.value = maxPrice;

            // Mise à jour de l'affichage du prix
            priceValueText.textContent = maxPrice + "€";

            // Mise à jour du label avec le prix maximum
            const priceLabel = document.querySelector(
              'label[for="priceRange"]'
            );
            priceLabel.innerHTML = `Plage de prix (0€ - <span id="maxPriceLabel">${maxPrice}€</span>):`;

            // Ajouter un événement pour mettre à jour l'affichage en temps réel
            priceRange.addEventListener("input", function () {
              priceValueText.textContent = this.value + "€";
            });
          }
        })
        .catch((error) =>
          console.error("Erreur lors du chargement des prix:", error)
        );
    }

    // Initialiser le range de prix au chargement
    initializePriceRange();

    function resetFilters() {
      // Reset UI elements
      if (selectCategory) selectCategory.value = "";
      if (sortSelect) sortSelect.value = "";
      if (stockCheckbox) stockCheckbox.checked = false;
      if (ratingSelect) ratingSelect.value = "0";

      if (priceRange && priceValueText) {
        const maxPrice = priceRange.getAttribute("max");
        priceRange.value = maxPrice;
        priceValueText.textContent = maxPrice + "€";
      }

      // Restore search results if they exist
      const storedResults = localStorage.getItem("searchResults");
      if (storedResults) {
        searchResults = JSON.parse(storedResults);
        filteredProductsList = searchResults;
        displayProducts(1, filteredProductsList);
      } else {
        // If no search results, load all valid products
        fetch(`../public/index.php?api=produit&action=getValidProducts`)
          .then((response) => response.json())
          .then((data) => {
            if (!data.success || !Array.isArray(data.products)) {
              throw new Error("Invalid data format");
            }
            filteredProductsList = data.products;
            displayProducts(1, filteredProductsList);
          })
          .catch((error) => {
            console.error("Reset error:", error);
            showErrorAlert(
              "Une erreur est survenue lors de la réinitialisation"
            );
          });
      }
      setupPagination(filteredProductsList.length);
      showConfirmationAlert("Filtres réinitialisés");
    }

    priceRange.addEventListener("input", function () {
      priceValueText.textContent = this.value;
    });

    filterButton.addEventListener("click", function (e) {
      e.preventDefault();
      applyFilters();
    });

    window.applyFilters = applyFilters;

    function applyFilters() {
      // Determine the base product list to filter from
      const productsToFilter =
        searchResults.length > 0
          ? searchResults
          : JSON.parse(localStorage.getItem("searchResults")) ||
            filteredProductsList;

      let filtered = [...productsToFilter];

      // Apply filters
      if (selectCategory.value) {
        filtered = filtered.filter(
          (p) => String(p.category) === String(selectCategory.value)
        );
      }

      if (priceRange.value) {
        filtered = filtered.filter(
          (p) => parseFloat(p.price) <= parseFloat(priceRange.value)
        );
      }

      if (stockCheckbox?.checked) {
        filtered = filtered.filter((p) => parseInt(p.quantite) > 0);
      }

      if (ratingSelect?.value !== "0") {
        filtered = filtered.filter(
          (p) =>
            Math.round(parseFloat(p.average_rating) || 0) >=
            parseInt(ratingSelect.value)
        );
      }

      // Apply sorting
      if (sortSelect?.value) {
        switch (sortSelect.value) {
          case "1":
            filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
          case "2":
            filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
          case "3":
            filtered.sort(
              (a, b) =>
                (parseFloat(b.average_rating) || 0) -
                (parseFloat(a.average_rating) || 0)
            );
            break;
        }
      }

      filteredProductsList = filtered;
      currentPage = 1;
      displayProducts(1, filteredProductsList);
      setupPagination(filteredProductsList.length);
    }

    // Load search results on initial load if they exist
    const storedResults = localStorage.getItem("searchResults");
    if (storedResults) {
      searchResults = JSON.parse(storedResults);
      filteredProductsList = searchResults;
      displayProducts(1, filteredProductsList);
      setupPagination(filteredProductsList.length);
    }

    function showErrorAlert(message) {
      const container = document.querySelector(".card-container");
      if (container) {
        container.insertAdjacentHTML(
          "beforebegin",
          `<div class="alert alert-danger alert-dismissible fade show">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`
        );
      }
    }

    function showConfirmationAlert(message) {
      const container = document.querySelector(".card-container");
      if (container) {
        const alertDiv = document.createElement("div");
        alertDiv.className = "alert alert-success alert-dismissible fade show";
        alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
        container.insertAdjacentElement("beforebegin", alertDiv);

        setTimeout(() => alertDiv.remove(), 3000);
      }
    }
  });

  window.byMostSellItem = byMostSellItem;
  window.byMostRatedItem = byMostRatedItem;
  window.isInStock = isInStock;
  window.setupPagination = setupPagination;
})();
