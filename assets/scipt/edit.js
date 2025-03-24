// Récupérer les données du produit et pré-remplir le formulaire
const alertContainer = document.getElementById("alertContainerEdit");
document.addEventListener("DOMContentLoaded", function () {
  const productId = document.getElementById("productId").value;

  // Récupérer les informations du produit via l'API
  fetch(`../public/index.php?api=produit&action=getProduitsById&id=1`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Données du produit :", data);

      if (data.success && data.produit) {
        const produit = data.produit[0];

        // Pré-remplir les champs du formulaire
        document.getElementById("productId").value = produit.id_produit;
        document.getElementById("productName").value = produit.title;
        document.getElementById("productQuantite").value = produit.quantite;
        document.getElementById("productDescription").value =
          produit.description;
        document.getElementById("productPrice").value = produit.price;
        document.getElementById("currentImage").value = produit.image;
        document.getElementById("actifProduit").checked = produit.actif === 1;

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

    const alertContainer = document.getElementById("alertContainerEdit");
    const formData = new FormData(); // Initialisation du FormData

    // Vérifier et collecter les données du formulaire
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
    const selectCategory = document.getElementById("selectCategory").value;

    // Vérification des champs obligatoires
    if (
      !productName ||
      !productPrice ||
      !productQuantite ||
      !productDescription
    ) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Tous les champs sont obligatoires</div>`;
      return;
    }

    // Vérifier si le prix est valide
    const regex = /^[0-9]+([,.][0-9]{1,2})?$/;
    if (!regex.test(productPrice)) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Prix incorrect</div>`;
      return;
    }

    // Ajouter les données au FormData avec les noms de champs corrects
    formData.append("action", "updateProduit");
    formData.append("id", productId); // Ensure dynamic productId is used
    formData.append("title", productName); // Changed from 'nom' to 'title'
    formData.append("quantite", productQuantite);
    formData.append("description", productDescription);
    formData.append("price", productPrice); // Changed from 'prix' to 'price'
    formData.append("category", selectCategory);
    formData.append("actif", actifProduit);

    // Vérifier si une nouvelle image a été sélectionnée
    const newImage = document.getElementById("productImage").files[0];
    if (newImage) {
      formData.append("img", newImage);
    } else if (currentImage) {
      formData.append("current_image", currentImage);
    }

    // Debug des données envoyées
    console.log("Données envoyées :", Object.fromEntries(formData));

    // Debugging the form data before sending
    console.log("Form Data Before Sending:");
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Add debug headers to see what's being sent
    console.log("FormData Debug:");
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // Send the FormData without manually setting the Content-Type header
    fetch("../public/index.php?api=produit&action=updateProduit", {
      method: "POST",
      body: formData, // Let the browser set the correct Content-Type
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
