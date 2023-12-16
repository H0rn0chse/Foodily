import { createApp } from "vue";
import { createVuestic } from "vuestic-ui";
import "vuestic-ui/css";

import i18nConfig, { registerVuesticConfigToLocale } from "@/lang";

import App from "@/notFound//NotFoundApp.vue";

const app = createApp(App);

app.use(createVuestic());
app.use(i18nConfig);

app.provide("registerVuesticConfigToLocale", registerVuesticConfigToLocale);

app.mount("body");
