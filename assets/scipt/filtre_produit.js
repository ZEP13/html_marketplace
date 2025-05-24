//file pour filtre les produit sur la page fileproduit,  filtre et affiche les resulte de filtre sur la page produit.
function isInStock(produit) {
  return produit.stock > 0;
}

function byMostSellItem() {
  fetch("../public/index.php?api=commande&action=getComandeByMostSell", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((reponse) => reponse.json())
    .then((data) => {
      console.log(data);
      return data.commande;
    });
}

function byMostRatedItem() {
  fetch(`../public/index.php?api=review&action=getAllReview`, {
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
        console.error("Les données ne sont pas dans le format attendu:", data);
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

document.addEventListener("DOMContentLoaded", function () {
  // Get filter elements
  const priceRange = document.getElementById("priceRange");
  const priceValueText = document.getElementById("priceValueText");
  const selectCategory = document.getElementById("selectCategoryProduit");
  const sortSelect = document.querySelector('select[name="like"]');
  const stockCheckbox = document.getElementById("flexCheckDefault");
  const mostSoldCheckbox = document.getElementById("flexCheckChecked");
  const filterButton = document.querySelector(".btn-outline-primary");
  const ratingSelect = document.querySelector('select[name="rating"]');

  // Ajouter le gestionnaire pour le bouton reset
  const resetButton = document.querySelector(
    '.btn-outline-primary[data-action="reset"]'
  );

  resetButton.addEventListener("click", function (e) {
    e.preventDefault();
    resetFilters();
  });

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
          const priceLabel = document.querySelector('label[for="priceRange"]');
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
    // Récupérer les paramètres d'URL actuels
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search");

    // Réinitialiser les filtres
    const maxPrice = priceRange.getAttribute("max");
    priceRange.value = maxPrice;
    priceValueText.textContent = maxPrice + "€";
    selectCategory.value = "";
    sortSelect.value = "";
    stockCheckbox.checked = false;
    mostSoldCheckbox.checked = false;

    // Réinitialiser les notes
    if (ratingSelect) {
      ratingSelect.value = "0";
    }

    // Réinitialiser l'affichage des produits en préservant la recherche
    fetch(`../public/index.php?api=produit&action=getValidProducts`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          let filteredProducts = [...data.products];

          // Appliquer le filtre de recherche si une recherche existe
          if (searchQuery) {
            filteredProducts = filteredProducts.filter(
              (product) =>
                product.title
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                product.description
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
            );
          }

          // Mettre à jour l'affichage
          displayProducts(1, filteredProducts);
          setupPagination(filteredProducts.length);

          // Forcer le rafraîchissement de la pagination
          document.querySelector(".pagination").style.display = "flex";

          // Réinitialiser la classe active sur les boutons de filtre
          document.querySelectorAll(".filter-btn").forEach((btn) => {
            btn.classList.remove("active");
          });

          // Afficher le message de confirmation avec mention de la recherche active
          const container = document.querySelector(".card-container");
          if (container) {
            const alertDiv = document.createElement("div");
            alertDiv.className =
              "alert alert-success alert-dismissible fade show";
            alertDiv.innerHTML = `
                        Filtres réinitialisés ${
                          searchQuery
                            ? `(recherche active : "${searchQuery}")`
                            : ""
                        }
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    `;
            container.insertAdjacentElement("beforebegin", alertDiv);

            // Auto-supprimer l'alerte après 3 secondes
            setTimeout(() => {
              alertDiv.remove();
            }, 3000);
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la réinitialisation:", error);
        const container = document.querySelector(".card-container");
        if (container) {
          container.insertAdjacentHTML(
            "beforebegin",
            `
                    <div class="alert alert-danger alert-dismissible fade show">
                        Erreur lors de la réinitialisation des filtres
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `
          );
        }
      });
  }
  // Update price text when range changes
  priceRange.addEventListener("input", function () {
    priceValueText.textContent = this.value;
  });

  // Filter button click handler
  filterButton.addEventListener("click", function (e) {
    e.preventDefault();
    applyFilters();
  });

  // Rendre la fonction accessible globalement
  window.applyFilters = applyFilters;

  function applyFilters() {
    const selectCategory = document.getElementById("selectCategoryProduit");
    if (!selectCategory) return; // Protection contre les appels trop précoces

    const filters = {
      maxPrice: parseFloat(document.getElementById("priceRange").value),
      category: selectCategory.value,
      sortBy: document.querySelector('select[name="like"]')?.value || "",
      inStock: document.getElementById("flexCheckDefault")?.checked || false,
      mostSold: document.getElementById("flexCheckChecked")?.checked || false,
      rating:
        parseInt(document.querySelector('select[name="rating"]')?.value) || 0,
    };

    fetch(`../public/index.php?api=produit&action=getValidProducts`)
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau");
        return response.json();
      })
      .then((data) => {
        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Format de données invalide");
        }

        let filteredProducts = [...data.products];

        // Appliquer le filtre de catégorie en premier si présent
        if (filters.category) {
          filteredProducts = filteredProducts.filter(
            (product) => product.category == filters.category
          );
        }

        // Appliquer d'abord le filtre de recherche si une recherche existe
        if (filters.search) {
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.title
                ?.toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              product.description
                ?.toLowerCase()
                .includes(filters.search.toLowerCase())
          );
        }

        // Appliquer ensuite les autres filtres sur les résultats de recherche
        if (filters.rating > 0) {
          filteredProducts = filteredProducts.filter((product) => {
            const rating = parseFloat(product.average_rating) || 0;
            return rating >= filters.rating && rating < filters.rating + 1;
          });
        }

        if (filters.inStock) {
          filteredProducts = filteredProducts.filter(
            (product) => parseInt(product.quantite) > 0
          );
        }

        // Mettre à jour le max du range avec le prix le plus élevé
        if (filteredProducts.length > 0) {
          const newMaxPrice = Math.ceil(
            Math.max(...filteredProducts.map((p) => parseFloat(p.price)))
          );
          priceRange.max = newMaxPrice;
          const priceLabel = document.querySelector('label[for="priceRange"]');
          priceLabel.textContent = `Plage de prix: (0€ - ${newMaxPrice}€)`;

          if (parseFloat(priceRange.value) > newMaxPrice) {
            priceRange.value = newMaxPrice;
            priceValueText.textContent = `${newMaxPrice}€`;
          }
        }

        if (filters.maxPrice > 0) {
          filteredProducts = filteredProducts.filter(
            (product) => parseFloat(product.price) <= filters.maxPrice
          );
        }

        // Gérer l'affichage des résultats
        if (filteredProducts.length === 0) {
          const container = document.querySelector(".card-container");
          container.innerHTML = `
            <div class="col-12 text-center">
              <div class="alert alert-info" role="alert">
                ${
                  filters.search
                    ? `Aucun produit ne correspond à votre recherche "${filters.search}" avec les filtres sélectionnés.`
                    : "Aucun produit ne correspond aux filtres sélectionnés."
                }
              </div>
            </div>`;
          document.querySelector(".pagination").style.display = "none";
          return;
        }

        // Appliquer le tri
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case "1":
              filteredProducts.sort(
                (a, b) => parseFloat(b.price) - parseFloat(a.price)
              );
              break;
            case "2":
              filteredProducts.sort(
                (a, b) => parseFloat(a.price) - parseFloat(b.price)
              );
              break;
            case "3":
              filteredProducts.sort(
                (a, b) =>
                  parseFloat(b.average_rating || 0) -
                  parseFloat(a.average_rating || 0)
              );
              break;
          }
        }

        // Afficher les résultats filtrés
        displayProducts(1, filteredProducts);
        setupPagination(filteredProducts.length);
      })
      .catch((error) => {
        console.error("Erreur lors du filtrage:", error);
        const container = document.querySelector(".card-container");
        if (container) {
          container.innerHTML = `
            <div class="col-12">
              <div class="alert alert-danger text-center">
                Une erreur est survenue lors du filtrage des produits
              </div>
            </div>`;
        }
      });
  }

  function displayStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = "";

    // Ajouter les étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star text-warning"></i>';
    }

    // Ajouter la demi-étoile si nécessaire
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }

    // Ajouter les étoiles vides restantes
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star text-warning"></i>';
    }

    return stars;
  }

  // Modifier displayResults pour inclure les étoiles
  function displayResults(products) {
    if (products.length === 0) {
      const container = document.querySelector(".card-container");
      container.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-info" role="alert">
            Aucun produit ne correspond à vos critères de recherche.
          </div>
        </div>`;

      // Cacher la pagination quand il n'y a pas de résultats
      document.querySelector(".pagination").style.display = "none";
      return;
    }

    const container = document.querySelector(".card-container");
    container.innerHTML = products
      .map(
        (product) => `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="card product-card">
          <img src="${
            product.image || "../img/imgProduct/default.jpg"
          }" class="card-img-top" alt="${product.title}">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">${product.price}€</p>
            <div class="rating">
              ${displayStarRating(parseFloat(product.average_rating) || 0)}
              <small class="text-muted">(${
                product.review_count || 0
              } avis)</small>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    document.querySelector(".pagination").style.display = "flex";
    setupPagination(products.length);
  }
});
