<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <main>
    <va-button color="info" class="mr-6 mb-2">
      {{ t("test") }}
    </va-button>
  </main>
</template>
