<template>
  <div id="app">
    <header>
      <h1>Movie Browser</h1>
    </header>
    <main>
      <form class="filters-container" toolname="apply-movie-filters" tooldescription="Applies filters to the movie list. Use this to sort movies or filter by minimum rating." toolautosubmit @submit.prevent="handleFilterSubmit">
        <div class="filter-group">
          <label for="sort-by">Sort By:</label>
          <select id="sort-by" v-model="filters.sortBy" name="sortBy">
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
          <input type="number" id="min-rating" v-model.number="filters.minRating" name="minRating" min="0" max="10" step="0.1">
        </div>
        <button type="submit" class="apply-filters-button">Apply Filters</button>
        <button type="button" @click="getRandomMovie" class="random-movie-button">Random Movie</button>
      </form>

      <!-- Hidden form for WebMCP to open modal by ID -->
      <form toolname="open-movie-detail-modal" tooldescription="Opens the movie detail modal for a specific movie currently visible in the list." @submit.prevent="handleOpenModalSubmit" toolautosubmit style="display: none;">
        <input type="number" name="movieId" required>
        <button type="submit">Submit</button>
      </form>

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
          <form toolname="close-movie-detail-modal" tooldescription="Closes the currently open movie detail modal." @submit.prevent="closeDetailModal" toolautosubmit style="display: inline;">
            <button type="submit" class="modal-close-button">&times;</button>
          </form>
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
      abortController: null
    };
  },
  async created() {
    await this.fetchMovies();
  },
  methods: {
    handleFilterSubmit(event) {
      const formData = new FormData(event.target);
      const sortBy = formData.get('sortBy');
      const minRating = formData.get('minRating');
      if (sortBy) this.filters.sortBy = sortBy;
      if (minRating !== null && minRating !== '') this.filters.minRating = parseFloat(minRating);
      this.applyFilters();
    },
    handleOpenModalSubmit(event) {
      const formData = new FormData(event.target);
      const movieId = parseInt(formData.get('movieId'), 10);
      const movie = this.movies.find(m => m.id === movieId);
      if (movie) {
        this.openDetailModal(movie);
      } else {
        console.warn(`Movie with ID ${movieId} not found.`);
      }
    },
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
      throw new Error(`omg`);
      /*try {
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
      }*/
    }
  } // methods object closes here
}; // export default closes here
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

header {
  background-color: #42b983;
  color: white;
  padding: 20px;
  margin-bottom: 20px;
}

.filters-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
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
}

.filter-group select,
.filter-group input[type="number"] {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.apply-filters-button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  align-self: flex-end; /* Aligns button with bottom of other inputs if they wrap */
}

.apply-filters-button:hover {
  background-color: #36a471;
}

.random-movie-button {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  align-self: flex-end;
}

.random-movie-button:hover {
  background-color: #c0392b;
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
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 250px;
  overflow-y: hidden; 
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8em;
  cursor: pointer;
  color: #333;
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
  color: #2c3e50;
}

.modal-content p {
  line-height: 1.6;
  color: #333;
}

.movie-overview {
  text-align: left;
}
</style>
