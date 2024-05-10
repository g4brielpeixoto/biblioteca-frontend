<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card
      :prepend-icon="options.icon"
      :text="options.text"
      :title="options.title"
      rounded="lg"
    >
      <v-text-field
        class="mx-4"
        v-model="inputText"
        variant="solo-filled"
        type="number"
      ></v-text-field>

      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn
          @click="onButtonClick()"
          :disabled="inputText === '' || inputText === '0'"
        >
          Ok
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialog = defineModel<Boolean>();
const inputText = ref("");
const props = defineProps<{
  options: {
    icon?: string;
    title: string;
    text: string;
    action: Function;
  };
}>();

function onButtonClick() {
  if (props.options.action) props.options.action(Number(inputText.value));
  inputText.value = "";
}
</script>
