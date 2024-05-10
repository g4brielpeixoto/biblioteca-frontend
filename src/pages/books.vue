<template>
  <v-container style="max-width: 450px">
    <!-- INPUT PARA BUSCAR CATEGORIA -->
    <div class="d-flex align-center mb-8">
      <v-text-field
        v-model="search"
        label="Buscar Livros"
        variant="solo-filled"
        hide-details
        class="mr-2"
      ></v-text-field>

      <v-tooltip text="Adicionar Livro" location="top">
        <template v-slot:activator="{ props }">
          <router-link to="/books/0">
            <v-btn v-bind="props" color="#9999f8" height="55"
              ><v-icon size="large">mdi-plus</v-icon>
            </v-btn>
          </router-link>
        </template>
      </v-tooltip>
    </div>

    <!-- LAÇO DE REPETIÇÃO RENDERIZANDO CATEGORIAS CADASTRADAS -->
    <v-hover v-for="book in booksFiltered" :key="book.id">
      <template v-slot:default="{ isHovering, props }">
        <router-link :to="`/books/${book.id}`">
          <v-sheet
            v-bind="props"
            :style="{
              transform: isHovering ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s',
            }"
            :elevation="isHovering ? 10 : 2"
            rounded
            class="pa-5 mb-2"
          >
            <span>{{ book.title }}</span>
            <v-spacer></v-spacer>
            <div
              class="d-flex justify-space-between align-center mt-1"
              style="color: #9999f8"
            >
              <v-chip variant="outlined" size="x-small">
                {{ book.category?.name }}
              </v-chip>

              <span class="text-caption">{{
                `${book.availableCopies}/${book.copies}`
              }}</span>
            </div>
          </v-sheet>
        </router-link>
      </template>
    </v-hover>
  </v-container>
</template>

<script lang="ts" setup>
import { Book } from "../interfaces";
import { onMounted, ref, computed, inject } from "vue";
import api from "../services/api";

const { showSnackbar } = inject("snackbar") as any;
const books = ref<Book[]>([]);
const loading = ref(false);
const search = ref("");

const booksFiltered = computed<Book[]>(() =>
  books.value.filter((book) => {
    if (Number(search.value)) {
      return book.id === Number(search.value);
    }
    return (
      book.title?.toLowerCase().includes(search.value.toLowerCase()) ||
      book.category?.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.value.toLowerCase())
    );
  })
);

async function getBooks() {
  try {
    loading.value = true;
    books.value = (await api.get<Book[]>("/book")).data;
    books.value.sort((a, b) => (a.id < b.id ? 1 : -1));
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(getBooks);
</script>
