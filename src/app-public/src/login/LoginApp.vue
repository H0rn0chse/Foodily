<script setup lang="ts">
// import watchLocale from "@/i18n/watch";
import { inject } from "vue";
import LoginView from "@/login/views/LoginView.vue";
import SharedHeader from "@/components/SharedHeader.vue";

inject<Function>("registerVuesticConfigToLocale", () => { })();

</script>

<template>
  <v-app id="app" full-height theme="dark">
    <SharedHeader :show-drawer="false" />

    <v-main scrollable>
      <LoginView />
    </v-main>
  </v-app>
</template>

<style scoped>
</style>
