<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card
      :prepend-icon="options.icon"
      :text="options.text"
      :title="options.title"
      rounded="lg"
    >
      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn @click="dialog = false"> {{ options.disagreeText }} </v-btn>

        <v-btn @click="onAgree()"> {{ options.agreeText }} </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = defineModel<Boolean>();

const props = defineProps<{
  options: {
    icon?: string;
    title: string;
    text: string;
    agreeText: string;
    disagreeText: string;
    agreeAction?: () => void;
  };
}>();

function onAgree() {
  if (props.options.agreeAction) {
    props.options.agreeAction();
  }
  dialog.value = false;
}
</script>
