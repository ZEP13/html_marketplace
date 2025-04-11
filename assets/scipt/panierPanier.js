const alertContainer = document.getElementById("alertContainerPanier");

document.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();

  let cartData; // Define a variable to store the cart data

  fetch("../public/index.php?api=panier")
    .then((response) => response.json())
    .then((data) => {
      cartData = data; // Store the fetched data here
      console.log(data);

      let htmlContent = "";
      const panierBox = document.getElementById("panierBox");
      const totalPanier = document.getElementById("total");
      const totalPaye = document.getElementById("totalPaye");
      const fraisPortBox = document.getElementById("fraisPort");
      const fraisPort = 50; // Frais de port standard
      const fraisPortGratuit = 80; // Seuil pour la livraison gratuite

      if (!data.panier || data.panier.length === 0) {
        panierBox.innerHTML = `
          <div class="text-center my-5">
            <h3>Votre panier est vide</h3>
            <p>Découvrez nos produits et commencez vos achats!</p>
          </div>`;
        totalPanier.textContent = "0.00 €";
        fraisPortBox.textContent = "0.00 €";
        totalPaye.textContent = "0.00 €";
        return;
      }

      let total = data.panier.reduce((sum, produit) => {
        return sum + produit.price * produit.quantite_panier;
      }, 0);

      // Générer le contenu du panier
      data.panier.forEach((produit) => {
        htmlContent += `
            <div class="cart-item d-flex justify-content-between align-items-center" data-id="${
              produit.id
            }">
              <div class="d-flex align-items-center">
                <img src="${
                  produit.image || "../img/imgProduct/default.jpg"
                }" alt="Image produit" class="img-fluid me-3" />
                <div>
                  <div class="item-title">${produit.title}</div>
                  <div class="item-price">${produit.price} €</div>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <input type="number" 
                  max="${produit.quantite}" 
                  class="form-control item-quantity" 
                  value="${produit.quantite_panier}" 
                  min="1" 
                  data-id="${produit.id_produit}"
                  data-stock="${produit.quantite}" />
                <span class="remove-btn ms-3" data-id="${
                  produit.id_produit
                }">Supprimer</span>
              </div>
            </div>
          `;
      });

      panierBox.innerHTML = htmlContent;
      totalPanier.textContent = total.toFixed(2) + " €";

      // Vérification des frais de port
      let totalAvecFrais = total;
      if (total >= fraisPortGratuit) {
        fraisPortBox.innerHTML = "Gratuit";
        totalPaye.textContent = total.toFixed(2) + " €";
      } else {
        fraisPortBox.innerHTML = fraisPort + " €";
        totalAvecFrais += fraisPort;
        totalPaye.textContent = totalAvecFrais.toFixed(2) + " €";
      }

      // Ajouter les event listeners pour la vérification en temps réel
      document.querySelectorAll(".item-quantity").forEach((input) => {
        input.addEventListener("input", function (e) {
          const stock = parseInt(this.getAttribute("data-stock"), 10);
          const value = parseInt(this.value, 10);

          if (value > stock) {
            this.value = stock;
            alertContainer.innerHTML = `
              <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Le stock disponible est limité à ${stock} unités
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
          }

          if (value < 1) {
            this.value = 1;
          }
        });
      });

      setupPanierEventListeners(cartData); // Pass the data to the event handler
    });

  function setupPanierEventListeners(data) {
    // Gérer la suppression des produits
    document.addEventListener("click", function (e) {
      if (e.target.matches(".remove-btn")) {
        const id_produit = e.target.getAttribute("data-id");

        fetch("../public/index.php?api=panier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete",
            id_produit: id_produit,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              const productRow = e.target.closest(".cart-item");
              productRow.remove(); // Supprimer l'élément du DOM
              alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
              updateTotalPanier();
            } else {
              console.error("Error while deleting the product:", data.message);
              alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
          })
          .catch((error) => {
            console.error("Error while deleting the product:", error);
            alertContainer.innerHTML = `<div class="alert alert-danger">Error deleting the product.</div>`;
          });
      }
    });

    // Gérer le changement de la quantité d'un produit
    document.addEventListener("change", function (e) {
      if (e.target.matches(".item-quantity")) {
        const quantityInput = e.target;
        const id_produit = quantityInput.getAttribute("data-id");
        const newQuantity = parseInt(quantityInput.value, 10);

        // Find the correct product data based on the ID
        const produit = data.panier.find((p) => p.id_produit == id_produit);
        const quantiteStock = produit ? produit.quantite : 0;

        if (newQuantity < 1 || isNaN(newQuantity)) {
          alertContainer.innerHTML = `<div class="alert alert-danger">Quantité invalide.</div>`;
          return;
        }

        if (quantiteStock >= newQuantity) {
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
                updateTotalPanier();
              } else {
                alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
              }
            })
            .catch((error) => {
              console.error("Error updating quantity:", error);
              alertContainer.innerHTML = `<div class="alert alert-danger">Error updating the quantity.</div>`;
            });
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">Quantité supérieure au stock disponible.</div>`;
        }
      }
    });
  }

  function updateTotalPanier() {
    fetch("../public/index.php?api=panier")
      .then((response) => response.json())
      .then((data) => {
        if (!data.panier || data.panier.length === 0) {
          // Si le panier est vide
          document.getElementById("panierBox").innerHTML = `
            <div class="text-center my-5">
              <h3>Votre panier est vide</h3>
              <p>Découvrez nos produits et commencez vos achats!</p>
            </div>`;
          document.getElementById("total").textContent = "0.00 €";
          document.getElementById("fraisPort").textContent = "0.00 €";
          document.getElementById("totalPaye").textContent = "0.00 €";
          return;
        }

        const total = data.panier.reduce(
          (sum, produit) => sum + produit.price * produit.quantite_panier,
          0
        );
        const fraisPort = total >= 80 ? 0 : 50;
        const totalPaye = total + fraisPort;

        document.getElementById("total").textContent = total.toFixed(2) + " €";
        document.getElementById("fraisPort").textContent =
          fraisPort > 0 ? fraisPort + " €" : "Gratuit";
        document.getElementById("totalPaye").textContent =
          totalPaye.toFixed(2) + " €";
      });
  }
});
