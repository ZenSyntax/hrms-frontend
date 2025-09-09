<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>人力资源管理系统</h2>
        <p>Human Resource Management System</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="name">
          <el-input
            v-model="loginForm.name"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            登录
          </el-button>
        </el-form-item>
        
        <!-- 测试按钮 -->
        <el-form-item>
          <el-button
            type="success"
            size="large"
            @click="testAdminLogin"
            class="test-btn"
          >
            测试Admin登录 (admin/88888888)
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="warning"
            size="large"
            @click="testLeaderLogin"
            class="test-btn"
          >
            测试Leader登录 (leader/88888888)
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="info"
            size="large"
            @click="testUserLogin"
            class="test-btn"
          >
            测试普通用户登录 (testuser/88888888)
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores'
import type { LoginRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 根据用户名获取角色
const getRoleByUsername = (username: string): string => {
  if (username === 'admin') return 'admin'
  if (username === 'leader') return 'leader'
  return 'user'
}

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginRequest>({
  name: '',
  password: ''
})

const loginRules: FormRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await authApi.login(loginForm)
    
    if (response.code === 0) {
      // 从响应中获取用户数据
      const userData = response.data?.user || {
        id: 1,
        name: loginForm.name,
        password: '',
        worker: undefined,
        role: getRoleByUsername(loginForm.name) // 根据用户名设置角色
      }
      
      // 从响应中获取token，根据实际后端格式调整
      // 后端返回格式: { code: 0, message: "登录成功", data: "<token-value>" }
      let token = null
      
      console.log('Login response data type:', typeof response.data)
      console.log('Login response data:', response.data)
      
      // 如果data是字符串，直接使用
      if (typeof response.data === 'string') {
        token = response.data
        console.log('Token extracted from string data:', token)
      }
      // 如果data是对象，尝试多个可能的字段名
      else if (typeof response.data === 'object' && response.data !== null) {
        token = response.data?.token || response.data?.accessToken || response.data?.access_token
        console.log('Token extracted from object data:', token)
      }
      
      if (!token) {
        ElMessage.error('登录失败：服务器未返回有效的认证令牌')
        console.error('Login response missing token:', response)
        return
      }
      
      // 确保token不是默认值
      if (token === 'default-token' || token === 'Default-Token') {
        ElMessage.error('登录失败：收到无效的认证令牌')
        console.error('Invalid token received:', token)
        return
      }
      
      ElMessage.success('登录成功')
      try {
        authStore.login(userData, token)
        router.push('/home')
      } catch (storeError: any) {
        ElMessage.error(storeError.message || '登录状态保存失败')
        console.error('Store login error:', storeError)
      }
    } else {
      ElMessage.error(response.message || '登录失败')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    // 更详细的错误处理
    if (error.response) {
      // 服务器响应了错误状态码
      const errorMessage = error.response.data?.message || `服务器错误: ${error.response.status}`
      ElMessage.error(errorMessage)
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      ElMessage.error('登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 测试admin登录
const testAdminLogin = () => {
  loginForm.name = 'admin'
  loginForm.password = '88888888'
  handleLogin()
}

// 测试leader登录
const testLeaderLogin = () => {
  loginForm.name = 'leader'
  loginForm.password = '88888888'
  handleLogin()
}

// 测试普通用户登录
const testUserLogin = () => {
  loginForm.name = 'testuser'
  loginForm.password = '88888888'
  handleLogin()
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: #FFFEFA;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 0 1px rgba(255, 202, 66, 0.1),
    0 8px 32px rgba(74, 82, 89, 0.12),
    0 16px 64px rgba(74, 82, 89, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,202,66,0.08)"/><circle cx="75" cy="75" r="1" fill="rgba(255,202,66,0.08)"/><circle cx="50" cy="10" r="0.5" fill="rgba(74,82,89,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(74,82,89,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(74,82,89,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.4;
  pointer-events: none;
  animation: grainMove 20s linear infinite;
}

.login-container::after {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 202, 66, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(74, 82, 89, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(255, 202, 66, 0.08) 0%, transparent 50%);
  animation: float 15s ease-in-out infinite;
  pointer-events: none;
}

.login-box {
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(74, 82, 89, 0.12);
  border: 1px solid rgba(255, 202, 66, 0.15);
  padding: 40px;
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.8s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #4A5259;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(74, 82, 89, 0.1);
  background: linear-gradient(45deg, #4A5259, #6B7280);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  color: #8B8B8B;
  font-size: 14px;
  font-weight: 300;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(74, 82, 89, 0.1);
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  background: linear-gradient(135deg, #FFCA42, #FFB800);
  border-color: #FFCA42;
  color: #4A5259;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(135deg, #FFB800, #FFA500);
  border-color: #FFB800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 202, 66, 0.3);
}

.test-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  margin-top: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 82, 89, 0.15);
}

:deep(.el-input__wrapper) {
  height: 45px;
  border-radius: 12px;
  border: 1px solid rgba(74, 82, 89, 0.2);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 202, 66, 0.4);
  box-shadow: 0 2px 8px rgba(255, 202, 66, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #FFCA42;
  box-shadow: 0 0 0 2px rgba(255, 202, 66, 0.2);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 移动端自适应样式 */
@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }
  
  .login-box {
    width: 100%;
    max-width: 400px;
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 20px;
  }
  
  .login-header p {
    font-size: 12px;
  }
  
  .login-btn {
    height: 40px;
    font-size: 14px;
  }
  
  :deep(.el-input__wrapper) {
    height: 40px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-box {
    padding: 20px 15px;
  }
  
  .login-header h2 {
    font-size: 18px;
  }
  
  .login-header p {
    font-size: 11px;
  }
  
  .login-btn {
    height: 35px;
    font-size: 13px;
  }
  
  :deep(.el-input__wrapper) {
    height: 35px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 15px;
  }
}

/* 动画关键帧 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes grainMove {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-2px, -2px);
  }
  50% {
    transform: translate(2px, -2px);
  }
  75% {
    transform: translate(-2px, 2px);
  }
  100% {
    transform: translate(0, 0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}
</style>
