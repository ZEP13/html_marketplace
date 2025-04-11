let currentSort = { field: "id", direction: "asc" };

document.addEventListener("DOMContentLoaded", function () {
  loadProducts();

  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", function () {
      const field = this.dataset.sort;
      currentSort.direction =
        currentSort.field === field && currentSort.direction === "asc"
          ? "desc"
          : "asc";
      currentSort.field = field;
      loadProducts();
    });
  });
});

function loadProducts() {
  fetch("../public/index.php?api=produit&action=getAllProduits")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateStatistics(data.products);
        displayProducts(data.products);
      } else {
        console.error("Erreur lors du chargement des produits:", data.message);
      }
    })
    .catch((error) => console.error("Erreur:", error));
}

function updateStatistics(products) {
  const pendingCount = products.filter(
    (p) => p.actif === 0 || p.valide === 0
  ).length;
  const validatedCount = products.filter(
    (p) => p.actif === 1 && p.valide === 1
  ).length;
  const rejectedCount = products.filter((p) => p.refuse === 1).length;

  document.getElementById("pendingProducts").textContent = pendingCount;
  document.getElementById("validatedProducts").textContent = validatedCount;
  document.getElementById("rejectedProducts").textContent = rejectedCount;
}

function displayProducts(products) {
  products.sort((a, b) => {
    let aValue = a[currentSort.field];
    let bValue = b[currentSort.field];

    // Gérer les cas spéciaux pour le tri
    if (currentSort.field === "prix") {
      aValue = parseFloat(a.price);
      bValue = parseFloat(b.price);
      return currentSort.direction === "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    if (currentSort.field === "vendeur") {
      aValue = `${a.user_nom} ${a.user_prenom}`;
      bValue = `${b.user_nom} ${b.user_prenom}`;
    }

    if (currentSort.field === "nom") {
      aValue = a.title;
      bValue = b.title;
    }

    return currentSort.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const tbody = document.getElementById("productTableBody");
  tbody.innerHTML = "";

  products.forEach((product) => {
    if (product.actif === 1) {
      const statusBadge = getStatusBadge(product);

      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>#${product.id_produit}</td>
      <td>${product.title}</td>
      <td>${product.user_nom} ${product.user_prenom}</td>
      <td>${product.price}€</td>
      <td>${statusBadge}</td>
      <td>
        <div class="btn-group">
          ${
            product.valide === 0
              ? `
            <button class="btn btn-sm btn-success" onclick="quickValidate(${product.id_produit})">
              <i class="fas fa-check fa-lg"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="quickRefuse(${product.id_produit})">
              <i class="fas fa-times fa-lg"></i>
            </button>
          `
              : ""
          }
          <a href="detailProduit.html?id=${
            product.id_produit
          }" class="btn btn-sm btn-info">
            <i class="fas fa-eye fa-lg"></i>
          </a>
        </div>
      </td>
    `;
      tbody.appendChild(tr);
    }
  });
}

function getStatusBadge(product) {
  if (product.valide === 1) {
    return `<span class="badge bg-success">Validé</span>`;
  } else if (product.refuse === 1) {
    return `<span class="badge bg-danger" title="${product.comm_refu}">Refusé</span>`;
  } else {
    return `<span class="badge bg-warning">En attente</span>`;
  }
}

function quickValidate(productId) {
  if (confirm("Voulez-vous vraiment valider ce produit ?")) {
    updateProductStatus(productId, "validate");
  }
}

function quickRefuse(productId) {
  const defaultMessage = "Produit non conforme aux critères de la plateforme";
  const comment = prompt("Motif du refus :", defaultMessage);

  if (comment !== null) {
    updateProductStatus(productId, "refuse", comment || defaultMessage);
  }
}

function updateProductStatus(productId, status, comment = "") {
  fetch("../public/index.php?api=produit&action=updateStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
      status: status,
      comment: comment,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadProducts(); // Recharger la liste des produits
      } else {
        alert("Erreur lors de la mise à jour du statut");
      }
    })
    .catch((error) => console.error("Erreur:", error));
}
