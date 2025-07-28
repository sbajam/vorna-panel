<script setup lang="ts">
import {
  definePageMeta,
  ref,
  useCookie,
  useNuxtApp,
  useRoute,
  navigateTo,
} from "#imports";
import { useUserStore } from "../stores/user";
const config = useRuntimeConfig().public.vornaPanel;

definePageMeta({ auth: false });

const { $notify } = useNuxtApp();
const username = ref("");
const password = ref("");
const { pending, error, data, request } = useApi();
const adminCookie = useCookie("token");
const route = useRoute();
const userStore = useUserStore();

const redirectTo = (route.query.redirect as string) || "/";
const passwordShow = ref(false);

const login = async () => {
  try {
    const res = await request("/login", {
      method: "post",
      data: {
        username: username.value.trim(),
        password: password.value.trim(),
      },
      headers: { "Cache-Control": "no-cache" },
    });

    $notify(res.message, res.status ? "success" : "danger");

    if (res.status && res.token) {
      document.cookie = `token=${res.token}; path=/;`;

      // const permRes = await request(`/api/user-permissions?role=${res.roles || "guest"}`, {
      //   method: "get",
      //   headers: { "Cache-Control": "no-cache" },
      //   baseUrl:' '
      // });
      userStore.setUser(res.token, res.roles || "superAdmin" ); //defautl Role
      userStore.setUsername(username.value.trim());

      // فقط اگر روی صفحه login هستی، redirect کن
      if (route.path === "/login") {
        navigateTo(redirectTo);
      }
    }
  } catch (e) {
    console.error("Login failed:", e);
  }
};
</script>

<template>
  <main
    class="bg-[#EFEFF4] rtl flex justify-center items-center h-screen overflow-hidden w-full"
  >
    <section class="box !w-11/12 md:!w-6/12">
      <a href="#" class="mx-auto mb-10 block w-[fit-content]">
        <img
          :src="config.logo"
          :alt="config.name"
          class="logo-image block mb-10 h-32 max-w-[10rem] object-contain"
        />
      </a>
      <h1 class="text-2xl text-primary-100 text-center font-bold mb-12">
        پنل مدیریتی {{ config.name }}
      </h1>

      <div class="input-div">
        <label>نام کاربری :</label>
        <input v-model="username" type="text" />
      </div>

      <div class="input-div">
        <label>رمز عبور :</label>
        <input v-model="password" :type="passwordShow ? 'text' : 'password'" />
        <Icon
          @click="passwordShow = !passwordShow"
          class="absolute left-8 text-gray-300 cursor-pointer"
          :name="passwordShow ? 'mdi:eye-off' : 'mdi:eye'"
        />
      </div>

      <div class="text-left">
        <Spinner v-if="pending" height="8vh" class="!h-[8vh]" size="2rem" />
        <button
          v-else
          @click="login()"
          class="bg-primary-100 rounded-lg text-lg px-8 py-2 ml-10 mt-10 text-white"
        >
          ورود
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.input-div {
  @apply relative flex items-center gap-3 w-full mb-6;

  label {
    @apply text-primary-100 text-lg text-right whitespace-nowrap font-semibold w-4/12;
  }

  input,
  .ProseMirror {
    @apply outline-0 px-4 py-2 border-2 border-solid border-gray-100 rounded-lg w-full focus:border-secondary-100;
  }
}
</style>
