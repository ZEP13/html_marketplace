//recolte les category pour les ajoute au select
document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=category&action=getAllCategories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse du serveur:", data);

      const selecte = document.getElementById("selectCategory");

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
});

document
  .getElementById("addProduitForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const alertContainer = document.getElementById("alertContainerAdd");
    const formData = new FormData();

    // Debug: log form values before sending
    console.log({
      nom: document.getElementById("productName").value,
      description: document.getElementById("productDescription").value,
      prix: document.getElementById("productPrice").value,
      quantite: document.getElementById("productQuantite").value,
      category: document.getElementById("selectCategory").value,
      image: document.getElementById("productImage").files[0],
      actif: document.getElementById("actifProduit").checked,
    });

    formData.append("nom", document.getElementById("productName").value);
    formData.append(
      "description",
      document.getElementById("productDescription").value
    );
    formData.append("prix", document.getElementById("productPrice").value);
    formData.append(
      "quantite",
      document.getElementById("productQuantite").value
    );
    formData.append(
      "category",
      document.getElementById("selectCategory").value
    );
    formData.append("img", document.getElementById("productImage").files[0]);
    formData.append(
      "actif",
      document.getElementById("actifProduit").checked ? "1" : "0"
    );
    formData.append("action", "addProduit");

    // Debug: log FormData entries
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    fetch("../public/index.php?api=produit&action=addProduit", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => Promise.reject(err));
        }
        return response.json();
      })
      .then((data) => {
        console.log("Réponse du serveur:", data);
        if (data.success) {
          alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          document.getElementById("addProduitForm").reset();
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      })
      .catch((error) => {
        console.error("Erreur détaillée:", error);
        alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de l'ajout du produit</div>`;
      });
  });
