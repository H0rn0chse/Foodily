<template>
  <main style="height: 100%;">
    <div style="display: flex; align-items: center;">
      <img src="@/assets/notFound.png"
        style="max-width: 20rem;">
      <!-- <VaImage src=" /src/public/assets/image.png"></VaImage> -->
      <h1>Could not find the requested resource</h1>
    </div>
    <VaButton>
      <a href="/">Back to Home</a>
    </VaButton>
  </main>
</template>

<style scoped>
h1 {
  font-size: xx-large;
  padding-left: 2rem;
}

img {
  padding-bottom: 2rem;
}

a {
  color: unset;
}
</style>
