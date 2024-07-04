// إخفاء علامة التحميل بعد 3 ثوانٍ
setTimeout(() => {
  const loadingOverlay = document.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}, 1000); 

const gamesSection = document.querySelector('.games-section');
const gamesGrid = document.querySelector('.games-grid');
const gameDetailsSection = document.querySelector('.game-details-section');
const gameDetails = document.querySelector('.game-details');
const closeButton = document.querySelector('.close-btn button');
const filterButtons = document.querySelectorAll('.filter-btn');

const apiKey = '761b8a3226msh868f0d927cb6ea4p117ef0jsn46d63d281712';
const apiHost = 'free-to-play-games-database.p.rapidapi.com';

let allGames = [];

// Filtering
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filterValue = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    let filteredGames = allGames;
    if (filterValue !== 'all') {
      filteredGames = allGames.filter(game => game.genre.toLowerCase().includes(filterValue.toLowerCase()));
    }
    ui.displayGames(filteredGames);
  });
});

// UI Class
class UI {
  displayGames(games) {
    gamesGrid.innerHTML = '';

    games.forEach(game => {
      const gameCard = `
        <div class="game-card" data-id="${game.id}">
          <img src="${game.thumbnail}" alt="${game.title}">
          <div class="game-info">
            <h3 class="game-title">${game.title}</h3>
            <button class="free-btn">Free</button>
          </div>
          <p class="game-description">${game.short_description}</p>
          <div class="game-tags">
            <button class="tag">${game.genre}</button>
            <button class="tag">${game.platform}</button>
          </div>
        </div>
      `;
      gamesGrid.innerHTML += gameCard;
    });

    this.attachGameCardClickListeners();
  }

  displayGameDetails(game) {
    gameDetails.innerHTML = `
      <h2>${game.title}</h2>
      <img src="${game.thumbnail}" alt="${game.title}">
      <p><strong>Category:</strong> ${game.genre}</p>
      <p><strong>Platform:</strong> ${game.platform}</p>
      <p>${game.description}</p>
      <a href="${game.game_url}" target="_blank">Show Game</a>
    `;
    gameDetailsSection.style.display = 'flex';
  }

  hideGameDetails() {
    gameDetailsSection.style.display = 'none';
  }

  attachGameCardClickListeners() {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
      card.addEventListener('click', async () => {
        const gameId = card.dataset.id;
        const selectedGame = allGames.find(game => game.id === parseInt(gameId));

        if (selectedGame) {
          if (!selectedGame.description) {
            await selectedGame.getGameDetails();
          }
          this.displayGameDetails(selectedGame);
        }
      });
    });
  }
}

// Game Class
class Game {
  constructor(id, title, thumbnail, genre, platform, short_description) {
    this.id = id;
    this.title = title;
    this.thumbnail = thumbnail;
    this.genre = genre;
    this.platform = platform;
    this.short_description = short_description;
  }

  async getGameDetails() {
    try {
      const response = await fetch(`https://${apiHost}/api/game?id=${this.id}`, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": apiHost
        }
      });
      const data = await response.json();

      this.description = data.description;
      this.game_url = data.game_url;
    } catch (error) {
      console.error('Error fetching game details:', error);
    }
  }
}

const ui = new UI();

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(`https://${apiHost}/api/games`, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost
      }
    });
    const data = await response.json();

    allGames = data.map(game => new Game(game.id, game.title, game.thumbnail, game.genre, game.platform, game.short_description));

    ui.displayGames(allGames);
  } catch (error) {
    console.error('Error fetching games:', error);
  }
});

closeButton.addEventListener('click', () => {
  ui.hideGameDetails();
});

gameDetailsSection.style.display = 'none';
gameDetailsSection.addEventListener('click', (event) => {
  if (event.target === gameDetailsSection) {
    ui.hideGameDetails();
  }
});