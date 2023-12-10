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
  <main>
    <h1>{{ t("login.header") }}</h1>
    <p v-for="error in errorMessages"
      class="errorMessage"
      :key="error.id">
      {{ error.message }}
    </p>
    <VaForm id="login"
      ref="loginForm"
      class="flex flex-col gap-2 mb-2"
      tag="form"
      @submit.prevent="submitLogin">
      <VaInput v-model="formData.username"
        id="username"
        autocomplete="username"
        :label="t('login.username')"
        :rules="[
          (v) => Boolean(v) || t('login.username.empty'),
        ]"
        :disabled="formData.loading" />
      <VaInput v-model="formData.password"
        id="current-password"
        autocomplete="current-password"
        type="password"
        :label="t('login.password')"
        :rules="[
          (v) => Boolean(v) || t('login.password.empty'),
        ]"
        :disabled="formData.loading" />
      <VaButton type="submit"
        :loading="formData.loading">
        {{ t("login.submit") }}
      </VaButton>
    </VaForm>
  </main>
</template>

<style scoped>
h1 {
  font-size: xx-large;
}

#login {
  max-width: 20rem;
  display: flex;
  flex-direction: column;
}

a {
  color: unset;
}

form>* {
  margin: 0.5rem;
}

form input {
  margin-left: 1rem;
}

.errorMessage {
  color: var(--va-danger);
  font-weight: bold;
  margin: 0.7rem 0;
}
</style>
