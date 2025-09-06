import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getStoredToken())
  
  const isLoggedIn = computed(() => !!token.value && token.value !== 'null' && token.value !== 'undefined')
  
  // 获取存储的token
  function getStoredToken(): string | null {
    try {
      const storedToken = localStorage.getItem('token')
      // 检查token是否有效（不是null、undefined、空字符串或默认值）
      if (storedToken && 
          storedToken !== 'null' && 
          storedToken !== 'undefined' && 
          storedToken !== '' &&
          storedToken !== 'default-token' &&
          storedToken !== 'Default-Token') {
        return storedToken
      }
      return null
    } catch (error) {
      console.error('Error getting stored token:', error)
      return null
    }
  }
  
  const login = (userData: User, authToken: string) => {
    try {
      // 验证token是否有效
      if (!authToken || 
          authToken === 'null' || 
          authToken === 'undefined' || 
          authToken === '' ||
          authToken === 'default-token' ||
          authToken === 'Default-Token') {
        console.error('Invalid token provided:', authToken)
        throw new Error('无效的认证令牌')
      }
      
      user.value = userData
      token.value = authToken
      localStorage.setItem('token', authToken)
      console.log('Token saved successfully:', authToken)
    } catch (error) {
      console.error('Error saving token:', error)
      // 清除可能已设置的值
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      throw error
    }
  }
  
  const logout = () => {
    try {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      console.log('Token removed successfully')
    } catch (error) {
      console.error('Error removing token:', error)
    }
  }
  
  return {
    user,
    token,
    isLoggedIn,
    login,
    logout
  }
})

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  const setLoading = (status: boolean) => {
    loading.value = status
  }
  
  return {
    sidebarCollapsed,
    loading,
    toggleSidebar,
    setLoading
  }
})
