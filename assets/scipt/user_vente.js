const alertContainer = document.getElementById("alertContainerVente");

document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=produit&action=getProduitsByUser", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data && data.length > 0) {
        const tableBody = document.querySelector("tbody");
        tableBody.innerHTML = ""; // Vider le tableau avant d'ajouter les produits

        data.forEach((produit) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                <td>${produit.title}</td>
                <td>${produit.description}</td>
                <td>€${produit.price}</td>
                <td>${produit.quantite}</td>
                <td>
                  <img
                    src="${
                      produit.image
                        ? produit.image
                        : "../img/imgProduct/default.jpg"
                    }"
                    alt="Image du produit"
                    style="width: 50px; height: 50px; object-fit: cover"
                  />
                </td>
                <td>${produit.actif}</td>
                <td>
                  <button class="btn btn-warning btn-sm" onclick="deleteProduit(${
                    produit.id
                  })">Supprimer</button>
                  <button class="btn btn-danger btn-sm">Edit</button>
                </td>
              `;
          tableBody.appendChild(row);
        });
      } else {
        console.error("Aucun produit trouvé pour cet utilisateur.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête :", error);
    });
});

function deleteProduit(id) {
  fetch(`../public/index.php?api=produit&action=deleteProduit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }), // Assurez-vous d'envoyer l'ID du produit ici
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        alert("Produit supprimé avec succès !");
        // Recharger la liste des produits après suppression
        location.reload();
      } else {
        alert("Erreur lors de la suppression du produit : " + data.message);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête :", error);
      alert("Une erreur est survenue lors de la suppression du produit.");
    });
}
