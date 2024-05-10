<template>
  <slot />
  <v-snackbar v-model="show" :color="color" :close-delay="closeDelay">
    {{ message }}
    <template #actions>
      <v-btn variant="text" @click="onSnackbarClick()">{{ actionText }}</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";

const show = ref(false);
const message = ref("");
const color = ref("");
const actionText = ref("");
const callbackAction = ref<Function>();
const closeDelay = ref(3000);

function onSnackbarClick() {
  if (callbackAction.value) {
    callbackAction.value();
  }
  show.value = false;
}

provide("snackbar", {
  showSnackbar(options: {
    message: string;
    color: string;
    actionText: string | undefined;
    actionCallback: Function | undefined;
  }) {
    message.value = options.message;
    color.value = options.color;
    show.value = true;
    actionText.value = options.actionText || "Fechar";
    callbackAction.value = options.actionCallback;
  },
  hideSnackbar() {
    show.value = false;
  },
  closeDelay() {
    return closeDelay.value;
  },
});
</script>
