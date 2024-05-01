import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import packageJson from "@project/package.json";
import i18nConfig, { registerVuesticConfigToLocale } from "@/lang";

import App from "@/public/App.vue";
import router from "@/public/router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(createVuetify());
app.use(i18nConfig);

app.provide("registerVuesticConfigToLocale", registerVuesticConfigToLocale);
app.provide("foodilyVersion", packageJson.version);

app.mount("body");
