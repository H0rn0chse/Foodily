<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <header id="header">
    <va-navbar>
      <template #left>
        <va-navbar-item>
          <a href="/"
            class="reference">
            <img alt="Vue logo"
              class="logo"
              src="@/assets/logo.svg" />
            <h2>{{ t("project.name") }}</h2>
          </a>
          <slot name="left"></slot>
        </va-navbar-item>
      </template>
      <template #center>
        <slot name="center"></slot>
      </template>
      <template #right>
        <slot name="right"></slot>
      </template>
    </va-navbar>
  </header>
</template>

<style scoped>
.reference {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.reference,
.reference:visited {
  color: unset;
}

.logo {
  width: 3rem;
}
</style>
