<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎使用人力资源管理系统</h1>
        <p class="welcome-subtitle">Human Resource Management System</p>
        <div class="welcome-info">
          <el-card class="info-card" shadow="hover">
            <div class="info-item">
              <el-icon class="info-icon"><User /></el-icon>
              <div class="info-text">
                <span class="info-label">当前用户</span>
                <span class="info-value">{{ currentUser }}</span>
              </div>
            </div>
          </el-card>
          <el-card class="info-card" shadow="hover">
            <div class="info-item">
              <el-icon class="info-icon"><Calendar /></el-icon>
              <div class="info-text">
                <span class="info-label">登录时间</span>
                <span class="info-value">{{ loginTime }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 部门结构图区域 -->
    <div class="chart-section">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="chart-header">
            <h2 class="chart-title">
              <el-icon><OfficeBuilding /></el-icon>
              公司组织架构
            </h2>
            <div class="chart-controls">
              <el-button 
                type="primary" 
                :icon="isExpanded ? 'ArrowUp' : 'ArrowDown'"
                @click="toggleExpand"
                size="small"
              >
                {{ isExpanded ? '收起' : '展开' }}
              </el-button>
              <el-button 
                type="default" 
                icon="Refresh"
                @click="refreshChart"
                size="small"
                :loading="loading"
              >
                刷新
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="chart-container" v-loading="loading">
          <OrganizationTree 
            v-if="treeData"
            :data="treeData"
            @node-click="onNodeClick"
            @node-hover="onNodeHover"
          />
          <div v-else class="no-data">
            <el-empty description="暂无部门数据" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import OrganizationTree from '@/components/OrganizationTree.vue'
import { departmentApi, workerApi } from '@/api'
import type { Department } from '@/types'
import { User, Calendar, OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores'

// 响应式数据
const loading = ref(false)
const departments = ref<Department[]>([])
const supervisors = ref<Map<number, string>>(new Map())
const isExpanded = ref(true)

// 获取auth store
const authStore = useAuthStore()

// 计算属性
const currentUser = computed(() => {
  return authStore.user?.name || '管理员'
})

const loginTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 树状图数据
const treeData = computed(() => {
  if (departments.value.length === 0) {
    return null
  }
  return buildTreeData()
})

// 构建树形数据
const buildTreeData = () => {
  const deptMap = new Map<number, Department>()
  const childrenMap = new Map<number, Department[]>()
  
  // 建立部门映射和子部门关系
  departments.value.forEach(dept => {
    deptMap.set(dept.id, dept)
    if (!childrenMap.has(dept.uperId)) {
      childrenMap.set(dept.uperId, [])
    }
    childrenMap.get(dept.uperId)!.push(dept)
  })
  
  // 找到根部门（uperId为0的部门）
  const rootDepts = departments.value.filter(dept => dept.uperId === 0)
  if (rootDepts.length === 0) {
    return { name: '暂无数据', children: [] }
  }
  
  // 构建树形结构
  const buildNode = (dept: Department, level: number = 0): any => {
    const supervisorName = supervisors.value.get(dept.supervisor) || ''
    const children = childrenMap.get(dept.id) || []
    
    const node: any = {
      id: dept.id.toString(),
      name: dept.name,
      description: supervisorName ? `主管：${supervisorName}` : undefined,
      level,
      children: children.map(child => buildNode(child, level + 1))
    }
    
    if (node.children.length === 0) {
      delete node.children
    }
    
    return node
  }
  
  // 如果有多个根部门，创建一个虚拟根节点
  if (rootDepts.length > 1) {
    return {
      id: 'root',
      name: '公司总部',
      description: '企业组织架构',
      level: 0,
      children: rootDepts.map(dept => buildNode(dept, 1))
    }
  }
  
  return buildNode(rootDepts[0], 0)
}

// 获取部门数据
const fetchDepartments = async () => {
  try {
    loading.value = true
    const response = await departmentApi.getAll()
    
    if (response.code === 0) {
      departments.value = response.data || []
      
      // 获取所有主管信息
      await fetchSupervisors()
    } else {
      ElMessage.error('获取部门数据失败：' + response.message)
    }
  } catch (error) {
    console.error('获取部门数据失败:', error)
    ElMessage.error('获取部门数据失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 获取主管信息
const fetchSupervisors = async () => {
  const supervisorIds = new Set<number>()
  
  departments.value.forEach(dept => {
    if (dept.supervisor && dept.supervisor > 0) {
      supervisorIds.add(dept.supervisor)
    }
  })
  
  // 并发获取所有主管信息
  const promises = Array.from(supervisorIds).map(async (id) => {
    try {
      const response = await workerApi.getExact(id)
      if (response.code === 0 && response.data) {
        supervisors.value.set(id, response.data.name)
      }
    } catch (error) {
      console.warn(`获取主管信息失败 (ID: ${id}):`, error)
    }
  })
  
  await Promise.all(promises)
}

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 刷新图表
const refreshChart = () => {
  fetchDepartments()
}

// 节点点击事件
const onNodeClick = (node: any) => {
  ElMessage.info(`点击了部门：${node.name}`)
}

// 节点悬停事件
const onNodeHover = (node: any, hovered: boolean) => {
  // 可以在这里添加悬停时的逻辑
  console.log(`节点 ${node.name} ${hovered ? '悬停' : '离开'}`)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchDepartments()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #FFFEFA;
  padding: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 0 1px rgba(255, 202, 66, 0.1),
    0 8px 32px rgba(74, 82, 89, 0.12),
    0 16px 64px rgba(74, 82, 89, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin: 8px;
}

.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,202,66,0.08)"/><circle cx="75" cy="75" r="1" fill="rgba(255,202,66,0.08)"/><circle cx="50" cy="10" r="0.5" fill="rgba(74,82,89,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(74,82,89,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(74,82,89,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.4;
  pointer-events: none;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-content {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4A5259;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(74, 82, 89, 0.1);
  background: linear-gradient(45deg, #4A5259, #6B7280);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #8B8B8B;
  margin-bottom: 30px;
  font-weight: 300;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(74, 82, 89, 0.1);
}

.welcome-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.info-card {
  min-width: 200px;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 202, 66, 0.2);
  box-shadow: 0 4px 20px rgba(74, 82, 89, 0.08);
}

.info-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(74, 82, 89, 0.15);
  border-color: rgba(255, 202, 66, 0.4);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  font-size: 24px;
  color: #FFCA42;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #8B8B8B;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #4A5259;
  font-weight: 600;
}

.chart-section {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.chart-card {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(74, 82, 89, 0.12);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 202, 66, 0.15);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  background: linear-gradient(90deg, rgba(255, 202, 66, 0.05), rgba(255, 202, 66, 0.02));
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #4A5259;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

/* 自定义按钮样式 */
.chart-controls .el-button--primary {
  background: linear-gradient(135deg, #FFCA42, #FFB800);
  border-color: #FFCA42;
  color: #4A5259;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.chart-controls .el-button--primary:hover {
  background: linear-gradient(135deg, #FFB800, #FFA500);
  border-color: #FFB800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 202, 66, 0.3);
}

.chart-controls .el-button--default {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(74, 82, 89, 0.2);
  color: #4A5259;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.chart-controls .el-button--default:hover {
  background: rgba(255, 202, 66, 0.1);
  border-color: rgba(255, 202, 66, 0.3);
  color: #4A5259;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 82, 89, 0.15);
}

.chart-container {
  height: 600px;
  position: relative;
}

.org-chart {
  width: 100%;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .welcome-info {
    flex-direction: column;
    align-items: center;
  }
  
  .info-card {
    width: 100%;
    max-width: 300px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .chart-container {
    height: 500px;
  }
}

/* 自定义树状图容器样式 */
.chart-container {
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
  background: #FFFEFA;
  border: 1px solid rgba(255, 202, 66, 0.1);
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #FFFEFA;
  border-radius: 16px;
  border: 1px solid rgba(255, 202, 66, 0.1);
}

/* 动画效果 */
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

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.welcome-section {
  animation: fadeInUp 0.8s ease-out;
}

.chart-section {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

/* 添加微妙的闪烁效果 */
.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 202, 66, 0.1), transparent);
  transition: left 0.5s;
}

.info-card:hover::before {
  left: 100%;
}

/* 增强卡片悬停效果 */
.info-card {
  position: relative;
  overflow: hidden;
}

/* 添加渐变边框效果 */
.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 202, 66, 0.3), rgba(74, 82, 89, 0.1));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  pointer-events: none;
}
</style>
