<template>
  <div>
    <TopBar />
    <div class="flex">
      <Sidebar />
      <main class="flex-1 container-bleed py-10">
        <slot />
      </main>
    </div>
  </div>
</template>
