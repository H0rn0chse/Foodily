import { createApp } from "vue";
import { createVuestic } from "vuestic-ui";
import "vuestic-ui/css";

import i18nConfig from "../lang";

import App from "./LoginApp.vue";

const app = createApp(App);

app.use(createVuestic());
app.use(i18nConfig);

app.mount("body");
