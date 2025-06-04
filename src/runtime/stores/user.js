// stores/user.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    username: null  // در شروع خالی است
  }),
  actions: {
    setUsername(name) {
      this.username = name;
    },
    clear() {
      this.username = null;
    }
  }
});
