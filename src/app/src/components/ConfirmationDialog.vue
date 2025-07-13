<script setup lang="ts">
import { useDialogStore } from "@/stores/dialog";
import { useI18n } from "vue-i18n";

const dialogStore = useDialogStore();
const { t } = useI18n();

function confirmDelete() {
  dialogStore.confirm();
}

function cancelDelete() {
  dialogStore.cancel();
}
</script>

<template>
  <v-dialog
    v-model="dialogStore.showDialog"
    max-width="400"
  >
    <v-card>
      <v-card-title>{{ dialogStore.title }}</v-card-title>
      <v-card-text>
        {{ dialogStore.message }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="cancelDelete">
          {{ t("dialog.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          @click="confirmDelete"
        >
          {{ t("dialog.confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
