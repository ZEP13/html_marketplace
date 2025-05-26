let currentPage = 1;
const itemsPerPage = 15;
let allProducts = [];
let filteredProducts = [];
let userLikes = [];

document.addEventListener("DOMContentLoaded", async function () {
  const loader = document.getElementById("loader");
  const container = document.querySelector(".card-container");
  const alertContainer = document.getElementById("alertContainerfilproduit");
  const pagination = document.querySelector(".pagination");

  // Afficher le loader
  if (loader) loader.classList.remove("loader-hidden");

  // Lire params URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get("category");
  const searchQuery = urlParams.get("search");
  const marqueQuery = urlParams.get("marque");

  // Fonction pour cacher loader
  function hideLoader() {
    if (loader) loader.classList.add("loader-hidden");
  }

  // Récupérer les likes utilisateur
  async function fetchUserLikes() {
    try {
      const resp = await fetch("../public/index.php?api=like&action=like");
      const data = await resp.json();
      if (data.success && Array.isArray(data.likes)) {
        userLikes = data.likes.map((like) => String(like.id_produit));
      }
    } catch (err) {
      console.error("Erreur récupération likes:", err);
    }
  }

  // Charger produits selon filtre + appliquer pagination + afficher
  async function loadProducts() {
    try {
      if (marqueQuery) {
        // Par marque
        const resp = await fetch(
          `../public/index.php?api=produit&action=getByMarque&marque=${encodeURIComponent(
            marqueQuery
          )}`
        );
        const data = await resp.json();
        if (data.success && Array.isArray(data.products)) {
          allProducts = data.products;
          filteredProducts = allProducts; // pas de filtre supplémentaire
        } else {
          filteredProducts = [];
          if (container) {
            container.innerHTML = `
              <div class="text-center my-5">
                <h3>Aucun produit trouvé pour la marque : "${marqueQuery}"</h3>
              </div>`;
          }
          return;
        }
      } else {
        // Par défaut, on récupère tous les produits validés
        const resp = await fetch(
          `../public/index.php?api=produit&action=getValidProducts`
        );
        const data = await resp.json();
        allProducts = Array.isArray(data.products) ? data.products : [];

        if (categoryId) {
          // Attendre le select catégorie
          await waitForElement("#selectCategoryProduit");
          const selectCategory = document.getElementById(
            "selectCategoryProduit"
          );
          if (selectCategory) selectCategory.value = categoryId;

          filteredProducts = allProducts.filter(
            (p) => String(p.category) === String(categoryId)
          );
        } else if (searchQuery) {
          filteredProducts = allProducts.filter(
            (p) =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          filteredProducts = allProducts;
        }
      }

      if (container) {
        if (filteredProducts.length === 0) {
          container.innerHTML =
            '<div class="col-12"><p>Aucun produit trouvé</p></div>';
        } else {
          setupPagination(filteredProducts.length);
          displayProducts(1, filteredProducts);
        }
      }
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      if (container) {
        container.innerHTML =
          '<div class="col-12"><p>Erreur lors du chargement des produits</p></div>';
      }
    } finally {
      hideLoader();
    }
  }

  await fetchUserLikes();
  await loadProducts();

  // Gestion du select catégorie (chargement categories)
  fetch("../public/index.php?api=category&action=getAllCategories", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      const selecte = document.getElementById("selectCategoryProduit");
      if (!data.success || !Array.isArray(data.categories)) {
        console.error(
          "Erreur : La réponse ne contient pas de catégories :",
          data
        );
        if (selecte)
          selecte.innerHTML =
            '<option value="">Erreur lors de la récupération des catégories</option>';
        return;
      }
      if (data.categories.length === 0) {
        if (selecte)
          selecte.innerHTML =
            '<option value="">Aucune catégorie disponible</option>';
        return;
      }
      // Remplir select categories
      if (selecte) {
        selecte.innerHTML =
          '<option value="">-- Choisir une catégorie --</option>';
        data.categories.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.id;
          option.textContent = cat.category_name;
          selecte.appendChild(option);
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête catégories :", error);
      const selecte = document.getElementById("selectCategoryProduit");
      if (selecte)
        selecte.innerHTML =
          '<option value="">Erreur lors de la récupération des catégories</option>';
    });

  // Recharger produits si changement catégorie dans le select
  const selectCategoryProduit = document.getElementById(
    "selectCategoryProduit"
  );
  if (selectCategoryProduit) {
    selectCategoryProduit.addEventListener("change", async function () {
      const selectedCategory = this.value;
      currentPage = 1;

      if (selectedCategory) {
        filteredProducts = allProducts.filter(
          (p) => String(p.category) === String(selectedCategory)
        );
      } else {
        filteredProducts = allProducts;
      }
      if (filteredProducts.length === 0) {
        if (container)
          container.innerHTML =
            '<div class="col-12"><p>Aucun produit trouvé</p></div>';
      } else {
        setupPagination(filteredProducts.length);
        displayProducts(currentPage, filteredProducts);
      }
    });
  }

  // Gérer l'updateRecentProducts au clic sur produit
  container?.addEventListener("click", function (e) {
    // Trouver l'élément card parent
    let target = e.target;
    while (target && !target.classList.contains("product-details")) {
      target = target.parentElement;
    }
    if (target) {
      const productId = target.getAttribute("data-id");
      if (productId) updateRecentProducts(productId);
    }
  });

  // Fonction waitForElement (déjà bonne)
  function waitForElement(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) return resolve();
      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Fonction displayProducts avec gestion events likes et panier
  function displayProducts(page, products) {
    if (!container) return;
    container.innerHTML = "";
    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML =
        '<div class="col-12"><p>Aucun produit trouvé</p></div>';
      return;
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = products.slice(startIndex, endIndex);

    let htmlContent = "";
    paginatedItems.forEach((produit) => {
      const reviewCount = parseInt(produit.review_count) || 0;
      const averageRating = Math.round(parseFloat(produit.average_rating)) || 0;

      const stockStatus =
        produit.quantite <= 0
          ? "Rupture de stock"
          : produit.quantite < 5
          ? `Plus que ${produit.quantite} en stock`
          : "";

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

      const isLiked = userLikes.includes(String(produit.id_produit));
      const likeButton = `<a href="#" class="btn btn-primary like${
        isLiked ? " liked" : ""
      } stop-propagation" data-product-id="${produit.id_produit}">
        <i class="fas fa-heart${isLiked ? " liked" : ""}"></i>
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
              ${likeButton}
              ${cartButton}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = htmlContent;

    // Ajouter event clic sur likes
    container.querySelectorAll(".like").forEach((button) => {
      button.addEventListener("click", async function (event) {
        event.stopPropagation();
        event.preventDefault();

        const hasSession = await checkSession();
        if (!hasSession) return;

        const produitId = this.getAttribute("data-product-id");
        const heartIcon = this.querySelector("i");
        const isCurrentlyLiked = this.classList.contains("liked");
        const action = isCurrentlyLiked ? "deleteLike" : "addLike";
        const apiUrl = "../public/index.php?api=like&action=" + action;

        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: action, id_produit_like: produitId }),
        })
          .then((resp) => resp.json())
          .then((data) => {
            if (data.success) {
              if (isCurrentlyLiked) {
                this.classList.remove("liked");
                heartIcon.classList.remove("liked");
                userLikes = userLikes.filter((id) => id !== produitId);
              } else {
                this.classList.add("liked");
                heartIcon.classList.add("liked");
                userLikes.push(produitId);
              }
            } else {
              console.error(data.message || "Erreur like");
            }
          })
          .catch((error) => console.error("Erreur like :", error));
      });
    });

    // Ajouter event clic sur panier
    container.querySelectorAll(".panier:not(.disabled)").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();

        if (!button.classList.contains("stop-propagation")) {
          // Juste au cas où
          return;
        }

        const idProduit = button.getAttribute("data-id");
        let panier = JSON.parse(localStorage.getItem("panier")) || [];
        let produitExistant = panier.find((p) => p.id === idProduit);

        if (produitExistant) {
          produitExistant.quantite += 1;
        } else {
          panier.push({ id: idProduit, quantite: 1 });
        }
        localStorage.setItem("panier", JSON.stringify(panier));
        // Optionnel : afficher une confirmation, un toast, etc.
      });
    });
  }

  // Fonction de vérification de session (exemple, à adapter)
  async function checkSession() {
    try {
      const resp = await fetch(
        "../public/index.php?api=auth&action=checkSession"
      );
      const data = await resp.json();
      if (!data.loggedIn) {
        alert("Vous devez être connecté pour aimer un produit.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erreur vérification session:", error);
      return false;
    }
  }

  // Fonction pagination
  function setupPagination(totalItems) {
    if (!pagination) return;
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return; // pas de pagination si 1 ou 0 page

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.classList.add("page-item");
      if (i === currentPage) li.classList.add("active");

      const a = document.createElement("a");
      a.classList.add("page-link");
      a.href = "#";
      a.textContent = i;
      a.dataset.page = i;

      li.appendChild(a);
      pagination.appendChild(li);
    }
  }

  // Event delegation pagination (à mettre une seule fois)
  if (pagination) {
    pagination.addEventListener("click", function (e) {
      e.preventDefault();
      const target = e.target;
      if (target.tagName === "A" && target.dataset.page) {
        const page = parseInt(target.dataset.page);
        if (page && page !== currentPage) {
          currentPage = page;
          displayProducts(currentPage, filteredProducts);
          setupPagination(filteredProducts.length);
          // Scroll en haut
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
  }

  // Gestion des produits récents dans localStorage
  function updateRecentProducts(idProduit) {
    let recentProducts =
      JSON.parse(localStorage.getItem("recentProducts")) || [];
    // Eviter doublon
    recentProducts = recentProducts.filter((id) => id !== idProduit);
    recentProducts.unshift(idProduit);
    if (recentProducts.length > 10)
      recentProducts = recentProducts.slice(0, 10);
    localStorage.setItem("recentProducts", JSON.stringify(recentProducts));
  }
});
