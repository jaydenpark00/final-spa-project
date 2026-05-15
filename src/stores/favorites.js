import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useFavoritesStore = defineStore('favorites', () => {
  const savedFavorites = JSON.parse(localStorage.getItem('favorite_movies')) || [];
  const favoriteMovies = ref(savedFavorites);

  const totalFavorites = computed(() => favoriteMovies.value.length);

  const averageRating = computed(() => {
    if (favoriteMovies.value.length === 0) return 0;
    const sum = favoriteMovies.value.reduce((acc, movie) => acc + movie.rating, 0);
    return (sum / favoriteMovies.value.length).toFixed(1); 
  });

  const toggleFavorite = (movie) => {
    const index = favoriteMovies.value.findIndex((m) => m.id === movie.id);
    if (index === -1) {
      favoriteMovies.value.push(movie); // 목록에 없으면 새롭게 추가
    } else {
      favoriteMovies.value.splice(index, 1); // 이미 목록에 있으면 제거 (찜 취소)
    }
  };

  const clearAllFavorites = () => {
    favoriteMovies.value = [];
  };

  // 4. [핵심 실무] Watch를 이용한 영구 저장 로직
  // favoriteMovies 배열에 변화가 생길 때마다 브라우저 로컬 스토리지에 덮어씁니다.
  watch(
    favoriteMovies,
    (newVal) => {
      localStorage.setItem('favorite_movies', JSON.stringify(newVal));
    },
    { deep: true } // 배열 내부의 객체 변화까지 깊게 감지하기 위한 필수 옵션
  );

  return { favoriteMovies, totalFavorites, averageRating, toggleFavorite, clearAllFavorites };
  
});



