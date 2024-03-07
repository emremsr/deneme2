document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "11288b9c015d4df7d4dc2f34b16fb0bc";
  const movieApiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`;
  const tvShowApiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}`;

  const menuIcon = document.querySelector(".menu-icon");
  const navList = document.querySelector(".nav-list");
  //Menu icon click event listener to show and hide the navigation list
  menuIcon.addEventListener("click", () => {
    navList.classList.toggle("show");
  });

  // Fetc data
  async function fetchData(apiUrl) {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  //Dynamic routes for movies and TV shows
  function handleItemClick(item, type) {
    const detailPageUrl = `detail.html?type=${type}&itemId=${item.id}`;
    window.location.href = detailPageUrl;
  }

  //Render movie items

  function displayData(data, containerId, type) {
    const container = document.getElementById(containerId);

    const shuffledData = data.sort(() => Math.random() - 0.5);
    const selectedData = shuffledData.slice(0, 8);

    selectedData.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("movie-item");

      const voteAverage = item.vote_average.toFixed(1);
      itemElement.innerHTML = `
        <span class="vote-average"> ${voteAverage} / 10 </span>
        <div class="img-container">
          <img src="https://image.tmdb.org/t/p/w500${
            item.backdrop_path
          }" alt="${item.title || item.original_name}">
        </div>
        <div class="overlay">
          <p>${item.title || item.original_name}</p>
        </div>
      `;

      itemElement.addEventListener("click", () => handleItemClick(item, type));
      container.appendChild(itemElement);
    });
  }

  // Fetch movie data and display it
  fetchData(movieApiUrl).then((data) => {
    displayData(data, "movieList", "movie");
  });

  // Fetch TV show data and display it
  fetchData(tvShowApiUrl).then((data) => {
    displayData(data, "tvShowListContainer", "tv");
  });

  async function fetchRandomMovie() {
    const data = await fetchData(movieApiUrl);
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  // Function to fetch a random TV show
  async function fetchRandomTVShow() {
    const data = await fetchData(tvShowApiUrl);
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  // Function to fetch a random Movie
  async function updateLeftCard() {
    const randomMovie = await fetchRandomMovie();
    const leftCard = document.querySelector(".left-card");

    leftCard.innerHTML = `
    <span class="vote-average2">${randomMovie.vote_average.toFixed(
      1
    )} / 10</span>
      <div class="img-container header-img">
        <img src="https://image.tmdb.org/t/p/w400${
          randomMovie.backdrop_path
        }" alt="${randomMovie.title}" />
        <div class="overlay2">
          <p>${randomMovie.title}</p>
        </div>
      </div>
    `;
  }

  // Function to fetch a random TV show
  async function updateRightCard() {
    const randomTVShow = await fetchRandomTVShow();
    const rightCard = document.querySelector(".right-card");

    rightCard.innerHTML = `
    <span class="vote-average2">${randomTVShow.vote_average.toFixed(
      1
    )} / 10</span>
      <div class="img-container header-img">
        <img src="https://image.tmdb.org/t/p/w400${
          randomTVShow.backdrop_path
        }" alt="${randomTVShow.name}" />
        <div class="overlay2">
          <p>${randomTVShow.name}</p>
        </div>
      </div>
    `;
  }

  updateLeftCard();

  updateRightCard();
});
