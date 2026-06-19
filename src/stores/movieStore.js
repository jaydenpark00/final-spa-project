import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useMovieStore = defineStore('movie', () => {
    const movies = ref([]);
    const favorites = ref(JSON.parse(sessionStorage.getItem('favorites')) || []);
    const isLoading = ref(false);
    const errorMessage = ref('');
    const selectedMovie = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(0);
    const sortKey = ref('default'); // 'default' | 'title' | 'release_date' | 'vote_average'
    const selectedGenre = ref(null); // genre id (number) or null

    // 검색 전용 상태
    const searchResults = ref([]);
    const searchTotalPages = ref(0);
    const searchCurrentPage = ref(1);

    const fetchMovies = async (page = 1, genreId = null) => {
        isLoading.value = true;
        errorMessage.value = '';
        currentPage.value = page;
        selectedGenre.value = genreId;

        try {
            const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
            const movieParams = {
                api_key: API_KEY,
                language: 'ko-KR',
                region: 'KR',
                sort_by: 'popularity.desc',
                include_adult: false,
                'release_date.gte': '2025-01-01',
                with_release_type: '2|3',
                page,
                ...(genreId && { with_genres: genreId }),
            };

            const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: movieParams
            });

            const fetchedMovies = response.data.results;
            totalPages.value = response.data.total_pages;

            // // [세션 스토리지 상태 동기화]
            fetchedMovies.forEach(movie => {
                const isAlreadyFavorite = favorites.value.some(fav => fav.id === movie.id);
                movie.isFavorite = isAlreadyFavorite;
            });

            movies.value = fetchedMovies;
        } catch (error) {
            console.error('API 통신 에러 상세 내역:', error);
            errorMessage.value = '영화 데이터를 불러오는 데 실패했습니다. 통신 상태나 API Key를 확인해 주세요.';
        } finally {
            isLoading.value = false;
        }
    };

    const fetchMovieDetail = async (movieId) => {
        isLoading.value = true;
        errorMessage.value = '';
        selectedMovie.value = null;

        try {
            const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
            const url = `https://api.themoviedb.org/3/movie/${movieId}`;

            const response = await axios.get(url, {
                params: {
                    api_key: API_KEY,
                    language: 'ko-KR'
                }
            });
            selectedMovie.value = response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                errorMessage.value = '존재하지 않거나 삭제된 영화 정보입니다.';
            } else {
                errorMessage.value = '서버 통신 중 에러가 발생했습니다.';
            }
        } finally {
            isLoading.value = false;
        }
    };

    const fetchSearchResults = async (query, page = 1) => {
        isLoading.value = true;
        errorMessage.value = '';
        searchCurrentPage.value = page;

        try {
            const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    api_key: import.meta.env.VITE_TMDB_API_KEY,
                    query,
                    language: 'ko-KR',
                    page,
                }
            });
            const results = response.data.results;
            results.forEach(movie => {
                movie.isFavorite = favorites.value.some(fav => fav.id === movie.id);
            });
            searchResults.value = results;
            searchTotalPages.value = response.data.total_pages;
        } catch (error) {
            errorMessage.value = '검색 중 오류가 발생했습니다.';
        } finally {
            isLoading.value = false;
        }
    };

    const toggleFavorite = (movie) => {
        const isFav = favorites.value.some(f => f.id === movie.id);
        const newState = !isFav;

        if (isFav) {
            favorites.value = favorites.value.filter(m => m.id !== movie.id);
        } else {
            favorites.value.push(movie);
        }

        movie.isFavorite = newState;
        const inMovies = movies.value.find(m => m.id === movie.id);
        if (inMovies) inMovies.isFavorite = newState;
        const inSearch = searchResults.value.find(m => m.id === movie.id);
        if (inSearch) inSearch.isFavorite = newState;

        sessionStorage.setItem('favorites', JSON.stringify(favorites.value));
    };

    return {
        movies,
        favorites,
        isLoading,
        errorMessage,
        fetchMovies,
        toggleFavorite,
        selectedMovie,
        fetchMovieDetail,
        currentPage,
        totalPages,
        sortKey,
        selectedGenre,
        searchResults,
        searchTotalPages,
        searchCurrentPage,
        fetchSearchResults,
    };
});