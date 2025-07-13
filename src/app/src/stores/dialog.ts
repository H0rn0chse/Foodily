// dialogStore.ts
import { useI18n } from "vue-i18n";
import { defineStore } from "pinia";
import { ref } from "vue";

type DialogOptions = {
  title?: string;
  message?: string;
};

export const useDialogStore = defineStore("dialog", () => {
  const { t } = useI18n();
  const showDialog = ref(false);
  const title = ref("");
  const message = ref("");

  const onConfirm = ref<null | (() => void)>(null);

  function open(confirmCallback: () => void, options?: DialogOptions) {
    const { title: dialogTitle, message: msg } = options || {};

    title.value = dialogTitle || t("dialog.defaultTitle");
    message.value = msg || t("dialog.defaultMessage");

    onConfirm.value = confirmCallback;

    showDialog.value = true;
  }

  function confirm() {
    showDialog.value = false;

    if (onConfirm.value) {
      onConfirm.value();
    };
  }

  function cancel() {
    showDialog.value = false;
  }

  return {
    showDialog,
    message,
    title,
    open,
    confirm,
    cancel,
  };
});
