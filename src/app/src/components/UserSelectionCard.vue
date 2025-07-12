<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emit = defineEmits(["close", "select"]);

const userStore = useUserStore();

const headers = [{
  key: "username",
  title: t("userSelectionCard.table.username"),
  sortable: false
}];

const search = ref("");
const selectedUsers = ref([]);

function handleClose() {
  emit("close");
  search.value = "";
  selectedUsers.value = [];
}

function handleSelect() {
  emit("select", selectedUsers.value);
  handleClose();
}


</script>

<template>
  <v-card :title="t('userSelectionCard.title')">
    <template #text>
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
      />
    </template>
    <v-data-table
      v-model="selectedUsers"
      :headers="headers"
      :items="userStore.userList.data"
      :loading="userStore.userList.loading"
      :search="search"
      show-select
      hide-default-header
      hide-default-footer
      hover
    />
    <template #actions>
      <v-btn
        :text="t('userSelectionCard.close')"
        @click="handleClose()"
      />
      <v-btn
        color="primary"
        :text="t('userSelectionCard.select')"
        @click="handleSelect()"
      />
    </template>
  </v-card>
</template>

<style scoped></style>
