<script setup>
import { onMounted, computed } from 'vue';
import { useMovieStore } from '../stores/movieStore';
import { GENRE_MAP } from '../constants/genres';

const store = useMovieStore();

onMounted(() => {
    store.fetchMovies(1);
    document.title = '국내 극장 화제작 (인기순)';
});

const sortOptions = [
    { key: 'default', label: '인기순' },
    { key: 'title', label: '제목순' },
    { key: 'release_date', label: '개봉일순' },
    { key: 'vote_average', label: '평점순' },
];

const availableGenres = Object.entries(GENRE_MAP).map(([id, name]) => ({ id: Number(id), name }));

const sortedMovies = computed(() => {
    const list = [...store.movies];
    // 장르 필터는 서버(API)에서 처리 → 클라이언트에서는 정렬만
    if (store.sortKey === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    else if (store.sortKey === 'release_date') list.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    else if (store.sortKey === 'vote_average') list.sort((a, b) => b.vote_average - a.vote_average);
    return list;
});

const selectGenre = (genreId) => {
    store.fetchMovies(1, genreId); // 장르 선택 시 page 1부터 API 재호출
};

const goToPage = (page) => {
    if (page < 1 || page > store.totalPages || page === store.currentPage) return;
    store.fetchMovies(page, store.selectedGenre); // 현재 장르 유지
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const pageNumbers = computed(() => {
    const total = store.totalPages;
    const current = store.currentPage;
    const pages = [];

    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
        return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
});
</script>

<template>
    <main class="page">
        <div class="header-section">
            <h1>🍿 국내 극장 화제작</h1>
            <p class="sub-title">2025년 이후 국내 정식 개봉한 실시간 인기 상영작</p>
        </div>
        
        <div class="sort-bar">
            <button
                v-for="opt in sortOptions"
                :key="opt.key"
                class="sort-btn"
                :class="{ active: store.sortKey === opt.key }"
                @click="store.sortKey = opt.key"
            >{{ opt.label }}</button>
        </div>

        <div class="filter-row">
            <label class="genre-label">🎬 장르</label>
            <select
                class="genre-select"
                :value="store.selectedGenre ?? ''"
                @change="e => selectGenre(e.target.value ? Number(e.target.value) : null)"
            >
                <option value="">전체</option>
                <option v-for="g in availableGenres" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
        </div>

        <div v-if="store.isLoading" class="status-message loading">
            ⏳ 실시간 국내 개봉작 데이터를 싣고 오는 중입니다...
        </div>

        <div v-else-if="store.errorMessage" class="status-message error">
            🚨 {{ store.errorMessage }}
        </div>
        <div v-else>
            <div class="movie-list">
                <div v-for="movie in sortedMovies" :key="movie.id" class="movie-card">
                    <img
                        v-if="movie.poster_path"
                        :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                        :alt="movie.title"
                        class="poster"
                    />
                    <div v-else class="poster-placeholder">이미지 준비 중</div>

                    <div class="card-content">
                        <h3 class="title">{{ movie.title }}</h3>
                        <p class="release-date" v-if="movie.release_date">📅 개봉일: {{ movie.release_date }}</p>
                        <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }} / 10</p>
                        <p class="overview">
                            {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '국내에 등록된 줄거리 요약 정보가 없습니다.' }}
                        </p>
                        <button
                            @click="store.toggleFavorite(movie)"
                            :class="{ active: movie.isFavorite }"
                            class="fav-btn"
                        >
                            {{ movie.isFavorite ? '❤️ 찜 해제' : '🤍 찜하기' }}
                        </button>
                    </div>
                    <RouterLink
                        :to="`/movies/${movie.id}`"
                        class="stretched-link"
                        :aria-label="`${movie.title} 상세 정보 보기`"
                    ></RouterLink>
                </div>
            </div>

            <div class="pagination" v-if="store.totalPages > 1">
                <button class="page-btn" @click="goToPage(store.currentPage - 1)" :disabled="store.currentPage === 1">‹</button>
                <template v-for="p in pageNumbers" :key="p">
                    <span v-if="p === '...'" class="page-ellipsis">...</span>
                    <button
                        v-else
                        class="page-btn"
                        :class="{ active: p === store.currentPage }"
                        @click="goToPage(p)"
                    >{{ p }}</button>
                </template>
                <button class="page-btn" @click="goToPage(store.currentPage + 1)" :disabled="store.currentPage === store.totalPages">›</button>
            </div>
        </div>
    </main>
