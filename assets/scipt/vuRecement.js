document.addEventListener("DOMContentLoaded", () => {
  const recementContainer = document.getElementById("recementContainer");

  if (recementContainer) {
    const recentProducts = JSON.parse(
      localStorage.getItem("recentProducts") || "[]"
    );
    if (recentProducts.length === 0) {
      return;
    }

    fetch("/html_marketplace/views/vuRecement.html")
      .then((response) => {
        if (!response.ok) throw new Error("Erreur lors du chargement");
        return response.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const content = doc.querySelector(".recent-products");
        const styles = doc.querySelector("style");

        if (content && styles) {
          // Ajouter le style
          if (!document.querySelector('style[data-recement="true"]')) {
            styles.setAttribute("data-recement", "true");
            document.head.appendChild(styles.cloneNode(true));
          }

          // Ajouter le contenu
          recementContainer.innerHTML = content.outerHTML;

          // Initialiser directement la fonctionnalité des produits récents
          const scriptElement = document.createElement("script");
          scriptElement.textContent = `
              document.querySelector('.products-grid').innerHTML = '<div class="text-center">Chargement...</div>';
              const recentProducts = ${JSON.stringify(recentProducts)};
              loadRecentProductsInline(recentProducts);
            `;
          document.body.appendChild(scriptElement);
        }
      })
      .catch((error) => console.error("Erreur:", error));
  }
});

// Fonction globale pour charger les produits
async function loadRecentProductsInline(recentProducts) {
  const productGrid = document.querySelector(".products-grid");
  if (!productGrid) return;

  productGrid.innerHTML = "";

  for (const productId of recentProducts) {
    try {
      const response = await fetch(
        `../public/index.php?api=produit&action=getProduitsById&id=${productId}`
      );
      const data = await response.json();

      if (data.produit && data.produit.length > 0) {
        const product = data.produit[0];

        // Charger les reviews
        let ratingHtml = "";
        try {
          const reviewResponse = await fetch(
            `../public/index.php?api=review&id=${productId}`
          );
          const reviewData = await reviewResponse.json();

          if (reviewData && reviewData.length > 0) {
            const avgRating =
              reviewData.reduce((acc, curr) => acc + curr.rating, 0) /
              reviewData.length;
            ratingHtml = `<div class="rating">${generateStarRating(
              avgRating
            )}</div>`;
          } else {
            ratingHtml = `<div class="rating"><small class="text-muted">Aucune review</small></div>`;
          }
        } catch (error) {
          ratingHtml = `<div class="rating"><small class="text-muted">Aucune review</small></div>`;
        }

        const productCard = `
            <div class="recent-card">
              <div class="recent-image">
                <img src="${product.image || "../img/imgProduct/default.jpg"}" 
                     alt="${product.title}" 
                     onerror="this.src='../img/imgProduct/default.jpg'"/>
              </div>
              <div class="recent-info">
                <h3 class="card-title text-truncate">${product.title}</h3>
                <p class="description text-truncate">${product.description}</p>
                ${ratingHtml}
                <div class="bottom-info">
                  <p class="price mb-2">${product.price} &euro;</p>
                  <button class="btn btn-primary" onclick="window.location.href='detail_produit.html?id=${
                    product.id
                  }'">
                    Voir le produit
                  </button>
                </div>
              </div>
            </div>
          `;
        productGrid.innerHTML += productCard;
      }
    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error);
    }
  }

  // Initialiser la navigation du carousel
  initCarouselNavigation();
}

function generateStarRating(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += '<i class="fas fa-star text-warning"></i>';
    } else if (i - 0.5 <= rating) {
      stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    } else {
      stars += '<i class="far fa-star text-warning"></i>';
    }
  }
  return stars;
}

function initCarouselNavigation() {
  const productGrid = document.querySelector(".products-grid");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const carouselContainer = document.querySelector(".carousel-container");

  if (prevBtn && nextBtn) {
    nextBtn.addEventListener("click", () => {
      productGrid.scrollBy({ left: 300, behavior: "smooth" });
    });

    prevBtn.addEventListener("click", () => {
      productGrid.scrollBy({ left: -300, behavior: "smooth" });
    });

    productGrid.addEventListener("scroll", () => {
      if (productGrid.scrollLeft > 4) {
        carouselContainer.classList.add("show-fade-left");
      } else {
        carouselContainer.classList.remove("show-fade-left");
      }
    });
  }
}
