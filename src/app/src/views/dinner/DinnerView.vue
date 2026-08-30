<script setup lang="ts">
import { useDinnerStore } from "@/stores/dinner";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import type { ListLoadParams } from "@/stores/ApiList";
const { t, d } = useI18n();

const router = useRouter();

const search = ref("");
// show loading indicator by default. For search it is delayed by 500ms
const showLoading = ref(true);
let searchDebounce: ReturnType<typeof setTimeout> | null = null;

function showDetails(dinnerId: string, expandAllCategories = false) {
  let query = {};
  if (expandAllCategories) {
    query = {
      expandAllCategories: "true",
    };
  }

  router.push({
    name: "dinnerDetail",
    params: {
      dinnerId,
    },
    query,
  });
}

const dinnerStore = useDinnerStore();
const dinnerList = dinnerStore.dinnerList;

// Track current page options for reloads
const currentOptions = ref<ListLoadParams>({ page: 1, limit: 10 });

onMounted(() => {
  dinnerList.load(currentOptions.value);
});

watch(search, (newSearch) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => searchForTerm(newSearch), 300);
});

async function searchForTerm (newSearch: string) {
  if (dinnerList.loading) {
    return;
  }

  currentOptions.value = {
    ...currentOptions.value,
    page: 1,
    search: newSearch || undefined,
  };

  // delay the loading indicator by 500ms to prevent flickering on fast searches
  showLoading.value = false;
  const timeoutId = setTimeout(() => {
    showLoading.value = true;
  }, 500);

  await dinnerList.load(currentOptions.value);

  clearTimeout(timeoutId);
  showLoading.value = true;
}

function onTableOptions(options: { page: number; itemsPerPage: number }) {
  currentOptions.value = {
    ...currentOptions.value,
    page: options.page,
    limit: options.itemsPerPage,
  };
  dinnerList.load(currentOptions.value);
}

const extendedDinnerListData = computed(() => {
  return dinnerList.items.map((dinner) => {
    return {
      ...dinner,
      date: d(new Date(dinner.date), "shortYear"),
    };
  });
});

const headers = [
  {
    key: "date",
    title: t("dinner.table.date"),
    sortable: false,
  },
  {
    key: "title",
    title: t("dinner.table.title"),
    sortable: false,
  },
  {
    key: "username",
    title: t("dinner.table.owner"),
    sortable: false,
  },
  {
    key: "navigation",
    title: "",
    sortable: false,
  },
];

async function createNewDinner() {
  const dinnerId = await dinnerStore.createDinner();
  if (dinnerId) {
    await dinnerList.load(currentOptions.value);
    showDetails(dinnerId, true);
  }
}
</script>

<template>
  <div id="dinnerContent">
    <div id="dinnerHeader">
      <h1>{{ t("dinner.title") }}</h1>
      <v-btn
        size="large"
        :title="t('dinner.createDinner')"
        color="primary"
        icon="mdi-plus"
        @click="createNewDinner"
      />
    </div>
    <div class="toolbar">
      <v-text-field
        v-model="search"
        :label="t('dinner.search')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
      />
    </div>
    <v-data-table-server
      class="tableContainer"
      :items="extendedDinnerListData"
      :items-length="dinnerList.count"
      :items-per-page-options="[10, 20, 50]"
      :headers="headers"
      :loading="dinnerList.loading && showLoading"
      fixed-header
      hover
      @update:options="onTableOptions"
    >
      <template #item.navigation="{ item }">
        <v-btn
          density="comfortable"
          :title="t('dinner.more')"
          icon="mdi-chevron-right"
          variant="flat"
          @click="showDetails(item.id)"
        />
      </template>

      <template #loading>
        <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
      </template>
    </v-data-table-server>
    <footer></footer>
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

  height: 100%;
  overflow: hidden;
  padding: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  gap: 0.5rem;
}

#dinnerHeader {
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  grid-template-areas: "title createButtonHeader";
}

#dinnerHeader > h1 {
  align-self: start;
}

.toolbar {
  width: 100%;
  max-width: 30rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.tableContainer {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: auto;
}
</style>