</template>
<style scoped>
.page { 
    padding: 40px; 
    background-color: #f8f9fa; 
    min-height: 100vh; 
}
.header-section { 
    margin-bottom: 30px; 
    text-align: center; 
    color: #2c3e50; 
}
.sub-title { 
    font-size: 14px; 
    color: #7f8c8d; 
    margin-top: 5px; 
}
.status-message { 
    text-align: center; 
    font-size: 20px; 
    font-weight: bold; 
    padding: 50px; 
    border-radius: 12px; 
}
.loading { 
    color: #3498db; 
    background-color: #e3f2fd; 
}
.error { 
    color: #e74c3c; 
    background-color: #fdeaea; 
}

.sort-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}
.sort-btn {
    padding: 8px 18px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    color: #555;
    transition: all 0.2s ease;
}
.sort-btn:hover {
    border-color: #ff4757;
    color: #ff4757;
}
.sort-btn.active {
    background: #ff4757;
    color: white;
    border-color: #ff4757;
}
.filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
}
.genre-label {
    font-size: 14px;
    font-weight: 700;
    color: #555;
    white-space: nowrap;
}
.genre-select {
    padding: 8px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    background: white;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
}
.genre-select:focus { border-color: #5352ed; }
.movie-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 30px;
}
.movie-card {
  position: relative; /* ✨ 투명 링크 영역 확장을 위한 기준점 추가 */
  border-radius: 12px;
  overflow: hidden;
  background: white;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}
.movie-card:hover { 
    transform: translateY(-5px); 
}
.poster { 
    width: 100%; 
    height: 380px; 
    object-fit: cover; 
}
.poster-placeholder { 
    width: 100%; 
    height: 380px; 
    background-color: #ddd; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    color: #7f8c8d; 
    font-weight: bold; 
}
.card-content { 
    padding: 20px; 
    display: flex; 
    flex-direction: column; 
    flex-grow: 1; 
}
.title { 
    font-size: 18px; 
    color: #333; 
    margin: 0 0 6px 0; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    font-weight: bold; 
}
.release-date { 
    font-size: 13px; 
    color: #7f8c8d; 
    margin-bottom: 10px; 
    font-weight: 500; 
}
.rating { 
    font-weight: bold; 
    color: #f39c12; 
    margin-bottom: 10px; 
    font-size: 16px; 
}
.overview { 
    font-size: 13px; 
    color: #555; 
    line-height: 1.4; 
    margin-bottom: 20px; 
    flex-grow: 1; 
}
.fav-btn {
  position: relative; /* ✨ 레이어 층위 조절을 위한 포지션 추가 */
  z-index: 2;         /* ✨ 투명 링크 위로 올려 버튼 단독 클릭 활성화 */
  width: 100%;
  padding: 12px;
  cursor: pointer;
  border: none;
  background: #ecf0f1;
  color: #333;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  transition: 0.3s;
  margin-top: auto;
}
.fav-btn.active { 
    background: #ff4757; 
    color: white; 
}
.stretched-link {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 50px;
    flex-wrap: wrap;
}
.page-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    color: #333;
    transition: all 0.2s ease;
}
.page-btn:hover:not(:disabled) {
    background: #ff4757;
    color: white;
    border-color: #ff4757;
}
.page-btn.active {
    background: #ff4757;
    color: white;
    border-color: #ff4757;
}
.page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}
.page-ellipsis {
    font-size: 15px;
    color: #999;
    padding: 0 4px;
}
</style>