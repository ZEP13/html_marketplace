document.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const produitId = urlParams.get("id");

  // Fonction pour nettoyer les produits expirés
  function cleanExpiredProducts() {
    const currentTime = new Date().getTime();
    const storedData = JSON.parse(
      localStorage.getItem("recentProductsData") || "{}"
    );
    const cleanedProducts = [];

    for (const item of Object.entries(storedData)) {
      if (currentTime - item[1].timestamp < 60 * 60 * 1000) {
        // 1 heures en millisecondes
        cleanedProducts.push(item[0]);
      }
    }

    // Mettre à jour le stockage avec uniquement les produits non expirés
    const newStoredData = {};
    cleanedProducts.forEach((productId) => {
      newStoredData[productId] = storedData[productId];
    });
    localStorage.setItem("recentProductsData", JSON.stringify(newStoredData));
    localStorage.setItem("recentProducts", JSON.stringify(cleanedProducts));
  }

  // Ajouter le produit aux produits récemment consultés avec timestamp
  const recentProducts = JSON.parse(
    localStorage.getItem("recentProducts") || "[]"
  );
  const storedData = JSON.parse(
    localStorage.getItem("recentProductsData") || "{}"
  );

  if (!recentProducts.includes(produitId)) {
    recentProducts.unshift(produitId);
    if (recentProducts.length > 10) {
      recentProducts.pop();
    }

    // Ajouter le timestamp
    storedData[produitId] = {
      timestamp: new Date().getTime(),
    };

    localStorage.setItem("recentProducts", JSON.stringify(recentProducts));
    localStorage.setItem("recentProductsData", JSON.stringify(storedData));
  }

  // Nettoyer les produits expirés
  cleanExpiredProducts();

  let idSeler;
  fetch(
    `../public/index.php?api=produit&action=getProduitsById&id=${produitId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((reponse) => reponse.json())
    .then((data) => {
      if (data.produit && data.produit.length > 0) {
        const produit = data.produit[0];

        console.log(produit);
        idSeler = produit.id_user;

        // Déclarer quantityInput une seule fois au début
        const quantityInput = document.getElementById("quantity");
        const addPanierBtn = document.getElementById("ajoutePanier");
        const acheterMaintenantBtn =
          document.getElementById("acheterMaintenant");

        // Configuration initiale de l'input quantité
        quantityInput.max = produit.quantite;
        quantityInput.value = "1"; // Définir une valeur par défaut
        quantityInput.setAttribute("data-stock", produit.quantite);

        if (produit.quantite <= 0) {
          // Désactiver les boutons et l'input
          addPanierBtn.disabled = true;
          acheterMaintenantBtn.disabled = true;
          quantityInput.disabled = true;
          quantityInput.value = "0";

          // Ajouter des titres explicatifs
          addPanierBtn.title = "Produit en rupture de stock";
          acheterMaintenantBtn.title = "Produit en rupture de stock";

          // Ajouter des classes pour le style
          addPanierBtn.classList.add("disabled");
          acheterMaintenantBtn.classList.add("disabled");
        }

        // Mettre à jour le message de stock
        const stockStatus =
          produit.quantite <= 0
            ? "Rupture de stock"
            : produit.quantite < 5
            ? `Plus que ${produit.quantite} en stock`
            : "";

        document.getElementById(
          "stock"
        ).innerHTML = `<p class="text-muted small" id="alertStock">${stockStatus}</p>`;

        // Récupérer toutes les images du produit
        fetch(
          `../public/index.php?api=produit&action=getAllImage&id=${produitId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erreur réseau");
            }
            return response.json();
          })
          .then((imageData) => {
            const carouselInner = document.getElementById("carouselInner");
            let images = [];

            // Ajouter l'image principale en premier
            images.push({
              url: produit.image || "../img/imgProduct/default.jpg",
              isMain: true,
            });

            // Ajouter les images supplémentaires
            if (imageData.success && imageData.products) {
              imageData.products.forEach((item) => {
                if (item.image_url) {
                  images.push({
                    url: item.image_url,
                    isMain: false,
                  });
                }
              });
            }

            // Générer les éléments du carrousel et les miniatures
            const thumbnailsRow = document.getElementById("thumbnailsRow");

            images.forEach((image, index) => {
              // Création des éléments du carrousel
              const div = document.createElement("div");
              div.className = `carousel-item ${index === 0 ? "active" : ""}`;
              div.innerHTML = `
                <img src="${image.url}" 
                     class="d-block w-100" 
                     alt="Image produit ${index + 1}"
                     data-bs-toggle="modal" 
                     data-bs-target="#imageModal"
                     onclick="updateModalImage('${image.url}')">
              `;
              carouselInner.appendChild(div);

              // Création des miniatures
              const thumbnail = document.createElement("img");
              thumbnail.src = image.url;
              thumbnail.className = `thumbnail-img ${
                index === 0 ? "active" : ""
              }`;
              thumbnail.alt = `Miniature ${index + 1}`;
              thumbnail.setAttribute("data-bs-slide-to", index);
              thumbnail.setAttribute("data-bs-target", "#productCarousel");
              thumbnail.onclick = function () {
                // Mettre à jour le carrousel
                const carousel = bootstrap.Carousel.getInstance(
                  document.getElementById("productCarousel")
                );
                carousel.to(index);
                // Mettre à jour les classes active des miniatures
                document
                  .querySelectorAll(".thumbnail-img")
                  .forEach((thumb) => thumb.classList.remove("active"));
                this.classList.add("active");
                // Mettre à jour l'image de la modal
                updateModalImage(image.url);
              };
              thumbnailsRow.appendChild(thumbnail);
            });

            // Mettre à jour l'image initiale dans la modal
            document.getElementById("imgProduitModal").src = images[0].url;
          })
          .catch((error) => {
            console.error("Erreur lors de la récupération des images:", error);
            // Afficher au moins l'image principale en cas d'erreur
            const carouselInner = document.getElementById("carouselInner");
            const mainImage = produit.image || "../img/imgProduct/default.jpg";
            carouselInner.innerHTML = `
              <div class="carousel-item active">
                <img src="${mainImage}" 
                     class="d-block w-100" 
                     alt="Image produit principal"
                     data-bs-toggle="modal" 
                     data-bs-target="#imageModal"
                     onclick="updateModalImage('${mainImage}')">
              </div>`;
          });

        document.getElementById("titleProduit").textContent = produit.title;

        document.getElementById("descriptionProduit").textContent =
          produit.description;
        document.getElementById("prixProduit").textContent = produit.price;
        document.getElementById("prixProduit2").textContent = produit.price;
        document.getElementById("nomVendeur").textContent =
          produit.user_nom + " " + produit.user_prenom;

        // Afficher le badge "Vendeur vérifié" si le rôle est Vendeur
        if (produit.role === "Vendeur") {
          document.getElementById("vendeurVerifie").textContent =
            "Vendeur vérifié";
        }

        // Stocker l'ID du vendeur dans un attribut data
        document
          .getElementById("link_vend")
          .setAttribute("data-vendeur-id", produit.id_user);

        // Ajouter l'événement pour vérifier la quantité en temps réel
        quantityInput.addEventListener("input", function (e) {
          const stock = parseInt(this.getAttribute("data-stock"), 10);
          const value = parseInt(this.value, 10);
          const alertContainer = document.getElementById(
            "alertContainerDetail"
          );

          if (value > stock) {
            this.value = stock;
            alertContainer.innerHTML = `
              <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Le stock disponible est limité à ${stock} unités
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
          }

          if (value < 1) {
            this.value = 1;
          }
        });
      } else {
        console.log(data);
        console.error("Produit non trouvé ou données vides.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });

  fetch(`../public/index.php?api=review&id=${produitId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((reponse) => reponse.json())
    .then((dataReview) => {
      const cardReview = document.getElementById("cardReview");

      if (dataReview && dataReview.length > 0) {
        console.log(dataReview);
        const reviewCount = dataReview.length;
        document.getElementById("reviewCount").textContent =
          "(" + reviewCount + " avis)";
        // Parcourir les reviews et les afficher
        dataReview.forEach((review) => {
          const reviewCard = document.createElement("div");
          // Générer les étoiles en fonction de la note
          const maxStars = 5;
          const filledStars = "★".repeat(review.rating); // Étoiles pleines
          const emptyStars = "☆".repeat(maxStars - review.rating); // Étoiles vides
          const starRating = filledStars + emptyStars;

          reviewCard.innerHTML = `
            <div class="card-body">
              <div class="d-flex">
                <div class="me-3">
                  <strong>${review.user_nom + " " + review.user_prenom}</strong>
                  <div class="text-warning">
                    ${starRating} <!-- Affichage des étoiles -->
                  </div>
                </div>
                <p class="card-text">
                  ${review.commentaire}
                </p>
              </div>
            </div>
          `;
          cardReview.appendChild(reviewCard);
        });
      } else {
        cardReview.innerHTML = `
          <div class="card-body">
            <div class="d-flex">
              <div class="me-3">
                <strong>Aucune review pour ce produit.</strong>
              </div>
            </div>
          </div>
        `;
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });

  // Ajout de l'event listener pour le panier
  const addPanierBtn = document.getElementById("ajoutePanier");

  addPanierBtn.addEventListener("click", function (event) {
    event.preventDefault();
    const alertContainer = document.getElementById("alertContainerDetail");
    const quantite = parseInt(document.getElementById("quantity").value, 10);

    // Vérifier si le produit est en stock
    if (document.getElementById("quantity").disabled) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Ce produit est en rupture de stock.</div>`;
      return;
    }

    // Vérification de la validité de la quantité
    if (quantite < 1 || isNaN(quantite)) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Quantité invalide.</div>`;
      return;
    }

    // Vérification du stock disponible
    fetch(
      `../public/index.php?api=produit&action=getProduitsById&id=${produitId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.produit && data.produit.length > 0) {
          const stockDisponible = data.produit[0].quantite;

          if (stockDisponible >= quantite) {
            // Ajout au panier si le stock est suffisant
            fetch("../public/index.php?api=panier", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "addPanier",
                id_produit: produitId,
                quantite: quantite,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                  // Mettre à jour le panier sans rechargement
                  if (window.updatePanierContent) {
                    window.updatePanierContent();
                  }
                  if (window.updateCartBadge) {
                    window.updateCartBadge();
                  }
                  // Ouvrir le panier automatiquement
                  const offcanvasRight = new bootstrap.Offcanvas(
                    document.getElementById("offcanvasRight")
                  );
                  offcanvasRight.show();
                } else {
                  alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                }
              })
              .catch((error) => {
                console.error("Erreur lors de l'ajout au panier :", error);
                alertContainer.innerHTML = `<div class="alert alert-danger">Une erreur est survenue lors de l'ajout au panier.</div>`;
              });
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">Quantité supérieure au stock disponible.</div>`;
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification du stock:", error);
        alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la vérification du stock.</div>`;
      });
  });

  // Ajout de l'event listener pour l'achat immédiat
  const acheterMaintenantBtn = document.getElementById("acheterMaintenant");

  acheterMaintenantBtn.addEventListener("click", function (event) {
    event.preventDefault();
    const alertContainer = document.getElementById("alertContainerDetail");
    const quantite = parseInt(document.getElementById("quantity").value, 10);

    // Vérifier si le produit est en stock
    if (document.getElementById("quantity").disabled) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Ce produit est en rupture de stock.</div>`;
      return;
    }

    // Vérification de la validité de la quantité
    if (quantite < 1 || isNaN(quantite)) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Quantité invalide.</div>`;
      return;
    }

    // Vérification du stock disponible
    fetch(
      `../public/index.php?api=produit&action=getProduitsById&id=${produitId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.produit && data.produit.length > 0) {
          const stockDisponible = data.produit[0].quantite;

          if (stockDisponible >= quantite) {
            // Ajout au panier si le stock est suffisant
            fetch("../public/index.php?api=panier", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "addPanier",
                id_produit: produitId,
                quantite: quantite,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  // Redirection vers la page panier après l'ajout réussi
                  window.location.href = "./panier.html";
                } else {
                  alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                }
              })
              .catch((error) => {
                console.error("Erreur lors de l'ajout au panier :", error);
                alertContainer.innerHTML = `<div class="alert alert-danger">Une erreur est survenue lors de l'ajout au panier.</div>`;
              });
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">Quantité supérieure au stock disponible.</div>`;
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification du stock:", error);
        alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la vérification du stock.</div>`;
      });
  });
});

function contactVendeur() {
  const vendeurId = document
    .getElementById("link_vend")
    .getAttribute("data-vendeur-id");

  if (!vendeurId) {
    console.error("ID du vendeur non trouvé");
    return;
  }

  fetch("../public/index.php?api=user&action=getSessionId", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      const alertContainer = document.getElementById("alertContainerDetail");

      if (!data.success) {
        // L'utilisateur n'est pas connecté
        alertContainer.innerHTML = `
                    <div class="alert alert-warning alert-dismissible fade show" role="alert">
                        Veuillez vous connecter pour contacter le vendeur
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
        return;
      }

      if (vendeurId == data.id) {
        // L'utilisateur est le vendeur
        alertContainer.innerHTML = `
                    <div class="alert alert-warning alert-dismissible fade show" role="alert">
                        Vous ne pouvez pas vous contacter vous-même car vous êtes le vendeur
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;

        // Désactiver le bouton de contact
        const btnContact = document.getElementById("link_vend");
        btnContact.classList.add("disabled");
        btnContact.style.pointerEvents = "none";
        btnContact.title = "Vous ne pouvez pas vous contacter vous-même";
      } else {
        // L'utilisateur n'est pas le vendeur, redirection vers le chat
        window.location.href = `../views/chat.html?contact_id=${vendeurId}`;
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
      const alertContainer = document.getElementById("alertContainerDetail");
      alertContainer.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    Une erreur est survenue, veuillez réessayer plus tard
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;
    });
}

function updateModalImage(imageUrl) {
  document.getElementById("imgProduitModal").src = imageUrl;
}
