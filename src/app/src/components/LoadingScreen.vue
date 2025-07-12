<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  success: {
    type: Boolean,
    default: true
  },
  busy: {
    type: Boolean,
    default: true
  }
});

</script>

<template>
  <div
    id="LoadingScreenContent"
    class="rounded"
  >
    <template v-if="props.success">
      <slot name="success">
      </slot>
    </template>
    <template v-else>
      <slot name="error">
        <h2>{{ t("loadingScreen.error") }}</h2>
      </slot>
    </template>
    <v-overlay
      :model-value="props.busy"
      contained
      persistent
      class="overlay"
    >
      <div class="loader"></div>
    </v-overlay>
  </div>
</template>

<style scoped>
#LoadingScreenContent {
  position: relative;
}

.overlay {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  border-radius: 5px;
  height: 8px;
  width: 130px;
  --c: no-repeat linear-gradient(white 0 0);
  background: var(--c), var(--c), rgb(93, 4, 155);
  background-size: 60% 100%;
  animation: l16 3s infinite;
}

@keyframes l16 {
  0% {
    background-position: -150% 0, -150% 0
  }

  66% {
    background-position: 250% 0, -150% 0
  }

  100% {
    background-position: 250% 0, 250% 0
  }
}
</style>
