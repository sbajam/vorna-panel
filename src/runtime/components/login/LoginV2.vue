<script setup>
import { ref } from "#imports";
import { useNuxtApp } from "nuxt/app";
import { useUserStore } from "../../stores/user";

const username = ref("");
const password = ref("");
const userStore = useUserStore();
const route = useRoute();
const config = useRuntimeConfig().public.vornaPanel;
const { pending,request, data } = useApi();
const { $notifySuccess, $notifyDanger } = useNuxtApp();
const adminCookie = useCookie("token");

const redirectTo = (route.query.redirect) || "/";

async function getFingerprint() {
  const key = "fp_hash_v1";
  const saved = localStorage.getItem(key);
  if (saved) return saved;
  const raw =
    navigator.userAgent +
    "|" +
    screen.width +
    "x" +
    screen.height +
    "|" +
    crypto.getRandomValues(new Uint32Array(1))[0];
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw)
  );
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  localStorage.setItem(key, hash);
  return hash;
}

const login = async () => {
  try {
    const fingerprintHash = await getFingerprint();

    // توجه: به روت سروری می‌زنیم، نه مستقیم بک‌اند
    await request("/api/auth/login", {
      baseUrl:'../../',
      method: "POST",
      data: { username, password, fingerprintHash },
    });
    let res = data.value;

    if (!res?.status || !res?.accessToken) {
      $notifyDanger(res?.message || "ورود ناموفق");
      return;
    } 
     document.cookie = `token=${res.accessToken}; path=/;`;
    // فقط اکسس‌توکن رو در حافظه نگه‌دار
    userStore.setUser(res.accessToken, res.roles || "company");
    userStore.setUsername(username.value.trim());

    $notifySuccess("ورود موفق", "success");
    if (route.path === "/login") navigateTo(redirectTo);
  } catch (e) {
    console.error("login error", e);
    $notifyDanger("مشکلی رخ داد");
  }
};

const login2 = async () => {
  try {
    const fingerprintHash = await getFingerprint();

    // توجه: طبق باگ بک‌اند، ایمیل/یوزرنیم باید در فیلد phoneNumber بره
    const res = await request("/api/auth/login", {
      method: "POST",
      body: {
        username: username.value.trim(), // اگر بک‌اند می‌خواد phoneNumber، composable در بک تبدیل کن یا همینجا phoneNumber بذار
        password: password.value.trim(),
        fingerprintHash,
      },
    });

    if (!res?.status || !res?.accessToken) {
      $notify(res?.message || "ورود ناموفق", "danger");
      return;
    }

    // فقط اکسس‌توکن رو در حافظه نگه‌دار
    userStore.setUser(res.accessToken, res.roles || "company");
    userStore.setUsername(username.value.trim());

    $notify("ورود موفق", "success");
    if (route.path === "/login") navigateTo(redirectTo);
  } catch (e) {
    console.error("Login failed:", e);
    $notify("مشکلی رخ داد", "danger");
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

      <InputField
        v-model="username"
        type="text"
        label="نام کاربری"
        label-position="right"
        class="mb-4"
      />
      <InputField
        v-model="password"
        type="password"
        label="رمز عبور"
        label-position="right"
        :passwordOptions="false"
      />

      <Button
        color="secondary-100"
        rounded="xl"
        size="md"
        class="my-10"
        :pending="pending"
        @click="login()"
        :full-width="true"
      >
        ورود
      </Button>
    </section>
  </main>
</template>
