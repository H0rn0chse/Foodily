<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { reactive } from "vue";
const { t } = useI18n();

type ErrorMessage = {
  id: string,
  message: string
}

const formData = reactive({
  username: "",
  password: "",
  loading: false
});

const errorMessages: ErrorMessage[] = reactive([]);

function clearErrorMessages() {
  errorMessages.splice(0, errorMessages.length);
}

async function submitLogin() {
  formData.loading = true;
  clearErrorMessages();

  const body = new URLSearchParams();
  body.append("username", formData.username);
  body.append("password", formData.password);

  const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
  const response = await fetch("/login/password", {
    method: "POST",
    body,
    headers
  });

  if (response.ok) {
    // Redirect to app
    window.location.href = response.url;
    return;
  }

  // Error case
  errorMessages.push({
    id: clearErrorMessages.length.toString(),
    message: t("login.authFailed")
  });
  formData.password = "";
  formData.loading = false;
}
</script>

<template>
  <div id="loginContent">
    <h1>{{ t("login.title") }}</h1>
    <p v-for="error in errorMessages"
      class="errorMessage"
      :key="error.id">
      {{ error.message }}
    </p>
    <v-form id="loginForm"
      ref="loginForm"
      tag="form"
      @submit.prevent="submitLogin">
      <v-text-field v-model="formData.username"
        id="username"
        autocomplete="username"
        :label="t('login.username')"
        :rules="[
          (v) => Boolean(v) || t('login.username.empty'),
        ]"
        :disabled="formData.loading" />
      <v-text-field v-model="formData.password"
        id="current-password"
        autocomplete="current-password"
        type="password"
        :label="t('login.password')"
        :rules="[
          (v) => Boolean(v) || t('login.password.empty'),
        ]"
        :disabled="formData.loading" />
      <v-btn type="submit"
        :loading="formData.loading"
        color="primary"
        class="submitBtn">
        {{ t("login.submit") }}
      </v-btn>
    </v-form>
  </div>
</template>

<style scoped>
#loginContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 2rem;
}

#loginForm {
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 100%;
  max-width: 20rem;
}

.submitBtn {
  align-self: center;
}

.errorMessage {
  color: var(--va-danger);
  font-weight: bold;
  margin: 0.7rem 0;
}
</style>
