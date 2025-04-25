class SearchManager {
  constructor() {
    this.products = [];
    this.searchInput = null;
    this.searchDropdown = null;
    this.searchButton = null;
  }

  init() {
    // Add retry logic for navbar elements
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
        console.error("Could not initialize search components");
        return;
      }

      this.setupEventListeners();
      this.loadProducts();
      this.checkUrlParams();
    };

    tryInit();
  }

  setupEventListeners() {
    // Live search
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

    // Search button click
    this.searchButton?.addEventListener("click", () => this.handleSearch());

    // Enter key
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    // Click outside
    document.addEventListener("click", (e) => {
      if (
        !this.searchInput.contains(e.target) &&
        !this.searchDropdown.contains(e.target)
      ) {
        this.hideDropdown();
      }
    });
  }

  async loadProducts() {
    try {
      const response = await fetch(
        "../public/index.php?api=produit&action=getAllProduits"
      );
      const data = await response.json();

      // Update to handle the new API response format
      this.products =
        data.success && Array.isArray(data.products) ? data.products : [];

      if (!this.products.length) {
        console.error("No products loaded:", data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
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

    // Si la recherche est vide, rediriger vers la page des produits sans paramètres
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
    const hasResults = urlParams.get("hasResults") === "true";

    if (searchQuery) {
      this.searchInput.value = searchQuery;

      // Si aucun résultat, afficher le message
      if (!hasResults) {
        document.querySelector(".pagination").style.display = "none";
        const mainContent =
          document.querySelector(".product-container") ||
          document.querySelector("main");
        if (mainContent) {
          mainContent.innerHTML = `
            <div class="text-center my-5">
              <h3>Pas de résultat pour la recherche : "${searchQuery}"</h3>
            </div>`;
        }
      }
    }
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Initialize search with a delay to ensure navbar is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.searchManager = new SearchManager();
  setTimeout(() => window.searchManager.init(), 200);
});
