<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { reactive } from "vue";
const { t } = useI18n();

const form = reactive({
  login: "",
  password: "",
});

// function handleSubmit() {
//   alert("hi");
// }
</script>

<template>
  <main>
    <h1>Sign in</h1>
    <VaForm id="login"
      class="flex flex-col gap-2 mb-2"
      tag="form"
      action="/login/password"
      method="post">
      <VaInput v-model="form.login"
        :label="t('login.username')"
        name="username"
        :rules="[
          (v) => Boolean(v) || t('login.username.empty'),
        ]" />
      <VaInput v-model="form.password"
        :label="t('login.password')"
        name="password"
        type="password"
        :rules="[
          (v) => Boolean(v) || t('login.password.empty'),
        ]" />
      <VaButton type="submit">Sign In </VaButton>
    </VaForm>
    <!-- <form action="/login/password"
      method="post">
      <section>
        <label for="username">Username</label>
        <input id="username"
          name="username"
          type="text"
          autocomplete="username"
          required
          autofocus>
      </section>
      <section>
        <label for="current-password">Password</label>
        <input id="current-password"
          name="password"
          type="password"
          autocomplete="current-password"
          required>
      </section>
      <VaButton type="submit">Sign In </VaButton> -->
    <!-- <button type="submit">Sign in</button> -->
    <!-- </form> -->
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
</style>
