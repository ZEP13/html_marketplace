class SearchManager {
  constructor() {
    this.products = [];
    this.searchInput = null;
    this.searchDropdown = null;
    this.searchButton = null;

    // Pour gestion mobile
    this.isMobile = window.matchMedia("(max-width: 767px)").matches;
    this.mobileOverlay = null;
  }

  init() {
    const maxAttempts = 10;
    let attempts = 0;

    const tryInit = () => {
      this.searchInput = document.getElementById("searchInput");
      this.searchDropdown = document.getElementById("searchDropdown");
      this.searchButton = document.querySelector(".search-container button");

      if (!this.searchInput || !this.searchDropdown) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryInit, 100);
          return;
        }
        console.error("Impossible d'initialiser les composants de recherche");
        return;
      }

      this.setupEventListeners();
      this.loadProducts().then(() => this.checkUrlParams());
    };

    tryInit();
  }

  setupEventListeners() {
    // Recherche live avec debounce
    this.searchInput.addEventListener(
      "input",
      this.debounce(() => {
        const query = this.searchInput.value.trim();
        if (query) {
          this.showResults(query);
        } else {
          this.hideDropdown();
        }
      }, 300)
    );

    // Bouton recherche click
    this.searchButton?.addEventListener("click", () => this.handleSearch());

    // Touche Entrée dans l'input
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    // Clic en dehors du dropdown pour fermer (desktop)
    document.addEventListener("click", (e) => {
      if (
        !this.searchInput.contains(e.target) &&
        !this.searchDropdown.contains(e.target) &&
        !this.isMobile // sur mobile on gère différemment
      ) {
        this.hideDropdown();
      }
    });

    // Sur mobile, quand on focus l’input, on ouvre l’overlay plein écran
    if (this.isMobile) {
      this.searchInput.addEventListener("focus", () =>
        this.openMobileOverlay()
      );
    }
  }

  openMobileOverlay() {
    if (this.mobileOverlay) return; // déjà ouvert

    // Création overlay mobile plein écran
    this.mobileOverlay = document.createElement("div");
    this.mobileOverlay.style.position = "fixed";
    this.mobileOverlay.style.top = 0;
    this.mobileOverlay.style.left = 0;
    this.mobileOverlay.style.width = "100vw";
    this.mobileOverlay.style.height = "100vh";
    this.mobileOverlay.style.backgroundColor = "white";
    this.mobileOverlay.style.zIndex = 9999;
    this.mobileOverlay.style.overflowY = "auto";
    this.mobileOverlay.style.padding = "10px";

    // Repositionner l’input et dropdown dans l’overlay
    const cloneInput = this.searchInput.cloneNode(true);
    cloneInput.value = this.searchInput.value;
    cloneInput.style.width = "100%";
    cloneInput.style.fontSize = "1.2rem";
    cloneInput.id = "searchInputMobile";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Fermer";
    closeButton.style.margin = "10px 0";
    closeButton.style.padding = "10px";
    closeButton.style.fontSize = "1.2rem";
    closeButton.style.width = "100%";
    closeButton.addEventListener("click", () => this.closeMobileOverlay());

    // Vider contenu actuel du dropdown pour injecter dans overlay
    this.searchDropdown.style.position = "static";
    this.searchDropdown.style.maxHeight = "70vh";
    this.searchDropdown.style.overflowY = "auto";

    this.mobileOverlay.appendChild(cloneInput);
    this.mobileOverlay.appendChild(closeButton);
    this.mobileOverlay.appendChild(this.searchDropdown);

    document.body.appendChild(this.mobileOverlay);

    // Mise à jour searchInput & ajout listener sur clone mobile
    this.searchInput = cloneInput;
    this.setupMobileInputListener();

    cloneInput.focus();
  }

  setupMobileInputListener() {
    this.searchInput.addEventListener(
      "input",
      this.debounce(() => {
        const query = this.searchInput.value.trim();
        if (query) {
          this.showResults(query);
        } else {
          this.hideDropdown();
        }
      }, 300)
    );

    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });
  }

  closeMobileOverlay() {
    if (!this.mobileOverlay) return;

    // Restaurer input original (hors overlay)
    const originalInput = document.getElementById("searchInput");
    if (originalInput) {
      this.searchInput = originalInput;
    }

    // Replacer dropdown à sa place d'origine dans le DOM
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer && this.searchDropdown) {
      searchContainer.appendChild(this.searchDropdown);
      this.searchDropdown.style.position = "";
      this.searchDropdown.style.maxHeight = "";
      this.searchDropdown.style.overflowY = "";
    }

    this.hideDropdown();

    // Supprimer overlay
    this.mobileOverlay.remove();
    this.mobileOverlay = null;

    // Remettre listeners classiques sur input original
    this.setupEventListeners();
  }

  async loadProducts() {
    try {
      const response = await fetch(
        "../public/index.php?api=produit&action=getAllProduits"
      );
      const data = await response.json();

      this.products =
        data.success && Array.isArray(data.products) ? data.products : [];

      if (!this.products.length) {
        console.error("Aucun produit chargé :", data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
      this.products = [];
    }
  }

  showResults(query) {
    if (!Array.isArray(this.products)) {
      console.error("Products is not an array:", this.products);
      return;
    }

    const results = this.products
      .filter(
        (product) =>
          product.title?.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 4);

    if (results.length > 0) {
      this.searchDropdown.classList.add("active");
      this.displayResults(results);
    } else {
      this.searchDropdown.innerHTML =
        '<div class="p-2">Aucun résultat trouvé</div>';
      this.searchDropdown.classList.add("active");
    }
  }

  displayResults(results) {
    this.searchDropdown.innerHTML = results.length
      ? results
          .map(
            (product) => `
    <a href="./detail_produit.html?id=${
      product.id_produit
    }" class="search-result-item">
      <div class="d-flex align-items-center p-2">
        <img src="${
          product.image || "../img/imgProduct/default.jpg"
        }" class="mini-search-img me-2" alt="${product.title}">
        <div>
          <div class="fw-bold">${product.title}</div>
          <div class="text-muted small">${product.price}€</div>
        </div>
      </div>
    </a>
  `
          )
          .join("")
      : '<div class="p-2">Aucun résultat trouvé</div>';
  }

  hideDropdown() {
    this.searchDropdown.classList.remove("active");
    this.searchDropdown.innerHTML = "";
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();

    if (!query) {
      window.location.href = "./file_produit.html";
      return;
    }

    if (!Array.isArray(this.products) || this.products.length === 0) {
      await this.loadProducts();
    }

    const results = this.products.filter(
      (product) =>
        product.title?.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
    );

    window.location.href = `./file_produit.html?search=${encodeURIComponent(
      query
    )}&hasResults=${results.length > 0}`;
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search");
    const marqueQuery = urlParams.get("marque");
    const hasResults = urlParams.get("hasResults") === "true";

    if (marqueQuery) {
      fetch(
        `../public/index.php?api=produit&action=getByMarque&marque=${encodeURIComponent(
          marqueQuery
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          const container = document.querySelector(".card-container");
          if (container) {
            if (data.success && Array.isArray(data.products)) {
              if (data.products.length === 0) {
                container.innerHTML = `
                  <div class="text-center my-5">
                    <h3>Pas de produits trouvés pour la marque : "${marqueQuery}"</h3>
                  </div>`;
              } else {
                container.innerHTML = data.products
                  .map((product) => this.createProductCardHtml(product))
                  .join("");
                this.setupCardEventListeners(container);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des produits:", error);
        });
    } else if (searchQuery) {
      this.searchInput.value = searchQuery;

      if (!hasResults) {
        document
          .querySelector(".pagination")
          ?.style.setProperty("display", "none");
        const mainContent =
          document.querySelector(".product-container") ||
          document.querySelector("main");
        if (mainContent) {
          mainContent.innerHTML = `
            <div class="text-center my-5">
              <h3>Pas de résultat pour la recherche : "${searchQuery}"</h3>
            </div>`;
        }
      } else {
        const filtered = this.products.filter(
          (product) =>
            product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        this.displayProducts(filtered);
      }
    }
  }

  displayProducts(products) {
    const container = document.querySelector(".card-container");
    if (!container) return;

    container.innerHTML = products
      .map((product) => this.createProductCardHtml(product))
      .join("");

    this.setupCardEventListeners(container);
  }

  createProductCardHtml(product) {
    const reviewCount = parseInt(product.review_count) || 0;
    const averageRating = Math.round(parseFloat(product.average_rating)) || 0;

    const stockStatus =
      product.quantite <= 0
        ? "Rupture de stock"
        : product.quantite < 5
        ? `Plus que ${product.quantite} en stock`
        : "";

    const stockAlertHtml = `<p class="text-muted small" id="alertStock">${stockStatus}</p>`;

    const reviewsHtml =
      reviewCount > 0
        ? `<div class="text-warning">${"★".repeat(averageRating)}${"☆".repeat(
            5 - averageRating
          )}<span class="text-muted"> (${reviewCount} avis)</span></div>`
        : '<div class="text-muted">Aucun avis</div>';

    const cartButton =
      product.quantite <= 0
        ? `<a href="#" class="btn btn-secondary panier stop-propagation disabled" title="Produit en rupture de stock">
            <i class="fas fa-cart-plus"></i>
           </a>`
        : `<a href="#" class="btn btn-secondary panier stop-propagation" data-id="${product.id_produit}">
            <i class="fas fa-cart-plus"></i>
           </a>`;

    return `
      <div class="col-12 col-md-4 pb-3" id="produitCard">
        <div class="product-card card product-details" data-id="${
          product.id_produit
        }">
          ${stockAlertHtml}
          <img
            class="card-img-top"
            src="${product.image || "../img/imgProduct/default.jpg"}"
            alt="${product.title || "Image produit"}"
            width="70"
          />
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <div class="col">
              <div class="col-md-12">
                <p class="card-text"><strong>Prix: </strong>${
                  product.price
                } €</p>
              </div>
              <div class="col-md-12">${reviewsHtml}</div>
              <div class="col-md-12">
                <p class="card-text description">${product.description}</p>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <a href="./detail_product.php?id=${
              product.id_produit
            }" class="btn btn-primary stop-propagation">
              <i class="fas fa-heart"></i>
            </a>
            ${cartButton}
          </div>
        </div>
      </div>
    `;
  }

  setupCardEventListeners(container) {
    container.querySelectorAll(".product-details").forEach((card) => {
      card.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        window.location.href = `detail_produit.html?id=${productId}`;
      });
    });

    container.querySelectorAll(".panier").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        const produitId = this.getAttribute("data-id");
        // TODO: Logique ajout au panier ici
      });
    });
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Initialisation au chargement DOM
document.addEventListener("DOMContentLoaded", () => {
  window.searchManager = new SearchManager();
  setTimeout(() => window.searchManager.init(), 200);
});

// Export global (si besoin)
window.SearchManager = SearchManager;
