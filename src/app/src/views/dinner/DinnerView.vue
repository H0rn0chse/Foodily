<script setup lang="ts">
import { useDinnerStore } from "@/stores/dinner";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import LoadingScreen from "@/components/LoadingScreen.vue";
const { t, d } = useI18n();

const dinnerStore = useDinnerStore();
const dinnerList = dinnerStore.dinnerList;

const router = useRouter();

function showDetails(dinnerId: number) {
  router.push({
    name: "dinnerDetail",
    params: {
      dinnerId
    }
  });
}
</script>

<template>
  <div id="dinnerContent">
    <h1>{{ t("dinner.title") }}</h1>
    <v-btn>{{ t("dinner.createDinner") }}</v-btn>
    <v-divider />
    <h2>{{ t("dinner.history") }}</h2>
    <div class="toolbar">
      <v-text-field :placeholder="t('dinner.search')"
        :disabled="true" />
    </div>
    <LoadingScreen :busy="dinnerList.loading"
      :success="dinnerList.success">
      <template #success>
        <div class="gridTable">
          <h1 class="header">{{ t("dinner.date") }}</h1>
          <h1 class="header">{{ t("dinner.owner") }}</h1>
          <h1 class="header"></h1>
          <div class="separator"></div>
          <template v-for="dinner in dinnerList.data"
            :key="dinner.id">
            <div class="cell">{{ d(new Date(dinner.date), "numeric") }}</div>
            <div class="cell">{{ dinner.username }}</div>
            <div class="cell">
              <v-btn size="small"
                preset="secondary"
                hover-behavior="opacity"
                :hover-opacity="0.4"
                @click="showDetails(dinner.id)">
                {{ t("dinner.more") }}
              </v-btn>
            </div>
          </template>
        </div>
      </template>
    </LoadingScreen>
  </div>
</template>

<style scoped>
h1,
h2 {
  margin-bottom: 0.25rem;
  margin-top: 0.5rem;
}

#dinnerContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 1rem;
  padding-left: 1rem;
}

.toolbar {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
