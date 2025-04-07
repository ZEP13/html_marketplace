alertContainer = document.getElementById("alertContainerForm");

document.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  fetch("../public/index.php?api=user&action=getUser", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((reponse) => reponse.json())
    .then((data) => {
      console.log(data);
      document.getElementById("nom").value = data.nom;
      document.getElementById("prenom").value = data.prenom;
      document.getElementById("mail").value = data.mail;
      //ajoute  les autre valeur des champs si dispo pour l'user.
    });
});
document
  .getElementById("formCommande")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    //pense ajoute verification pour numéro de tel et code postal et adresse
    dataForm = {
      tel: document.getElementById("tel").value,
      rue: document.getElementById("rue").value,
      numero: document.getElementById("numeroMaison").value,
      code: document.getElementById("codePostal").value,
      city: document.getElementById("city").value,
    };
    console.log(dataForm);
    fetch("../public/index.php?api=user&action=addInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataForm),
    })
      .then((reponse) => reponse.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          window.location.href = "../views/paiement.html";
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la requête:", error);
      });
  });
