<script setup lang="ts">
import { useDinnerStore } from "@/stores/dinner";
import { ref } from "vue";
import { reactive } from "vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
const { t, d } = useI18n();

const router = useRouter();
const route = useRoute();

let { dinnerId } = route.params;
if (Array.isArray(dinnerId)) {
  [dinnerId] = dinnerId;
}

const dinnerStore = useDinnerStore();
const dinnerDetails = dinnerStore.dinnerDetails[dinnerId];
// setInterval(() => {
//   dinnerDetails.value.date = "2024-01-03T08:34:33.000Z";

// }, 3000);
const foo = reactive({
  bruh: ""
});
foo.bruh;
console.error(dinnerDetails.value.date);
// debugger;
// const dd = ref("");
// dd.value = new Date(dinnerDetails.date).getTime();
// dinnerDetails.date = d(new Date(dinnerDetails.date), "numeric");

function formatDate(date: Date) {
  console.error("Format");
  return d(new Date(date), "numeric");
}

</script>
<template>
  <main>
    <VaButton @click="router.back">{{ t("dinnerDetail.back") }}</VaButton>
    <h1>{{ t("dinnerDetail.title") }}</h1>
    <h2>{{ t("dinnerDetails.metadata") }}</h2>
    <VaDateInput v-model="dinnerDetails.date"
      :format-date="formatDate"
      mode="single">
    </VaDateInput>
  </main>
</template>

<style scoped>
h1,
h2 {
  margin-bottom: 0.25rem;
  margin-top: 0.5rem;
}
</style>
