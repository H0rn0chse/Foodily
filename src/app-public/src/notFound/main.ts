import { createApp } from "vue";

// vuetify
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import i18nConfig, { vuetifyLocaleConfig } from "@/lang";

import App from "@/notFound//NotFoundApp.vue";

const app = createApp(App);

app.use(i18nConfig);
app.use(createVuetify({
  locale: vuetifyLocaleConfig
}));

app.mount("body");
