<template>
  <v-app-bar class="px-6">
    <router-link to="/">
      <v-icon>mdi-library</v-icon>
    </router-link>
    <v-spacer></v-spacer>
    <div class="nav">
      <router-link
        v-for="route in routes"
        :to="route.path"
        :class="{ 'active-link': $route.path.includes(route.path) }"
        class="route-link"
      >
        <span> {{ route.name }} </span>
      </router-link>
    </div>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<style scoped>
.nav {
  display: flex;
  gap: 20px;
}

.route-link {
  position: relative;
}

.route-link::after {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #9999f8; /* Altere a cor da linha conforme necessário */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.route-link.active-link::after {
  opacity: 1;
}
</style>

<script setup lang="ts">
const routes = [
  {
    name: "LIVROS",
    path: "/books",
  },
  {
    name: "CATEGORIAS",
    path: "/categories",
  },
];
</script>
