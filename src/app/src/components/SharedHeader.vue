<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  showDrawer: {
    type: Boolean,
    default: true
  }
});

const navigationDrawerVisible = ref(false);
function toggleDrawer() {
  navigationDrawerVisible.value = !navigationDrawerVisible.value;
}
</script>

<template>
  <v-app-bar
    scroll-behavior="collapse"
    :title="t('project.name')"
  >
    <template #prepend>
      <a
        href="/"
        class="reference"
      >
        <img
          alt="Vue logo"
          class="logo"
          src="@/assets/logo.svg"
        >
      </a>
    </template>
    <template #append>
      <div
        v-if="props.showDrawer"
        @click="toggleDrawer"
      >
        <v-app-bar-nav-icon />
      </div>
    </template>
  </v-app-bar>
  <v-navigation-drawer
    v-model="navigationDrawerVisible"
    location="right"
  >
    <v-list>
      <slot name="navigationList" />
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.reference {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.logo {
  width: 3rem;
}
</style>
