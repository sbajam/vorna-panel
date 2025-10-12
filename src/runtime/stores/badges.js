// /stores/badges.js
import { defineStore } from "pinia";

export const useBadges = defineStore("badges", {
  state: () => ({
    badges: {
      answers: 5,
    },
  }),
  actions: {
    setBadges(key, value) {
      this.badges[key] = value;
    },
    getBadges(key) {
      return this.badges[key];
    },
  },
});
