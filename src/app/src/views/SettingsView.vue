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

const localeModel = ref(locale.value);

function storePreferences() {
  locale.value = localeModel.value || "";
  const preferences = {
    language: localeModel.value
  };
  // store locally
  sessionStorage.setItem("language", localeModel.value || "");
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
  <div id="settingsContent">
    <h1>{{ t("settings.title") }}</h1>
    <v-select :label="t('settings.languageSelect')"
      :items="langs"
      item-title="text"
      item-value="value"
      v-model="localeModel"
      class="select"
      @update:modelValue="storePreferences" />
  </div>
</template>

<style scoped>
#settingsContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  padding-left: 1rem;
}

#settingsContent>h1 {
  align-self: start;
}

.select {
  min-width: 20rem;
}
</style>
