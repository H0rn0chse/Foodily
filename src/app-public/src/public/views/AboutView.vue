<script setup lang="ts">
import { siGithub } from "simple-icons";
import { inject } from "vue";
// import feather from "feather-icons";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

// const triangle = feather.icons.activity.toSvg({
//   stroke: "red"
// });

const version = inject("foodilyVersion");

</script>

<template>
  <div id="aboutContent">
    <header>
      <h1>{{ t("project.name") }}</h1>
      <p>{{ t("about.version", [version]) }}</p>
    </header>
    <h2>
      <a
        href="https://github.com/H0rn0chse/Foodily"
        class="reference"
      >
        <!-- <svg class="icon" v-html="triangle"></svg> -->
        <svg
          class="icon"
          v-html="siGithub.svg"
        ></svg>
        {{ t("about.viewOnGitHub") }}
      </a>
    </h2>
  </div>
</template>

<style scoped>
#aboutContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 2rem;
}

header {
  margin-bottom: 3rem;
}

.reference {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
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
  margin-right: 0.5rem;
}
</style>
