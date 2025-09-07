<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <div class="forbidden-icon">
        <el-icon size="120" color="#f56c6c">
          <Lock />
        </el-icon>
      </div>
      
      <div class="forbidden-text">
        <h1 class="forbidden-title">访问被拒绝</h1>
        <p class="forbidden-description">
          抱歉，您没有权限访问此页面。此功能仅限管理员和领导使用。
        </p>
        <p class="forbidden-suggestion">
          如需访问此功能，请联系系统管理员获取相应权限。
        </p>
      </div>
      
      <div class="forbidden-actions">
        <el-button type="primary" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
        <el-button @click="goHome">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Lock, ArrowLeft, House } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.forbidden-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.forbidden-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.forbidden-icon {
  margin-bottom: 30px;
}

.forbidden-text {
  margin-bottom: 40px;
}

.forbidden-title {
  font-size: 32px;
  font-weight: bold;
  color: #f56c6c;
  margin: 0 0 20px 0;
}

.forbidden-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 15px 0;
}

.forbidden-suggestion {
  font-size: 14px;
  color: #999;
  line-height: 1.5;
  margin: 0;
}

.forbidden-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.forbidden-actions .el-button {
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .forbidden-container {
    min-height: 50vh;
    padding: 10px;
  }
  
  .forbidden-content {
    padding: 30px 20px;
  }
  
  .forbidden-title {
    font-size: 24px;
  }
  
  .forbidden-description {
    font-size: 14px;
  }
  
  .forbidden-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .forbidden-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
