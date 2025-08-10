import { createRouter, createWebHashHistory, type RouteLocationNormalizedLoadedGeneric } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView
    },
    {
      path: "/dinner",
      name: "dinner",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/dinner/DinnerView.vue"),
    },
    {
      path: "/dinner/:dinnerId",
      name: "dinnerDetail",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/dinner/DinnerDetailView.vue")
    },
    {
      path: "/dinner/:dinnerId/course/:courseId",
      name: "courseDetail",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/dinner/CourseDetailView.vue")
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/AboutView.vue")
    },
    {
      path: "/profile",
      name: "profile",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/SettingsView.vue")
    }
  ]
});

export default router;

export function parseParams(route: RouteLocationNormalizedLoadedGeneric, key: string) {
  const value = route.params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
