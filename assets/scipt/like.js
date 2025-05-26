alertContainer = document.getElementById("alertContainerLike");
document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=like&&action=like")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      data.likes.forEach((element) => {
        const likeItem = document.createElement("div");
        likeItem.classList.add("like-item");
        likeItem.innerHTML = `
            <h3>${element.title}</h3>
            <p>${element.description}</p>
            <button id="dislike-${element.id_produit_like}" class="btn btn-danger">Dislike</button>
        `;

        document.querySelector(".like-container").appendChild(likeItem);

        // Now add event listener to that specific button
        const dislikeBtn = document.getElementById(
          `dislike-${element.id_produit_like}`
        );
        dislikeBtn.addEventListener("click", () =>
          deleteLike(element.id_produit_like)
        );
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
          document
            .getElementById(`dislike-${idProduit}`)
            .parentElement.remove();
        } else {
          console.error(
            "Error deleting like:",
            data.message || "Unknown error"
          );
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  }
});
