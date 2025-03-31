let panierInitialized = false;
let isLoading = false;

function initializePanier() {
  if (panierInitialized) return;
  panierInitialized = true;
  loadPanierContent();
  setupPanierEventListeners();
}

function loadPanierContent() {
  if (isLoading) return;

  const cardPanier = document.getElementById("cardPanier");
  const alertContainer = document.getElementById("alertContainernav");

  if (!cardPanier || !alertContainer) return;

  isLoading = true;
  cardPanier.innerHTML = '<p class="text-center">Chargement...</p>';

  fetch("../public/index.php?api=panier")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && Array.isArray(data.panier)) {
        cardPanier.innerHTML =
          data.panier.length > 0
            ? data.panier
                .map(
                  (product) => `
              <div class="card mb-3">
                <div class="row g-0">
                  <div class="col-md">
                    <img src="${
                      product.image || "../img/imgProduct/default.jpg"
                    }" 
                         class="img-fluid rounded-start" 
                         alt="${product.title}"
                         onerror="this.src='../img/imgProduct/default.jpg'"
                         style="object-fit: cover; height: 100%;">
                  </div>
                  <div class="col-md-8">
                    <div class="card-body">
                      <h5 class="card-title mb-2">${product.title}</h5>
                      <p class="card-text"><small class="text-muted">Quantité:</small>
                        <input type="number" 
                               min="1" 
                               value="${product.quantite_panier}" 
                               class="quantity-input" 
                               data-id="${product.id_produit}"
                               style="margin-left:3px; width:50px">
                      </p>
                      <p class="card-text"><strong>${
                        product.price
                      }€</strong></p>
                      <button class="btn btn-danger btn-sm delete-btn" 
                              data-id="${product.id_produit}">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>`
                )
                .join("")
            : '<p class="text-center text-muted">Votre panier est vide</p>';
      }
    })
    .catch((error) => console.error("Error loading cart:", error))
    .finally(() => {
      isLoading = false;
    });
}

function setupPanierEventListeners() {
  document.addEventListener("click", function (e) {
    if (e.target.matches(".bi-trash") || e.target.closest(".delete-btn")) {
      const deleteButton = e.target.closest(".delete-btn");
      const id_produit = deleteButton.getAttribute("data-id");

      fetch("../public/index.php?api=panier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete", id_produit: id_produit }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const productRow = deleteButton.closest(".card");
            productRow.remove();
            alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          } else {
            console.error("Error while deleting the product:", data.message);
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch((error) => {
          console.error("Error while deleting the product:", error);
        });
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target.matches(".quantity-input")) {
      const quantityInput = e.target;
      const id_produit = quantityInput.getAttribute("data-id");
      const newQuantity = parseInt(quantityInput.value, 10);

      if (newQuantity < 0 || isNaN(newQuantity)) {
        alertContainer.innerHTML = `<div class="alert alert-danger">Invalid quantity.</div>`;
        return;
      }

      fetch("../public/index.php?api=panier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addPanier",
          id_produit: id_produit,
          quantite: newQuantity,
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
          console.error("Error updating quantity:", error);
          alertContainer.innerHTML = `<div class="alert alert-danger">Error updating the quantity.</div>`;
        });
    }
  });
}

window.initializePanier = initializePanier;
