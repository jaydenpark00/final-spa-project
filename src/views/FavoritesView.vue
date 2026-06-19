<script setup>
import { computed, ref, onMounted } from 'vue';
import { useMovieStore } from '../stores/movieStore';

const store = useMovieStore();

onMounted(() => {
    document.title = '찜 목록 | NETVUE';
});

const sortKey = ref('default');

const sortOptions = [
    { key: 'default', label: '찜한 순' },
    { key: 'title', label: '제목순' },
    { key: 'release_date', label: '개봉일순' },
    { key: 'vote_average', label: '평점순' },
];

const sortedFavorites = computed(() => {
    const list = [...store.favorites];
    if (sortKey.value === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    else if (sortKey.value === 'release_date') list.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    else if (sortKey.value === 'vote_average') list.sort((a, b) => b.vote_average - a.vote_average);
    return list;
});

const averageRating = computed(() => {
    if (!store.favorites.length) return '0.0';
    const sum = store.favorites.reduce((acc, m) => acc + m.vote_average, 0);
    return (sum / store.favorites.length).toFixed(1);
});
</script>

<template>
    <main class="page">
        <div class="header-section">
            <h1>❤️ 찜 목록</h1>
            <p class="sub-title" v-if="store.favorites.length">
                총 {{ store.favorites.length }}편 · 평균 평점 ⭐ {{ averageRating }} / 10
            </p>
        </div>

        <div v-if="store.favorites.length === 0" class="empty-state">
            <p class="empty-icon">🎬</p>
            <p class="empty-text">아직 찜한 영화가 없습니다.</p>
            <RouterLink to="/movies" class="go-btn">영화 목록 보러 가기</RouterLink>
        </div>

        <div v-else>
            <div class="sort-bar">
                <button
                    v-for="opt in sortOptions"
                    :key="opt.key"
                    class="sort-btn"
                    :class="{ active: sortKey === opt.key }"
                    @click="sortKey = opt.key"
                >{{ opt.label }}</button>
            </div>

            <div class="movie-list">
                <div v-for="movie in sortedFavorites" :key="movie.id" class="movie-card">
                    <img
                        v-if="movie.poster_path"
                        :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                        :alt="movie.title"
                        class="poster"
                    />
                    <div v-else class="poster-placeholder">이미지 준비 중</div>

                    <div class="card-content">
                        <h3 class="title">{{ movie.title }}</h3>
                        <p class="release-date" v-if="movie.release_date">📅 {{ movie.release_date }}</p>
                        <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }} / 10</p>
                        <p class="overview">
                            {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '줄거리 정보 없음' }}
                        </p>
                        <button @click="store.toggleFavorite(movie)" class="fav-btn">
                            ❤️ 찜 해제
                        </button>
                    </div>
                    <RouterLink
                        :to="`/movies/${movie.id}`"
                        class="stretched-link"
                        :aria-label="`${movie.title} 상세 정보 보기`"
                    ></RouterLink>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.page { padding: 40px; background-color: #f8f9fa; min-height: 100vh; }
.header-section { margin-bottom: 30px; text-align: center; color: #2c3e50; }
.sub-title { font-size: 14px; color: #7f8c8d; margin-top: 5px; }

.empty-state {
    text-align: center;
    padding: 80px 20px;
}
.empty-icon { font-size: 60px; margin-bottom: 16px; }
.empty-text { font-size: 18px; color: #7f8c8d; margin-bottom: 24px; }
.go-btn {
    display: inline-block;
    padding: 12px 28px;
    background: #ff4757;
    color: white;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    font-size: 15px;
    transition: opacity 0.2s;
}
.go-btn:hover { opacity: 0.85; }

.sort-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.sort-btn { padding: 8px 18px; border: 1px solid #ddd; background: white; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; color: #555; transition: all 0.2s; }
.sort-btn:hover { border-color: #ff4757; color: #ff4757; }
.sort-btn.active { background: #ff4757; color: white; border-color: #ff4757; }

.movie-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 30px; }
.movie-card { position: relative; border-radius: 12px; overflow: hidden; background: white; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.2s; display: flex; flex-direction: column; }
.movie-card:hover { transform: translateY(-5px); }
.poster { width: 100%; height: 380px; object-fit: cover; }
.poster-placeholder { width: 100%; height: 380px; background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #7f8c8d; font-weight: bold; }
.card-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
.title { font-size: 18px; color: #333; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; }
.release-date { font-size: 13px; color: #7f8c8d; margin-bottom: 10px; font-weight: 500; }
.rating { font-weight: bold; color: #f39c12; margin-bottom: 10px; font-size: 16px; }
.overview { font-size: 13px; color: #555; line-height: 1.4; margin-bottom: 20px; flex-grow: 1; }
.fav-btn { position: relative; z-index: 2; width: 100%; padding: 12px; cursor: pointer; border: none; background: #ff4757; color: white; border-radius: 8px; font-weight: bold; font-size: 14px; transition: 0.3s; margin-top: auto; }
.fav-btn:hover { background: #e84057; }
.stretched-link { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; }
</style>
