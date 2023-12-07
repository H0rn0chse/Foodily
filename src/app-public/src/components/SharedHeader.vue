<script setup lang="ts">
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
            <h2>Foodily</h2>
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
