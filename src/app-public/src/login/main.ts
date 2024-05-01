import { createApp } from "vue";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import i18nConfig, { registerVuesticConfigToLocale } from "@/lang";

import App from "@/login/LoginApp.vue";

const app = createApp(App);

app.use(createVuetify());
app.use(i18nConfig);

app.provide("registerVuesticConfigToLocale", registerVuesticConfigToLocale);

app.mount("body");
