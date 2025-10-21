<template>
  <div id="app" :class="theme">
    <header>
      <h1>Movie Browser</h1>
      <button @click="toggleTheme" class="theme-toggle" :title="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`">
        <span v-if="theme === 'light'">🌙</span>
        <span v-else>☀️</span>
      </button>
    </header>
    <main>
      <div class="filters-container">
        <div class="filter-group">
          <label for="sort-by">Sort By:</label>
          <select id="sort-by" v-model="filters.sortBy">
            <option value="popularity.desc">Popularity (Desc)</option>
            <option value="popularity.asc">Popularity (Asc)</option>
            <option value="release_date.desc">Release Date (Desc)</option>
            <option value="release_date.asc">Release Date (Asc)</option>
            <option value="vote_average.desc">Rating (Desc)</option>
            <option value="vote_average.asc">Rating (Asc)</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="min-rating">Min Rating (0-10):</label>
          <input type="number" id="min-rating" v-model.number="filters.minRating" min="0" max="10" step="0.1">
        </div>
        <button @click="applyFilters" class="apply-filters-button">Apply Filters</button>
        <button @click="getRandomMovie" class="random-movie-button">Random Movie</button>
      </div>

      <div v-if="isLoading" class="loading-message">Loading movies...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="!isLoading && !error && movies.length === 0" class="no-movies-message">
        No movies found.
      </div>
      <div v-if="!isLoading && !error && movies.length > 0" class="movie-list-container">
        <MovieCard 
          v-for="movie in movies" 
          :key="movie.id" 
          :movie="movie"
          @movie-clicked="openDetailModal" 
        />
      </div>
      <!-- Router view would go here if you're using Vue Router for different pages -->
      <!-- <router-view/> -->
       <!-- Movie Detail Modal -->
      <div v-if="showDetailModal && selectedMovie" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-content">
          <button class="modal-close-button" @click="closeDetailModal">&times;</button>
          <h2>{{ selectedMovie.title }}</h2>
          <img :src="selectedMovie.poster_path ? 'https://image.tmdb.org/t/p/w300' + selectedMovie.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'" :alt="selectedMovie.title + ' poster'" class="modal-poster" v-if="selectedMovie.poster_path">
          <p><strong>Release Date:</strong> {{ selectedMovie.release_date }}</p>
          <p><strong>Rating:</strong> {{ selectedMovie.vote_average }} / 10 ({{ selectedMovie.vote_count }} votes)</p>
          <p><strong>Overview:</strong></p>
          <p class="movie-overview">{{ selectedMovie.overview || 'No overview available.' }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import MovieCard from './components/MovieCard.vue';

export default {
  name: 'App',
  components: {
    MovieCard
  },
  data() {
    return {
      movies: [], // This will hold our movie data
      isLoading: true, // Start with loading true as we fetch on created
      error: null,
      filters: {
        sortBy: 'popularity.desc', // Default sort order
        minRating: 0, // Default minimum rating
      },
      selectedMovie: null,
      showDetailModal: false,
      apiKey: process.env.VUE_APP_TMDB_API_KEY,
      theme: 'light' // Default theme
    };
  },
  async created() {
    this.loadTheme();
    await this.fetchMovies();
  },
  methods: {
    async fetchMovies() {
      this.isLoading = true;
      this.error = null;
      this.movies = []; // Clear previous movies

      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiKey}&language=en-US&page=1`;

      // Add filter parameters
      if (this.filters.sortBy) {
        url += `&sort_by=${this.filters.sortBy}`;
      }
      if (this.filters.minRating > 0) {
        url += `&vote_average.gte=${this.filters.minRating}`;
      }
      // You can also add vote_count.gte to ensure movies have a minimum number of votes
      // url += `&vote_count.gte=100`; 

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.results) {
          this.movies = data.results;
        } else {
          console.warn("No results found or unexpected API response format:", data);
        }
      } catch (e) {
        console.error("Error fetching movies:", e);
        this.error = "Failed to load movies. Please try again later.";
      } finally {
        this.isLoading = false;
      }
    },
    applyFilters() {
      this.fetchMovies();
    },
    openDetailModal(movie) {
      this.selectedMovie = movie;
      this.showDetailModal = true;
    },
    closeDetailModal() {
      this.showDetailModal = false;
      // Optionally clear selectedMovie after a delay for transition, or immediately
      // this.selectedMovie = null; 
    },
    async getRandomMovie() {
      this.isLoading = true;
      this.error = null;
      this.movies = []; // Clear previous movies

      try {
        // Get a random page number between 1 and 500 (TMDB API limit)
        const randomPage = Math.floor(Math.random() * 500) + 1;

        // Fetch movies from a random page
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiKey}&language=en-US&page=${randomPage}&sort_by=popularity.desc&vote_count.gte=100`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
          // Pick a random movie from the results
          const randomIndex = Math.floor(Math.random() * data.results.length);
          const randomMovie = data.results[randomIndex];

          // Set the single random movie as the movies array
          this.movies = [randomMovie];

          // Optionally open the detail modal immediately
          this.openDetailModal(randomMovie);
        } else {
          this.error = "No movies found. Please try again.";
        }
      } catch (e) {
        console.error("Error fetching random movie:", e);
        this.error = "Failed to load random movie. Please try again later.";
      } finally {
        this.isLoading = false;
      }
    },
    loadTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.theme = savedTheme;
      }
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.theme);
    }
  } // methods object closes here
}; // export default closes here
</script>

