document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    loadProductDetails(productId);
  }
});

function loadProductDetails(productId) {
  fetch(
    `../public/index.php?api=produit&action=getProduitsById&id=${productId}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayProductDetails(data.produit[0]);
      } else {
        console.error("Erreur:", data.message);
      }
    })
    .catch((error) => console.error("Erreur:", error));
}

function displayProductDetails(product) {
  document.getElementById("productImage").src =
    product.image || "placeholder.jpg";
  document.getElementById("productTitle").textContent = product.title;
  document.getElementById("productCategory").textContent =
    product.category_name;
  document.getElementById("productPrice").textContent = product.price;
  document.getElementById("productQuantity").textContent = product.quantite;
  document.getElementById("productDescription").textContent =
    product.description;
  document.getElementById("productCreatedAt").textContent = new Date(
    product.created_at
  ).toLocaleDateString();
  document.getElementById(
    "sellerName"
  ).textContent = `${product.user_nom} ${product.user_prenom}`;
  document.getElementById("sellerEmail").textContent = product.user_mail;

  const statusBadge = document.getElementById("productStatus");
  const refusalBlock = document.getElementById("refusalInfoBlock");

  if (product.valide === 1) {
    statusBadge.className = "badge bg-success";
    statusBadge.textContent = "Validé";
    refusalBlock.style.display = "none";
  } else if (product.refuse === 1) {
    statusBadge.className = "badge bg-danger";
    statusBadge.textContent = "Refusé";
    refusalBlock.style.display = "block";
    document.getElementById("refusalReason").textContent =
      product.comm_refu || "Aucun commentaire fourni";
  } else {
    statusBadge.className = "badge bg-warning";
    statusBadge.textContent = "En attente";
    refusalBlock.style.display = "none";
  }

  const commentSection = document.getElementById("refusalInfoBlock");

  if (product.refuse === 1) {
    commentSection.style.display = "block";
    document.getElementById("refusalReason").textContent = product.comm_refu;
    // Désactiver les boutons si le produit est refusé
    document.getElementById("validateBtn").disabled = true;
    document.getElementById("refuseBtn").disabled = true;
  } else if (product.valide === 1) {
    commentSection.style.display = "none";
    document.getElementById("validateBtn").disabled = true;
    document.getElementById("refuseBtn").disabled = false;
  } else {
    commentSection.style.display = "none";
    document.getElementById("validateBtn").disabled = false;
    document.getElementById("refuseBtn").disabled = false;
  }
}

function validateProduct() {
  const productId = new URLSearchParams(window.location.search).get("id");
  updateProductStatus(productId, "validate");
}

function refuseProduct() {
  const productId = new URLSearchParams(window.location.search).get("id");
  const comment = document.getElementById("refusalComment").value;

  if (!comment) {
    alert("Veuillez ajouter un commentaire de refus");
    return;
  }

  updateProductStatus(productId, "refuse", comment);
}

function updateProductStatus(productId, action, comment = "") {
  fetch("../public/index.php?api=produit&action=updateStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
      status: action,
      comment: comment,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(action === "validate" ? "Produit validé" : "Produit refusé");
        window.location.href = "adminValidProduit.html";
      } else {
        alert("Erreur lors de la mise à jour du statut");
      }
    })
    .catch((error) => console.error("Erreur:", error));
}
