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
      // Vérifier si data contient des produits
      if (!Array.isArray(data)) {
        console.error("Les données ne sont pas dans le format attendu:", data);
        return;
      }

      // Sort based on the 'price' field
      const sortedProduits = [...data].sort((a, b) => {
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
        if (Array.isArray(data) && data.length > 0) {
          const maxPrice = Math.ceil(
            Math.max(...data.map((p) => parseFloat(p.price)))
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
    // Réinitialiser les valeurs des filtres
    const maxPrice = priceRange.getAttribute("max");
    priceRange.value = maxPrice;
    priceValueText.textContent = maxPrice + "€";
    selectCategory.value = "";
    sortSelect.value = "";
    stockCheckbox.checked = false;
    mostSoldCheckbox.checked = false;

    // Recharger tous les produits
    fetch(`../public/index.php?api=produit&action=getAllProduits`)
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error(
            "Les données ne sont pas dans le format attendu:",
            data
          );
          return;
        }
        // Afficher tous les produits sans filtre
        displayProducts(1, data);
        setupPagination(data.length);
      })
      .catch((error) => {
        console.error("Erreur lors de la réinitialisation:", error);
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

  function applyFilters() {
    const filters = {
      maxPrice: parseFloat(priceRange.value),
      category: selectCategory.value,
      sortBy: sortSelect.value,
      inStock: stockCheckbox.checked,
      mostSold: mostSoldCheckbox.checked,
      rating: parseInt(ratingSelect.value) || 0,
      search: new URLSearchParams(window.location.search).get("search") || "",
    };

    fetch(`../public/index.php?api=produit&action=getAllProduits`)
      .then((response) => response.json())
      .then((data) => {
        // Vérifier si data contient des produits
        if (!Array.isArray(data)) {
          console.error(
            "Les données ne sont pas dans le format attendu:",
            data
          );
          return;
        }

        let filteredProducts = [...data];

        // Appliquer le filtre de notation
        if (filters.rating > 0) {
          filteredProducts = filteredProducts.filter((product) => {
            const rating = parseFloat(product.average_rating) || 0;
            // Retourne les produits avec une note égale ou supérieure jusqu'à la note suivante
            return rating >= filters.rating && rating < filters.rating + 1;
          });
        }

        // Appliquer les autres filtres
        if (filters.category) {
          filteredProducts = filteredProducts.filter(
            (product) => product.category == filters.category
          );
        }

        if (filters.inStock) {
          filteredProducts = filteredProducts.filter(
            (product) => parseInt(product.quantite) > 0
          );
        }

        // Mettre à jour le max du range avec le prix le plus élevé des produits filtrés
        if (filteredProducts.length > 0) {
          const newMaxPrice = Math.ceil(
            Math.max(...filteredProducts.map((p) => parseFloat(p.price)))
          );
          priceRange.max = newMaxPrice;

          // Mettre à jour le label avec le nouveau max
          const priceLabel = document.querySelector('label[for="priceRange"]');
          priceLabel.textContent = `Plage de prix: (0€ - ${newMaxPrice}€)`;

          // Si le prix sélectionné est plus grand que le nouveau max, l'ajuster
          if (parseFloat(priceRange.value) > newMaxPrice) {
            priceRange.value = newMaxPrice;
            priceValueText.textContent = `${newMaxPrice}€`;
          }
        }

        // Appliquer le filtre de prix après la mise à jour du max
        if (filters.maxPrice > 0) {
          filteredProducts = filteredProducts.filter(
            (product) => parseFloat(product.price) <= filters.maxPrice
          );
        }

        // Vérifier s'il y a des résultats
        if (filteredProducts.length === 0) {
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

        // Rendre la pagination visible s'il y a des résultats
        document.querySelector(".pagination").style.display = "flex";

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
        container.innerHTML = `
          <div class="col-12 text-center">
            <div class="alert alert-danger" role="alert">
              Une erreur est survenue lors de la recherche des produits.
            </div>
          </div>`;
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