<style>
/* CSS Variables for Light Theme */
#app.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f9f9f9;
  --bg-header: #42b983;
  --text-primary: #2c3e50;
  --text-secondary: #333;
  --text-header: white;
  --border-color: #ccc;
  --card-bg: #ffffff;
  --modal-bg: white;
  --button-primary: #42b983;
  --button-primary-hover: #36a471;
  --button-secondary: #e74c3c;
  --button-secondary-hover: #c0392b;
  --input-bg: white;
  --input-border: #ccc;
}

/* CSS Variables for Dark Theme */
#app.dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-header: #2d5a47;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --text-header: white;
  --border-color: #444;
  --card-bg: #2d2d2d;
  --modal-bg: #2d2d2d;
  --button-primary: #42b983;
  --button-primary-hover: #36a471;
  --button-secondary: #e74c3c;
  --button-secondary-hover: #c0392b;
  --input-bg: #3a3a3a;
  --input-border: #555;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

header {
  background-color: var(--bg-header);
  color: var(--text-header);
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.filters-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  flex-wrap: nowrap; /* Bug: Force items onto one line */
  gap: 20px;
  justify-content: flex-start; /* Align items to the start for clearer overflow */
  align-items: center;
  max-width: 450px;
  overflow-x: auto;
  margin-left: auto; /* Center the container itself */
  margin-right: auto; /* Center the container itself */
  transition: background-color 0.3s ease;
}

.filter-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
  color: var(--text-primary);
}

.filter-group select,
.filter-group input[type="number"] {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--input-border);
  background-color: var(--input-bg);
  color: var(--text-primary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.apply-filters-button {
  padding: 10px 20px;
  background-color: var(--button-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  align-self: flex-end; /* Aligns button with bottom of other inputs if they wrap */
  transition: background-color 0.3s ease;
}

.apply-filters-button:hover {
  background-color: var(--button-primary-hover);
}

.random-movie-button {
  padding: 10px 20px;
  background-color: var(--button-secondary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  align-self: flex-end;
  transition: background-color 0.3s ease;
}

.random-movie-button:hover {
  background-color: var(--button-secondary-hover);
}

.movie-list-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px; /* Optional: adds space between cards */
}

.loading-message,
.error-message,
.no-movies-message {
  margin-top: 20px;
  font-size: 1.2em;
}

.error-message {
  color: red;
  font-weight: bold;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--modal-bg);
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 250px;
  overflow-y: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: background-color 0.3s ease;
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8em;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.modal-poster {
  max-width: 200px;
  height: auto;
  float: left;
  margin-right: 20px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.modal-content h2 {
  margin-top: 0;
  color: var(--text-primary);
}

.modal-content p {
  line-height: 1.6;
  color: var(--text-secondary);
}

.movie-overview {
  text-align: left;
}
</style>
