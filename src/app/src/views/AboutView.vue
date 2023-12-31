<script setup lang="ts">
import { siGithub } from "simple-icons";
import { inject } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const version = inject("foodilyVersion");

</script>

<template>
  <div class="about">
    <header>
      <h1>{{ t("project.name") }}</h1>
      <p>{{ t("about.version", [version]) }}</p>
    </header>
    <h2>
      <a href="https://github.com/H0rn0chse/Foodily"
        class="reference">
        <svg class="icon"
          v-html="siGithub.svg"></svg>
        {{ t("about.viewOnGitHub") }}
      </a>
    </h2>
  </div>
</template>

<style scoped>
.about {
  width: 100%;
  height: 100%;
  padding-top: 3rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
}

header {
  margin-bottom: 3rem;
}

h1 {
  font-size: xx-large;
}

h2 {
  font-size: large;
}

.reference {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.reference,
.reference:visited {
  color: unset;
}

.reference:hover {
  text-decoration: underline;
}

.icon {
  width: 20pt;
  height: 20pt;
  margin: 0.2rem;
}
</style>
