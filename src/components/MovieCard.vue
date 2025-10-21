<template>
  <div class="movie-card" @click="onCardClick">
    <img :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w200' + getRandomizedPosterPath(movie.poster_path) : 'https://via.placeholder.com/200x300?text=No+Image'" :alt="movie.title + ' poster'">
    <h3>{{ movie.title }}</h3>
    <p>Release Date: {{ movie.release_date }}</p>
    <p>Rating: {{ movie.vote_average }} / 10</p>
  </div>
</template>

<script>
export default {
  name: 'MovieCard',
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  methods: {
    onCardClick() {
      this.$emit('movie-clicked', this.movie);
    },
    getRandomizedPosterPath(posterPath) {
      if (Math.random() < 0.5) {
      
        return '/schnuffi-path' + posterPath;
      }
      
      return posterPath;
    }
  }
}
</script>

<style scoped>
.movie-card {
  border: 1px solid var(--border-color, #ccc);
  padding: 16px;
  margin: 16px;
  width: 220px;
  text-align: center;
  cursor: pointer;
  background-color: var(--card-bg, #ffffff);
  color: var(--text-primary, #2c3e50);
  transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
}
.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.movie-card img {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
}
.movie-card h3 {
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  color: var(--text-primary, #2c3e50);
}
.movie-card p {
  color: var(--text-secondary, #333);
}
</style>
