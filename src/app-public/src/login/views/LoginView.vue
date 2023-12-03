<template>
  <main>
    <h1>Sign in</h1>
    <form action="/login/password" method="post">
      <section>
        <label for="username">Username</label>
        <input id="username" name="username" type="text" autocomplete="username" required autofocus>
      </section>
      <section>
        <label for="current-password">Password</label>
        <input id="current-password" name="password" type="password" autocomplete="current-password" required>
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
