<template>
  <div class="min-h-screen bg-[color:var(--bg)]">
    <TopBar />
    <div class="flex">
      <Sidebar />
      <main class="flex-1">
        <div class="container-bleed py-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
