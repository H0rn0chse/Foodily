import { createApp } from "vue";
import { createPinia } from "pinia";

// vuetify
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import i18nConfig, { vuetifyLocaleConfig } from "@/lang";
import packageJson from "@project/package.json";

import App from "@/public/App.vue";
import router from "@/public/router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18nConfig);
app.use(createVuetify({
  locale: vuetifyLocaleConfig
}));
app.provide("foodilyVersion", packageJson.version);

app.mount("body");
