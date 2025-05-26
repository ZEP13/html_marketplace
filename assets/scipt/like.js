alertContainer = document.getElementById("alertContainerLike");
document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=like&&action=like")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      data.likes.forEach((element) => {
        const likeItem = document.createElement("div");
        likeItem.classList.add("col-md-6", "col-lg-4", "mb-4");
        likeItem.innerHTML = `
          <div class="card h-100 shadow-sm">
            <a href="detail_produit.html?id=${element.id_produit}" class="text-decoration-none text-dark">
              <img src="${element.image}" class="card-img-top" alt="${element.title}" style="height: 200px; object-fit: cover;">
              <div class="card-body">
                <h5 class="card-title">${element.title}</h5>
                <p class="card-text text-muted">${element.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="price fw-bold">${element.price} €</span>
                </div>
                <div class="mt-3 d-flex justify-content-end">
                  <button id="dislike-${element.id_produit_like}" 
                          class="btn btn-outline-danger btn-sm stop-propagation">
                    <i class="fas fa-heart-broken"></i> Retirer des favoris
                  </button>
                </div>
              </div>
            </a>
          </div>
        `;

        document.querySelector(".like-container").appendChild(likeItem);

        const dislikeBtn = document.getElementById(`dislike-${element.id_produit_like}`);
        dislikeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteLike(element.id_produit_like);
        });
      });
    })
    .catch((error) => console.error("Fetch error:", error));

  function deleteLike(idProduit) {
    fetch("../public/index.php?api=like&&action=deleteLike", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "deleteLike",
        id_produit_like: idProduit,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Update UI on success
          alertContainer.innerHTML =
            "<div class='alert alert-success'>" + data.message + "</div>";
          
          // Find and remove the entire card container
          const card = document.getElementById(`dislike-${idProduit}`).closest('.col-md-6');
          if (card) {
            card.remove();
          }

          // Check if there are no more likes
          const remainingCards = document.querySelector('.like-container').children;
          if (remainingCards.length === 0) {
            document.querySelector('.like-container').innerHTML = 
              '<div class="col-12 text-center"><p class="text-muted">Aucun favori</p></div>';
          }
        } else {
          console.error("Error deleting like:", data.message || "Unknown error");
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  }
});
