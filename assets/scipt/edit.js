// Récupérer les données du produit et pré-remplir le formulaire

document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the product ID from sessionStorage
  const productId = sessionStorage.getItem("editProductId");

  if (!productId) {
    console.error("No product ID found in sessionStorage.");
    alert("No product selected for editing.");
    window.location.href = "user_vente.html"; // Redirect back to the product list
    return;
  }

  // Use the product ID to fetch product details
  fetch(
    `../public/index.php?api=produit&action=getProduitsById&id=${productId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Product data:", data);

      if (data.success && data.produit) {
        const produit = data.produit[0];

        // Populate the form fields with product data
        document.getElementById("productId").value = produit.id_produit;
        document.getElementById("productName").value = produit.title;
        document.getElementById("productQuantite").value = produit.quantite;
        document.getElementById("productDescription").value =
          produit.description;
        document.getElementById("productPrice").value = produit.price;
        document.getElementById("currentImage").value = produit.image;
        document.getElementById("actifProduit").checked = produit.actif === 1;
        document.getElementById("productMarque").value = produit.marque; // Ajout de la marque

        // Pré-remplir la catégorie
        const selectCategory = document.getElementById("selectCategory");
        fetch("../public/index.php?api=category&action=getAllCategories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success && data.categories) {
              selectCategory.innerHTML = ""; // Vider le select avant d'ajouter les options
              data.categories.forEach((category) => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.category_name;
                selectCategory.appendChild(option);
              });
            } else {
              console.error(
                "Erreur lors de la récupération des catégories :",
                data.message
              );
            }
          })
          .catch((error) => {
            console.error("Erreur lors de la requête :", error);
          });
      } else {
        console.error(
          "Erreur lors de la récupération des données du produit :",
          data.message
        );
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête :", error);
    });
});

// Soumettre le formulaire pour mettre à jour le produit
document
  .getElementById("addProduitForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData();
    const productId = document.getElementById("productId").value;
    const productName = document.getElementById("productName").value;
    const productQuantite = document.getElementById("productQuantite").value;
    const productDescription =
      document.getElementById("productDescription").value;
    const productPrice = document.getElementById("productPrice").value;
    const currentImage = document.getElementById("currentImage").value;
    const actifProduit = document.getElementById("actifProduit").checked
      ? 1
      : 0;
    const productMarque = document.getElementById("productMarque").value;
    const selectCategory = document.getElementById("selectCategory").value;
    const alertContainer = document.getElementById("alertContainerEdit");

    // Validation améliorée avec messages d'erreur spécifiques
    const errors = [];
    if (!productName.trim()) errors.push("Le nom du produit est requis");
    if (!productDescription.trim()) errors.push("La description est requise");
    if (!productPrice) errors.push("Le prix est requis");
    if (productPrice <= 0) errors.push("Le prix doit être supérieur à 0");
    if (!productQuantite) errors.push("La quantité est requise");
    if (productQuantite < 0)
      errors.push("La quantité ne peut pas être négative");
    if (!selectCategory) errors.push("La catégorie est requise");
    if (!productMarque.trim()) errors.push("La marque est requise");

    if (errors.length > 0) {
      alertContainer.innerHTML = `
            <div class="alert alert-danger">
                <strong>Veuillez corriger les erreurs suivantes :</strong>
                <ul class="mb-0 mt-2">
                    ${errors.map((error) => `<li>${error}</li>`).join("")}
                </ul>
            </div>`;
      return;
    }

    // Ajouter toutes les données au FormData
    formData.append("id", productId);
    formData.append("title", productName);
    formData.append("quantite", productQuantite);
    formData.append("description", productDescription);
    formData.append("price", productPrice);
    formData.append("category", selectCategory);
    formData.append("actif", actifProduit);
    formData.append("marque", productMarque); // Ajout de la marque

    // Gestion de l'image
    const newImage = document.getElementById("productImage").files[0];
    if (newImage) {
      formData.append("img", newImage);
    }
    if (currentImage) {
      formData.append("current_image", currentImage);
    }

    // Debug
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    fetch("../public/index.php?api=produit&action=updateProduit", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${text}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">${
            data.message || "Erreur lors de la mise à jour"
          }</div>`;
        }
      })
      .catch((error) => {
        console.error("Erreur détaillée:", error);
        alertContainer.innerHTML = `<div class="alert alert-danger">Une erreur est survenue: ${error.message}</div>`;
      });
  });
