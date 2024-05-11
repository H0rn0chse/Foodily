<script setup lang="ts">
import { useDinnerStore } from "@/stores/dinner";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
const { t } = useI18n();

const router = useRouter();
const route = useRoute();

let { dinnerId } = route.params;
if (Array.isArray(dinnerId)) {
  [dinnerId] = dinnerId;
}

const dinnerStore = useDinnerStore();
const dinnerDetails = dinnerStore.dinnerDetails[dinnerId];
const dinnerDetailsDate = computed({
  get: () => {
    return formatDate(new Date(dinnerDetails.value.date));
  },
  set: (newDateString) => {
    dinnerDetails.value.date = new Date(newDateString).toISOString();
  }
});

/**
 * Formats the date to be compatible with the input
 */
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

</script>
<template>
  <div id="dinnerDetailContent">
    <v-btn @click="router.back">{{ t("dinnerDetail.back") }}</v-btn>
    <h1>{{ t("dinnerDetail.title") }}</h1>
    <h2>{{ t("dinnerDetails.metadata") }}</h2>
    <v-text-field v-model="dinnerDetailsDate"
      type="date">
    </v-text-field>
  </div>
</template>

<style scoped>
#dinnerDetailContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 1rem;
  padding-left: 1rem;
}

#dinnerDetailContent>*:first-child,
#dinnerDetailContent>h1 {
  align-self: start;
}

h1,
h2 {
  margin-bottom: 0.25rem;
  margin-top: 0.5rem;
}
</style>
