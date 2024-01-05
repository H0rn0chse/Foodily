<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { supportedLanguages } from "@/lang";
import { ref } from "vue";
const { t, locale } = useI18n();
const langs = ref(supportedLanguages);

function storePreferences() {
  const preferences = {
    language: locale.value
  };
  // store locally
  sessionStorage.setItem("language", locale.value);
  // and on server
  fetch("/api/v1/userSettings", {
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preferences)
  });
}
</script>

<template>
  <div class="about">
    <h1>{{ t("settings.title") }}</h1>
    <div class="settingsGroup">
      <VaSelect :label="t('settings.languageSelect')"
        :options="langs"
        v-model="locale"
        @update:modelValue="storePreferences" />
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: xx-large;
}

.settingsGroup {
  margin-top: 1rem;
  padding-left: 1rem;
}
</style>
