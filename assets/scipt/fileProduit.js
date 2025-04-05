let currentPage = 1;
const itemsPerPage = 9;
let allProducts = [];

document.addEventListener("DOMContentLoaded", function () {
  // Check for search results in sessionStorage
  const searchQuery = new URLSearchParams(window.location.search).get("search");
  if (searchQuery) {
    // Load all products then filter
    fetch(`../public/index.php?api=produit&action=getAllProduits`)
      .then((response) => response.json())
      .then((data) => {
        allProducts = data;
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
    // Normal product loading
    fetch(`../public/index.php?api=produit&action=getAllProduits`)
      .then((response) => response.json())
      .then((data) => {
        allProducts = data;
        console.log(allProducts);

        setupPagination(allProducts.length);
        displayProducts(1);
      });
  }
});

function openDetailProduit(id) {
  document.location.href = `detail_produit.html?id=${id}`;
}

function displayProducts(page, products = allProducts) {
  const container = document.querySelector(".card-container");
  container.innerHTML = ""; // Clear container

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = products.slice(startIndex, endIndex);

  let htmlContent = ""; // Accumulate HTML content

  paginatedItems.forEach((produit) => {
    const reviewCount = parseInt(produit.review_count) || 0;
    const averageRating = Math.round(parseFloat(produit.average_rating)) || 0;

    const reviewsHtml =
      reviewCount > 0
        ? `<div class="text-warning">${"★".repeat(averageRating)}${"☆".repeat(
            5 - averageRating
          )}<span class="text-muted"> (${reviewCount} avis)</span></div>`
        : '<div class="text-muted">Aucun avis</div>';

    htmlContent += `
      <div class="col-12 col-md-4 pb-3" id="produitCard">
        <div class="product-card card" onclick="openDetailProduit(${
          produit.id_produit
        })">
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
              produit.id
            }" class="btn btn-primary">
              <i class="fas fa-heart"></i>
            </a>
            <a href="#" class="btn btn-secondary panier" data-id="${
              produit.id
            }">
              <i class="fas fa-cart-plus"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = htmlContent; // Inject the accumulated HTML

  // Ajouter les gestionnaires d'événements pour les boutons "Ajouter au panier"
  const cartButtons = container.querySelectorAll(".panier");
  const alertContainer = document.getElementById("alertContainerfilproduit");

  cartButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
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
            alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
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
