<script setup lang="ts">
</script>

<template>
  <header id="header">
    <va-navbar>
      <template #left>
        <va-navbar-item class="logo">
          <a href="/">
            <img alt="Vue logo" class="logo" src="@/assets/logo.svg" />
          </a>
          <h2>Foodily</h2>
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
.logo {
  width: 3rem;
  display: flex;
  align-items: center
}
</style>
