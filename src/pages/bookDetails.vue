<template>
  <question-dialog
    v-model="questionDialogModel"
    :options="questionDialogOptions"
  />
  <input-dialog v-model="inputDialogModel" :options="inputDialogOptions" />
  <v-container style="max-width: 500px">
    <v-col>
      <v-row justify="end" class="mb-6">
        <!-- BOTÃO RESERVAR -->
        <v-btn
          size="small"
          color="success"
          class="mr-2"
          variant="outlined"
          v-if="!editing"
          @click="onReserveClick()"
        >
          <v-icon>mdi-arrow-up</v-icon>
          <span v-if="display.smAndUp.value" class="ml-1">Reservar</span>
        </v-btn>

        <!-- BOTÃO DEVOLVER -->
        <v-btn
          size="small"
          color="error"
          class="mr-2"
          variant="outlined"
          v-if="!editing"
          @click="onReturnClick()"
        >
          <v-icon>mdi-arrow-down</v-icon>
          <span v-if="display.smAndUp.value" class="ml-1">Devolver</span>
        </v-btn>

        <!-- BOTÃO DELETAR -->
        <v-btn
          size="small"
          color="error"
          class="mr-2"
          v-if="!editing"
          @click="onDeleteClick()"
        >
          <v-icon>mdi-delete</v-icon>
          <span v-if="display.smAndUp.value" class="ml-1">Remover</span>
        </v-btn>

        <!-- BOTÃO CANCELAR EDIÇÃO -->
        <v-btn
          size="small"
          color="error"
          class="mr-2"
          v-if="editing && route.params.id !== '0'"
          @click="onClickCancel()"
        >
          <v-icon>mdi-close</v-icon>
          <span v-if="display.smAndUp.value" class="ml-1">Cancelar</span>
        </v-btn>

        <!-- BOTÃO SALVAR -->
        <v-btn
          size="small"
          color="success"
          class="mr-2"
          v-if="editing"
          type="submit"
          @click="onSaveClick()"
        >
          <v-icon>mdi-content-save</v-icon>
          <span v-if="display.smAndUp.value" class="ml-1">Salvar</span>
        </v-btn>

        <!-- BOTÃO ENTRAR MODO EDIÇÃO -->
        <v-btn
          size="small"
          color="success"
          class="mr-2"
          v-if="!editing"
          @click="onClickEdit()"
        >
          <v-icon>mdi-pencil</v-icon>
          <span v-if="display.smAndUp.value" class="ml-1">Editar</span>
        </v-btn>
      </v-row>

      <v-form v-model="formValid">
        <v-row>
          <v-text-field
            v-model="book.title"
            label="Título"
            variant="solo-filled"
            :readonly="!editing"
            autofocus
            required
            :rules="[(v) => !!v || 'Campo obrigatório']"
          ></v-text-field>
        </v-row>

        <v-row>
          <v-text-field
            v-model="book.author"
            label="Autor"
            variant="solo-filled"
            :readonly="!editing"
            :rules="[(v) => !!v || 'Campo obrigatório']"
          ></v-text-field>
        </v-row>

        <v-row>
          <v-col cols="6" class="pa-0 pr-2">
            <v-text-field
              type="number"
              v-model="book.publicationYear"
              label="Ano de Publicação"
              variant="solo-filled"
              :readonly="!editing"
              :rules="[
                (v) =>
                  (Number(v) > 0 && Number(v) < new Date().getFullYear() + 1) ||
                  'Ano inválido',
              ]"
            ></v-text-field>
          </v-col>

          <v-col cols="6" class="pa-0 pl-2">
            <v-text-field
              type="number"
              v-if="editing"
              v-model="book.copies"
              label="Cópias"
              variant="solo-filled"
              :rules="[(v) => Number(v) > 0 || 'Número de cópias inválido']"
            ></v-text-field>
            <v-text-field
              v-else
              v-model="availableCopies"
              label="Cópias Disponíveis"
              variant="solo-filled"
              readonly
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-autocomplete
            v-model="book.category"
            :items="categories"
            item-title="name"
            return-object
            label="Categoria"
            variant="solo-filled"
            :readonly="!editing"
            :rules="[(v) => !!v || 'Campo obrigatório']"
          ></v-autocomplete>
        </v-row>

        <v-row>
          <v-textarea
            v-model="book.description"
            label="Descrição"
            variant="solo-filled"
            :readonly="!editing"
            :rules="[(v) => !!v || 'Campo obrigatório']"
          ></v-textarea>
        </v-row>
      </v-form>
    </v-col>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, inject, onMounted, computed } from "vue";
