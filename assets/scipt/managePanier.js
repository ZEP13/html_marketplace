document.addEventListener("DOMContentLoaded", function () {
  const alertContainer = document.getElementById("alertContainernav");
  const cardPanier = document.getElementById("cardPanier");

  // Perform the fetch request to load cart data
  fetch("../public/index.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Server Response:", data);

      // Check if the server returned a successful response
      if (data.success) {
        if (Array.isArray(data.panier) && data.panier.length > 0) {
          // If the cart contains products, display them
          data.panier.forEach((product) => {
            const productCard = document.createElement("div");
            productCard.classList.add("card", "mb-3");

            // Handle default image if null
            const imageSrc = product.image
              ? product.image
              : "../img/imgProduct/default.jpg";

            // Add content inside the card
            productCard.innerHTML = `
              <div class="row g-0">
                <div class="col-md">
                  <img src="${imageSrc}" class="img-fluid rounded-start" alt="${product.title}" style="object-fit: cover; height: 100%;">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title mb-2">${product.title}</h5>
                    <p class="card-text"><small class="text-muted">Quantity:</small>
                      <input 
                        min="1" 
                        type="number" 
                        class="quantity-input" 
                        style="margin-left:3px; width:50px;" 
                        value="${product.quantite_panier}" 
                        data-id="${product.id_produit}" 
                      >
                    </p>
                    <p class="card-text"><strong>${product.price}€</strong></p>
                    <button class="btn btn-sm delete-btn" data-id="${product.id_produit}">
                      <i class="bi bi-trash"></i> <!-- Bootstrap Trash Icon -->
                    </button>
                  </div>
                </div>
              </div>
            `;
            cardPanier.appendChild(productCard);
          });
        } else {
          // If the cart is empty, show a message
          const noProductsMessage = document.createElement("p");
          noProductsMessage.textContent = "Your cart is empty.";
          noProductsMessage.classList.add("text-center", "text-muted");
          cardPanier.appendChild(noProductsMessage);
        }
      } else {
        alertContainer.innerHTML = `<div class="alert alert-danger">Error: ${
          data.message || "Unknown error"
        }</div>`;
      }
    })
    .catch((error) => {
      console.error("Error while fetching cart data:", error);
      alertContainer.innerHTML = `<div class="alert alert-danger">Error loading the cart.</div>`;
    });

  // Handle changes to the quantity and send the updated quantity via POST
  cardPanier.addEventListener("change", function (event) {
    if (event.target && event.target.classList.contains("quantity-input")) {
      const quantityInput = event.target;
      const id_produit = quantityInput.getAttribute("data-id"); // Get the product ID
      const newQuantity = parseInt(quantityInput.value, 10); // Get the new quantity

      // Validate the input (ensure it's a valid positive integer)
      if (newQuantity < 0 || isNaN(newQuantity)) {
        alertContainer.innerHTML = `<div class="alert alert-danger">Invalid quantity.</div>`;
        return;
      }

      // Send the updated quantity to the server via a POST request
      fetch("../public/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addPanier", // Action to update the quantity
          id_produit: id_produit, // Send the product ID
          quantite: newQuantity, // Send the new quantity
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

  // Handle delete button clicks
  cardPanier.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("bi-trash")) {
      const deleteButton = event.target;
      const id_produit = deleteButton.getAttribute("data-id");

      // Send the delete request to remove the product from the cart
      fetch("../public/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete", id_produit: id_produit }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const productRow = deleteButton.closest(".cardPanier");
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
});
