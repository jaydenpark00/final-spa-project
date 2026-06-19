import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MoviesView from '../views/MoviesView.vue';
import MovieDetailView from '../views/MovieDetailView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // 기본 주소 (localhost:5173/)
      name: 'home',
      component: HomeView // 이 주소로 오면 HomeView 컴포넌트를 띄워라!
    },
    {
        path: '/movies',
        name: 'movies',
        component: () => import('../views/MoviesView.vue'),
      },
      // 🔥 [12주차 추가] 웹 표준 동적 패스 파라미터 주소 등록 (:id 변수방 개설)
      {
        path: '/movies/:id',
        name: 'movie-detail',
        component: MovieDetailView,
      },
      {
        path: '/search',
        name: 'search',
        component: () => import('../views/SearchView.vue'),
      },
      {
        path: '/favorites',
        name: 'favorites',
        component: () => import('../views/FavoritesView.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundView
      }
    ],
  });

export default router;