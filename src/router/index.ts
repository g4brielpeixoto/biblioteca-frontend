import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("../pages/index.vue"),
    },
    {
      path: "/categories",
      name: "Categories",
      component: () => import("../pages/categories.vue"),
    },
    {
      path: "/books",
      name: "Books",
      component: () => import("../pages/books.vue"),
    },
    {
      path: "/books/:id",
      name: "Book",
      component: () => import("../pages/bookDetails.vue"),
    },
  ],
});

export default router;
