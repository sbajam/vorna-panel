// src/runtime/plugins/notifications.js
import Swal from "sweetalert2";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  // از کلید درست بخوانید
  const cfg = useRuntimeConfig().public.vornaPanel.notifications || {};
  const mode = cfg || "toast";

  function notify(message, status = "info") {
    if (mode === "toast") {
      // tailvue/nuxt toast
      nuxtApp.$toast.show({
        type: status === "danger" ? "danger" : status,
        message,
      });
    } else {
      // sweetalert2
      Swal.fire({
        icon: status === "danger" ? "error" : status,
        text: message,
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }
  function showToast(obj) {
    nuxtApp.$toast.show(obj);
  }
  // اینجا فقط کافیست return کنید
  function showSwal(obj) {
    return Swal.fire(obj);
  }


  // expose helpers
  nuxtApp.provide("notify", notify);
  nuxtApp.provide("notifyInfo", (msg) => notify(msg, "info"));
  nuxtApp.provide("notifySuccess", (msg) => notify(msg, "success"));
  nuxtApp.provide("notifyWarning", (msg) => notify(msg, "warning"));
  nuxtApp.provide("notifyDanger", (msg) => notify(msg, "danger"));
  // ۴) exposeکردن API اصلی
  nuxtApp.provide("showSwal", (obj)=> showSwal(obj)); // حالا useNuxtApp().$swal در دسترس است
  nuxtApp.provide("showToast", (obj) => showToast(obj)); // و useNuxtApp().$toast هم
});
