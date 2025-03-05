document
  .getElementById("addProduitForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const dataForm = {
      action: "addProduit",
      nom: document.getElementById("productName").value,
      quantite: document.getElementById("productQuantite").value,
      description: document.getElementById("productDescription").value,
      prix: document.getElementById("productPrice").value,
      img: document.getElementById("productImage").value,
      actif: document.getElementById("actifProduit").checked ? 1 : 0,
      category: document.getElementById("selectCategory").value,
    };
    console.log(dataForm);
    fetch("../public/index.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataForm),
    })
      .then((reponse) => reponse.json())
      .then((data) => {
        const alertContainer = document.getElementById("alertContainerAdd");
        console.log(data);
        if (data.success) {
          alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      });
  });
