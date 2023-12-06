<script setup lang="ts">
// import { useForm } from "vuestic-ui";
// import { useI18n } from "vue-i18n";
import { reactive } from "vue";
// const { t } = useI18n();

// const form = reactive({
//   login: "",
//   password: "",
// });

// const { errorMessagesNamed } = useForm("myForm");
</script>

<template>
  <main>
    <h1>Sign in</h1>
    <!-- <VaForm ref="myForm"
      immediate
      hide-error-messages
      class="flex flex-col gap-2 mb-2">
      <VaInput v-model="form.login"
        label="Login"
        name="Login"
        :rules="[(v) => Boolean(v) || 'Login is required']" />
      <VaInput v-model="form.password"
        label="Password"
        type="password"
        name="Password"
        :rules="[
          (v) => Boolean(v) || 'Password is required',
          (v) => v.length > 6 || 'Password must be a least 6 symbols',
        ]" />
    </VaForm> -->
    <form action="/login/password"
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
      <VaButton type="submit">Sign In </VaButton>
      <!-- <button type="submit">Sign in</button> -->
    </form>
  </main>
</template>

<style scoped>
h1 {
  font-size: xx-large;
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
