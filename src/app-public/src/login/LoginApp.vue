<script setup lang="ts">
// import watchLocale from "@/i18n/watch";
import LoginView from "@/login/views/LoginView.vue";
import SharedHeader from "@/components/SharedHeader.vue";

</script>

<template>
  <v-app
    id="app"
    full-height
    theme="dark"
  >
    <SharedHeader :show-drawer="false" />

    <v-main scrollable>
      <LoginView />
    </v-main>
  </v-app>
</template>

<style scoped></style>
