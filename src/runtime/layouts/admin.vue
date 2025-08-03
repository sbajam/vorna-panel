<template>
  <div
    class="wrapper bg-[#EFEFF4] flex overflow-hidden h-screen rtl justify-between  flex-nowrap"
  >
    <Sidebar class="  w-[80%] md:w-[15%] lg:w-3/12" />
    <main class="w-full md:px-8 xl:px-12 md:py-12 h-full overflow-x-hidden overflow-y-auto flex  items-center flex-col p-2">
      <slot name="main" />
    </main>
  </div>
</template>
