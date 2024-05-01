<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { supportedLanguages } from "@/lang";
import { ref } from "vue";
const { t, locale } = useI18n();
const langs = ref(Object.keys(supportedLanguages).map((key) => {
  return {
    value: key,
    text: supportedLanguages[key],
  };
}));

const localeModel = ref(langs.value.find((entry) => entry.value === locale.value));

function storePreferences() {
  locale.value = localeModel.value?.value || "";
  const preferences = {
    language: localeModel.value?.value
  };
  // store locally
  sessionStorage.setItem("language", localeModel.value?.value || "");
  // and on server
  fetch("/api/v1/userSettings", {
    method: "PUT",
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
        v-model="localeModel"
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
