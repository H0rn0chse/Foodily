<script setup lang="ts">
import NotFoundView from "@/notFound/views/NotFoundView.vue";
import SharedHeader from "@/components/SharedHeader.vue";

</script>

<template>
  <v-app id="app"
    full-height
    theme="dark">
    <SharedHeader :show-drawer="false" />

    <v-main scrollable>
      <NotFoundView />
    </v-main>
  </v-app>
</template>

<style scoped></style>
