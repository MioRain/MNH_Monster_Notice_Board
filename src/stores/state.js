import { ref } from "vue"
import { defineStore } from "pinia"

export const useStateStore = defineStore('state', () => {
  const loadingStyle = ref(false)
  const filterMode = ref(false)

  return { loadingStyle, filterMode }
})