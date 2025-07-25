<script setup lang="ts">
import { useDinnerStore } from "@/stores/dinner";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import feather from "feather-icons";
import { computed, ref } from "vue";
const { t, d } = useI18n();

const router = useRouter();

const search = ref("");

function showDetails(dinnerId: string, expandAllCategories = false) {
  let query = {};
  if (expandAllCategories) {
    query = {
      expandAllCategories: "true"
    };
  }

  router.push({
    name: "dinnerDetail",
    params: {
      dinnerId
    },
    query
  });
}

const dinnerStore = useDinnerStore();
const dinnerList = dinnerStore.dinnerList;
const extendedDinnerListData = computed(() => {
  return dinnerList.data.map((dinner) => {
    return {
      ...dinner,
      date: d(new Date(dinner.date), "shortYear"),
      navigation: {
        icon: feather.icons["chevron-right"].toSvg(), // todo: remove
        text: t("dinner.table.more"),
        onClick: () => showDetails(dinner.id)
      }
    };
  });
});

const headers = [{
  key: "date",
  title: t("dinner.table.date"),
  sortable: false
}, {
  key: "title",
  title: t("dinner.table.title"),
  sortable: false
}, {
  key: "username",
  title: t("dinner.table.owner"),
  sortable: false
}, {
  key: "navigation",
  title: "",
  sortable: false
}];

function createNewDinner() {
  dinnerStore.createDinner().then((dinnerId) => {
    if (dinnerId) {
      showDetails(dinnerId, true);
    }
  });
}

</script>

<template>
  <div id="dinnerContent">
    <h1>{{ t("dinner.title") }}</h1>
    <div class="toolbar">
      <v-text-field
        v-model="search"
        :label="t('dinner.search')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
        disabled
      />
    </div>
    <v-data-table-server
      :items="extendedDinnerListData"
      :items-length="dinnerList.count"
      :headers="headers"
      :loading="dinnerList.loading"
      hover
    >
      <template #item.navigation="{ item }">
        <v-btn
          density="comfortable"
          :title="t('dinner.more')"
          icon="mdi-chevron-right"
          variant="flat"
          @click="item.navigation.onClick"
        />
      </template>

      <template #loading>
        <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
      </template>
    </v-data-table-server>
    <footer>
      <v-btn
        size="large"
        :title="t('dinner.createDinner')"
        color="primary"
        icon="mdi-plus"
        @click="createNewDinner"
      />
    </footer>
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
  padding-right: 1rem;
  gap: 0.5rem;
}

#dinnerContent>*:first-child,
#dinnerContent>h1 {
  align-self: start;
}

#dinnerContent>footer {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
}

.toolbar {
  width: 100%;
  max-width: 30rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