import { Book, Category } from "../interfaces";
import api from "../services/api";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const { showSnackbar } = inject("snackbar") as any;
const loading = ref(false);
const book = ref<Book | null>({
  title: "",
  author: "",
  availableCopies: 0,
  copies: 0,
  category: {
    id: 0,
    name: "",
  },
  description: "",
  id: 0,
  publicationYear: 0,
});
const bookCopy = Object.assign({}, book);
const categories = ref<Category[]>([]);
const route = useRoute();
const router = useRouter();
const editing = ref(false);
const availableCopies = computed(
  () => book.value!.availableCopies + " de " + book.value!.copies
);
const questionDialogModel = ref(false);
const questionDialogOptions = ref({
  icon: "mdi-alert-circle",
  title: "Remover Livro",
  text: "Tem certeza que deseja remover este livro?",
  agreeText: "Sim",
  disagreeText: "Não",
  agreeAction: deleteBook,
});
const inputDialogModel = ref(false);
const inputDialogOptions = ref({
  icon: "",
  title: "",
  text: "",
  action: (copies: number) => {},
});
const formValid = ref(false);
const display = useDisplay();

async function getBook() {
  try {
    loading.value = true;
    book.value = (await api.get<Book>(`/book/${route.params.id}`)).data;
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function getCategories() {
  try {
    categories.value = (await api.get<Category[]>("/category")).data;
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  }
}

function onClickEdit() {
  editing.value = true;
  bookCopy.value = Object.assign({}, book.value);
}

function onClickCancel() {
  editing.value = false;
  book.value = Object.assign({}, bookCopy.value);
}

async function onSaveClick() {
  if (!formValid.value) {
    showSnackbar({
      message: "Preencha todos os campos corretamente!",
      color: "error",
    });
    return;
  }
  try {
    loading.value = true;
    const payload = {
      title: book.value!.title,
      author: book.value!.author,
      publicationYear: book.value!.publicationYear,
      description: book.value!.description,
      copies: book.value!.copies,
      categoryId: book.value!.category!.id,
    };

    if (route.params.id === "0") {
      const savedBook = await api.post("/book", payload);
      showSnackbar({
        message: "Livro cadastrado com sucesso!",
        color: "success",
      });
      book.value = savedBook.data;
      router.push(`/books/${savedBook.data.id}`);
    } else {
      const updatedBook = await api.put(`/book/${book.value!.id}`, payload);
      showSnackbar({
        message: "Livro atualizado com sucesso!",
        color: "success",
      });
      book.value = updatedBook.data;
    }
    editing.value = false;
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function onReserveClick() {
  inputDialogModel.value = true;
  inputDialogOptions.value = {
    icon: "mdi-arrow-up",
    title: "Reservar Livro",
    text: "Quantas cópias deseja reservar?",
    action: reserveBook,
  };
}

async function reserveBook(copies: number) {
  try {
    loading.value = true;
    const updateBook = await api.post(`/book/${book.value!.id}/reserve`, {
      copies,
    });
    showSnackbar({
      message: `${copies} ${copies > 1 ? "livros" : "livro"} reservado${
        copies > 1 ? "s" : ""
      } com sucesso!`,
      color: "success",
    });
    book.value = updateBook.data;
    inputDialogModel.value = false;
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function onReturnClick() {
  inputDialogModel.value = true;
  inputDialogOptions.value = {
    icon: "mdi-arrow-down",
    title: "Devolver Livro",
    text: "Quantas cópias deseja devolver?",
    action: returnBook,
  };
}

async function returnBook(copies: number) {
  try {
    loading.value = true;
    const updatedBook = await api.post(`/book/${book.value!.id}/return`, {
      copies,
    });
    showSnackbar({
      message: `${copies} ${copies > 1 ? "livros" : "livro"} devolvido${
        copies > 1 ? "s" : ""
      } com sucesso!`,
      color: "success",
    });
    book.value = updatedBook.data;
    inputDialogModel.value = false;
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function onDeleteClick() {
  questionDialogModel.value = true;
}

async function deleteBook() {
  try {
    loading.value = true;
    await api.delete(`/book/${book.value!.id}`);
    showSnackbar({
      message: "Livro removido com sucesso!",
      color: "success",
    });
    router.push("/books");
  } catch (error) {
    showSnackbar({
      message: error.response?.data?.message || error,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function init() {
  getCategories();
  if (route.params.id === "0") {
    editing.value = true;
  } else {
    getBook();
  }
}
onMounted(init);
</script>
