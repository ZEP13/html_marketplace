//recolte les category pour les ajoute au select
document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse du serveur:", data);
      const selecte = document.getElementById("selectCategory");

      if (data.length === 0) {
        selecte.innerHTML =
          '<option value="">Aucune catégorie disponible</option>';
        return;
      }

      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.category_name;
        selecte.appendChild(option);
      });
    });
});

//ajoute un produit a la vente
document
  .getElementById("addProduitForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const alertContainer = document.getElementById("alertContainerAdd");
    const formData = new FormData();

    const prixInput = document.getElementById("productPrice");
    const prixValue = prixInput.value;
    const regex = /^[0-9]+([,.][0-9]{1,2})?$/;

    // Collect form data
    if (regex.test(prixValue)) {
      formData.append("prix", document.getElementById("productPrice").value);
    } else {
      alertContainer.innerHTML = `<div class="alert alert-danger">Prix incorrect</div>`;
      return;
    }

    formData.append("action", "addProduit");
    formData.append("nom", document.getElementById("productName").value);
    formData.append(
      "quantite",
      document.getElementById("productQuantite").value
    );
    formData.append(
      "description",
      document.getElementById("productDescription").value
    );

    formData.append("img", document.getElementById("productImage").files[0]); // Send the file directly
    formData.append(
      "actif",
      document.getElementById("actifProduit").checked ? 1 : 0
    );
    formData.append(
      "category",
      document.getElementById("selectCategory").value
    );

    console.log(formData);

    // Send the form data using fetch
    fetch("../public/index.php", {
      method: "POST",
      body: formData, // Send FormData (includes file)
    })
      .then((reponse) => reponse.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      });
  });
