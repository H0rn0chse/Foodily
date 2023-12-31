<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div class="about">
    <h1>This is a profile page</h1>
    <p>{{ t("test") }}</p>
  </div>
</template>

<style></style>
