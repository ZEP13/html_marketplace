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

function displayProducts(page, products = allProducts) {
  const container = document.querySelector(".card-container");
  container.innerHTML = ""; // Clear container

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = products.slice(startIndex, endIndex);

  paginatedItems.forEach((produit) => {
    const cardCol = document.createElement("div");
    cardCol.className = "col-12 col-md-4 pb-3";
    const card = document.createElement("div");
    card.className = "product-card card";

    const img = document.createElement("img");
    img.className = "card-img-top";
    img.src = produit.image || "../img/imgProduct/default.jpg";
    img.alt = produit.title || "Image produit";
    img.width = "70";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = produit.title;

    const row = document.createElement("div");
    row.className = "col";

    const priceCol = document.createElement("div");
    priceCol.className = "col-md-12";
    const priceText = document.createElement("p");
    priceText.className = "card-text";
    priceText.innerHTML = `<strong>Prix: </strong>${produit.price} €`;

    const reviewCol = document.createElement("div");
    reviewCol.className = "col-md-12";
    const reviewText = document.createElement("p");
    reviewText.className = "card-text";

    // Calcul de la moyenne des notes
    const reviewCount = parseInt(produit.review_count) || 0;
    const averageRating = Math.round(parseFloat(produit.average_rating)) || 0;

    const reviewsHtml =
      reviewCount > 0
        ? `<div class="text-warning">
            ${"★".repeat(averageRating)}
            ${"☆".repeat(5 - averageRating)}
            <span class="text-muted">(${reviewCount} avis)</span>
           </div>`
        : '<div class="text-muted">Aucun avis</div>';

    reviewText.innerHTML = reviewsHtml;

    const descriptionCol = document.createElement("div");
    descriptionCol.className = "col-md-12";
    const descriptionText = document.createElement("p");
    descriptionText.className = "card-text description";
    descriptionText.textContent = produit.description;

    row.appendChild(priceCol);
    row.appendChild(reviewCol);
    reviewCol.appendChild(reviewText);
    row.appendChild(descriptionCol);

    priceCol.appendChild(priceText);
    descriptionCol.appendChild(descriptionText);

    cardBody.appendChild(title);
    cardBody.appendChild(row);

    const btnContainer = document.createElement("div");
    btnContainer.className = "btn-container";

    const heartButton = document.createElement("a");
    heartButton.href = `./detail_product.php?id=${produit.id}`;
    heartButton.className = "btn btn-primary";
    const heartIcon = document.createElement("i");
    heartIcon.className = "fas fa-heart";
    heartButton.appendChild(heartIcon);

    const cartButton = document.createElement("a");
    cartButton.href = "#";
    cartButton.className = "btn btn-secondary panier";
    cartButton.id = "panier";
    const cartIcon = document.createElement("i");
    cartIcon.className = "fas fa-cart-plus";
    cartButton.appendChild(cartIcon);
    const alertContainer = document.getElementById("alertContainerfilproduit");
    if (cartButton) {
      cartButton.addEventListener("click", function (event) {
        event.preventDefault();

        // Récupérer l'ID du produit spécifique pour cet élément
        const produitId = produit.id_produit; // Utiliser l'id_produit de l'élément actuel

        // Appel de la fonction d'ajout au panier
        fetch("../public/index.php?api=panier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "addPanier",
            id_produit: produitId, // Utiliser l'id du produit spécifique
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
    } else {
      console.error("L'élément  n'a pas été trouvé.");
    }

    btnContainer.appendChild(heartButton);
    btnContainer.appendChild(cartButton);

    card.appendChild(img);
    card.appendChild(cardBody);
    card.appendChild(btnContainer);

    cardCol.appendChild(card);
    container.appendChild(cardCol);
  });
}

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
