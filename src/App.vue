<template>
  <v-app>
    <SnackbarProvider>
      <Toolbar />
      <v-main class="ma-4 mx-auto" style="width: 100vw">
        <router-view />
      </v-main>
    </SnackbarProvider>
  </v-app>
</template>

<script lang="ts" setup>
//
</script>
