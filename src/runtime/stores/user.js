// runtime/stores/user.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: "",
    roles: [],
    permissions: [], // لیست دسترسی‌های کاربر
    username: null, // در شروع خالی است
  }),
  actions: {
    setUsername(name) {
      this.username = name;
    },
    clear() {
      this.username = null;
      this.permissions = [];
    },
    setUser(token, roles, permissions = []) {
      this.token = token;
      this.roles = roles;
      this.permissions = permissions;
    },
    clearUser() {
      this.token = "";
      this.roles = [];
      this.permissions = [];
    },
    // اضافه کردن permission های جدید
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    // چک کردن اینکه آیا کاربر permission خاصی را دارد
    hasPermission(permissionKey) {
      return this.permissions.includes(permissionKey);
    },
    // چک کردن دسترسی به یک route
    hasRoutePermission(route) {
      // از route یک key منطقی بساز (مثلاً /roles → roles.view)
      const segments = route.split("/").filter(Boolean);
      const module = segments[0] || "root";
      const key = `${module}.view`;

      return this.hasPermission(key);
    },
  },
});
