import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuestic } from "vuestic-ui";
import "vuestic-ui/css";

import i18nConfig, { registerVuesticConfigToLocale } from "./lang";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(createVuestic());
app.use(i18nConfig);

app.provide("registerVuesticConfigToLocale", registerVuesticConfigToLocale);

app.mount("body");
