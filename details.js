document.addEventListener("DOMContentLoaded", function () {
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  // Get type and itemId from URL
  const { type, itemId } = getUrlParams();

  // Check if type and itemId are present
  if (type && itemId) {
    const apiKey = "11288b9c015d4df7d4dc2f34b16fb0bc";

    // API Endpoint for movie or TV show details
    const apiUrl = `https://api.themoviedb.org/3/${type}/${itemId}?api_key=${apiKey}`;

    // Function to fetch movie or TV show details
    async function fetchItemDetails() {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    }

    // Function to display item details in HTML
    async function displayItemDetails() {
      const itemDetailsContainer = document.getElementById("itemDetails");

      // Fetch item details
      const itemDetails = await fetchItemDetails();

      // Check if item details are present
      if (itemDetails) {
        const itemDetailsElement = document.createElement("div");
        itemDetailsElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${
              itemDetails.poster_path
            }" alt="${itemDetails.name || itemDetails.original_title}">
            <div class="details">
              <h2>${itemDetails.name || itemDetails.original_title}</h2>
              <p class="overview"><span>Overview </span> <br /> ${
                itemDetails.overview
              }</p>

              <div class="genders">
              <p>Genres: ${itemDetails.genres
                .map((genre) => genre.name)
                .join(", ")}</p>
              
                <p>Rating: ${itemDetails.vote_average}</p>
                </div>
                <p class="companyName"><span>Production Companies</span> <br /> ${itemDetails.production_companies
                  .map((company) => company.name)
                  .join(", ")}</p>
            </div>
        `;
        itemDetailsContainer.appendChild(itemDetailsElement);
      }
    }

    displayItemDetails();
  }
});
