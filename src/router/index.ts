import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../views/MainLayout.vue";
import TwitchCallback from "../views/TwitchCallback.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: MainLayout,
    meta: {
      title: "TwitchBot Dashboard",
    },
  },
  {
    path: "/auth/twitch/callback",
    name: "TwitchCallback",
    component: TwitchCallback,
    meta: {
      title: "Twitch Authentication",
    },
  },
  {
    // Catch all route - redirect to dashboard
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to set page title
router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
