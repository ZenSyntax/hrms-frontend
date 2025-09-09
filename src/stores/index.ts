import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getStoredToken())
  
  const isLoggedIn = computed(() => !!token.value && token.value !== 'null' && token.value !== 'undefined')
  
  // 检查用户是否有高级管理权限
  const hasAdminAccess = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'leader'
  })
  
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
    hasAdminAccess,
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

// 数据刷新事件管理
export const useDataRefreshStore = defineStore('dataRefresh', () => {
  const refreshTrigger = ref(0)
  
  // 触发数据刷新
  const triggerRefresh = () => {
    refreshTrigger.value++
    console.log('数据刷新事件已触发，当前计数:', refreshTrigger.value)
  }
  
  // 获取当前刷新计数
  const getRefreshCount = () => {
    return refreshTrigger.value
  }
  
  return {
    refreshTrigger,
    triggerRefresh,
    getRefreshCount
  }
})