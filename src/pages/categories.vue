<template>
  <v-container style="max-width: 450px">
    <!-- INPUT PARA ADICIONAR/EDITAR CATEGORIA -->
    <div class="d-flex align-center mb-8" v-if="editing">
      <v-text-field
        ref="inputCategoria"
        v-model="editingCategory.name"
        label="Nome da Categoria"
        variant="solo-filled"
        hide-details
        class="mr-2"
        autofocus
        @keyup.enter="save"
        @keyup.esc="editing = false"
      ></v-text-field>

      <v-tooltip text="Cancelar" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            color="error"
            height="55"
            class="mr-2"
            @click="editing = false"
            ><v-icon size="large">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Gravar" location="top">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" color="success" height="55" @click="save"
            ><v-icon size="large">mdi-content-save</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <!-- INPUT PARA BUSCAR CATEGORIA -->
    <div class="d-flex align-center mb-8" v-else>
      <v-text-field
        v-model="search"
        label="Buscar Categorias"
        variant="solo-filled"
        hide-details
        class="mr-2"
      ></v-text-field>

      <v-tooltip text="Adicionar categoria" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            color="#9999f8"
            height="55"
            @click="onCategoryAddClick"
            ><v-icon size="large">mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <!-- LAÇO DE REPETIÇÃO RENDERIZANDO CATEGORIAS CADASTRADAS -->
    <v-sheet
      rounded
      v-for="category in categoriesFiltered"
      :key="category.id"
      class="pa-2 pl-5 mb-2 d-flex justify-space-between align-center"
    >
      <span>{{ category.name }}</span>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn variant="text" icon="mdi-dots-vertical" v-bind="props">
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in menuItems"
            :key="index"
            :value="index"
          >
            <v-list-item-title @click="item.action(category)">{{
              item.text
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, inject } from "vue";
import { Category } from "../interfaces";
import api from "../services/api";

const { showSnackbar } = inject("snackbar") as any;
const categories = ref<Category[]>([]);
const menuItems = ref([
  { text: "Editar", action: onCategoryEditClick },
  { text: "Deletar", action: onCategoryDeleteClick },
]);
const loading = ref(false);
const search = ref("");
const editingCategory = ref<Category>({
  id: 0,
  name: "",
});
const editing = ref(false);
const inputCategoria = ref();
const categoriesFiltered = computed(() =>
  categories.value.filter((category) =>
    category.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

async function getCategories() {
  try {
    loading.value = true;
    categories.value = (await api.get<Category[]>("/category")).data;
    categories.value.sort((a, b) => (a.id < b.id ? 1 : -1));
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function save() {
  editingCategory.value.id ? updateCategory() : addCategory();
}

async function addCategory() {
  //Se o texto estiver vazio, exibe um snackbar e foca no input novamente
  if (!editingCategory.value.name.trim()) {
    showSnackbar({
      message: "Nome da categoria é obrigatório",
      color: "error",
    });
    inputCategoria.value.focus();
    return;
  }

  //Faz a requisição para adicionar a categoria
  try {
    await api.post("/category", { name: editingCategory.value.name.trim() });
    editingCategory.value.name = "";
    editing.value = false;

    //Atualiza a lista de categorias
    getCategories();
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  }
}

async function updateCategory() {
  //Se o texto estiver vazio, exibe um snackbar e foca no input novamente
  if (!editingCategory.value.name.trim()) {
    showSnackbar({
      message: "Nome da categoria é obrigatório",
      color: "error",
    });
    inputCategoria.value.focus();
    return;
  }

  try {
    //Faz a requisição para atualizar a categoria
    await api.put(`/category/${editingCategory.value.id}`, {
      name: editingCategory.value.name.trim(),
    });
    editingCategory.value.name = "";
    editing.value = false;

    //Atualiza a lista de categorias
    getCategories();
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  }
}

function onCategoryAddClick() {
  editingCategory.value = { id: 0, name: "" };
  editing.value = true;
}

async function onCategoryDeleteClick(category: Category) {
  try {
    await api.delete(`/category/${category.id}`);
    showSnackbar({
      message: `Categoria '${category.id} - ${category.name}' deletada com sucesso`,
      color: "success",
    });
    getCategories();
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  }
}

function onCategoryEditClick(category: Category) {
  editingCategory.value = { ...category };
  editing.value = true;
}

onMounted(getCategories);
</script>
