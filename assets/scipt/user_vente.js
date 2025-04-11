document.addEventListener("DOMContentLoaded", function () {
  loadUserProducts();
});

function loadUserProducts() {
  fetch("../public/index.php?api=produit&action=getProduitsByUser")
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        displayProducts(data);
      } else {
        showAlert("Aucun produit trouvé", "warning");
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
      showAlert("Erreur lors du chargement des produits", "danger");
    });
}

function displayProducts(products) {
  const tbody = document.getElementById("productTableBody");
  tbody.innerHTML = "";

  products.forEach((product) => {
    const statusBadge = getStatusBadge(product);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${product.title}</td>
      <td>${product.description.substring(0, 50)}...</td>
      <td>${product.price}€</td>
      <td>${product.quantite}</td>
      <td>
        <img src="${product.image || "../img/imgProduct/default.jpg"}" 
             alt="produit" class="product-img-small">
      </td>
      <td>${statusBadge}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="showProductDetails(${
          product.id_produit
        })">
          Voir
        </button>
        <button class="btn btn-sm btn-primary" onclick="editProduct(${
          product.id_produit
        })">
          Modifier
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${
          product.id_produit
        })">
          Supprimer
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getStatusBadge(product) {
  if (product.actif === 0) {
    return `<span class="badge bg-secondary">Pas en vente</span>`;
  } else if (product.valide === 1) {
    return `<span class="badge bg-success">Validé</span>`;
  } else if (product.refuse === 1) {
    return `<span class="badge bg-danger" style="cursor: pointer" 
            onclick="showRefusalReason('${
              product.comm_refu || "Aucun commentaire"
            }')">Refusé</span>`;
  } else {
    return `<span class="badge bg-warning">En attente de validation</span>`;
  }
}

function showRefusalReason(message) {
  const refusModal = new bootstrap.Modal(document.getElementById("refusModal"));
  document.getElementById("refusMessage").textContent = message;
  refusModal.show();
}

function showProductDetails(productId) {
  fetch(
    `../public/index.php?api=produit&action=getProduitsById&id=${productId}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const product = data.produit[0];
        document.getElementById("productName").textContent = product.title;
        document.getElementById(
          "productPrice"
        ).textContent = `Prix: ${product.price}€`;
        document.getElementById(
          "productCategory"
        ).textContent = `Catégorie: ${product.category_name}`;

        // Afficher le statut et le message de refus si nécessaire
        const rejectionDiv = document.getElementById("rejectionReason");
        if (product.refuse === 1) {
          rejectionDiv.style.display = "block";
          rejectionDiv.querySelector("p").textContent =
            product.comm_refu || "Aucun commentaire";
        } else {
          rejectionDiv.style.display = "none";
        }

        const modal = new bootstrap.Modal(
          document.getElementById("productDetailModal")
        );
        modal.show();
      }
    })
    .catch((error) => console.error("Erreur:", error));
}

function editProduct(productId) {
  const modal = new bootstrap.Modal(
    document.getElementById("confirmEditModal")
  );
  const confirmButton = document.getElementById("confirmEdit");

  // Reset previous event listeners
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  newConfirmButton.addEventListener("click", () => {
    fetch("../public/index.php?api=produit&action=resetValidation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        modal.hide();
        if (data.success) {
          // Stocker l'ID dans sessionStorage avant la redirection
          sessionStorage.setItem("editProductId", productId);
          // Redirection vers la page d'édition
          window.location.href = `edit.html?id=${productId}`;
        } else {
          showNotification(
            "danger",
            "Erreur lors de la réinitialisation du statut de validation"
          );
        }
      })
      .catch((error) => {
        modal.hide();
        showNotification("danger", "Une erreur est survenue");
      });
  });

  modal.show();
}

function deleteProduct(productId) {
  const modal = new bootstrap.Modal(
    document.getElementById("confirmDeleteModal")
  );
  const confirmButton = document.getElementById("confirmDelete");

  // Reset previous event listeners
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  newConfirmButton.addEventListener("click", () => {
    fetch(
      `../public/index.php?api=produit&action=deleteProduit&id=${productId}`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        modal.hide();
        if (data.success) {
          loadUserProducts();
          showNotification("success", "Produit supprimé avec succès");
        } else {
          showNotification("danger", "Erreur lors de la suppression");
        }
      })
      .catch((error) => {
        modal.hide();
        showNotification(
          "danger",
          "Une erreur est survenue lors de la suppression"
        );
      });
  });

  modal.show();
}

function showNotification(type, message) {
  const notificationDiv = document.getElementById("notificationMessage");
  notificationDiv.className = `alert alert-${type}`;
  notificationDiv.textContent = message;

  const modal = new bootstrap.Modal(
    document.getElementById("notificationModal")
  );
  modal.show();
}

// Remplacer tous les appels à showAlert par showNotification
function showAlert(message, type) {
  showNotification(type, message);
}
