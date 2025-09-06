<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside 
      :width="sidebarCollapsed ? '64px' : '200px'" 
      :class="['sidebar', { 'show': !sidebarCollapsed && isMobile }]"
    >
      <div class="logo">
        <h2 v-if="!sidebarCollapsed">HRMS</h2>
        <h2 v-else>H</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="employee">
          <template #title>
            <el-icon><User /></el-icon>
            <span>员工管理</span>
          </template>
          <el-menu-item index="/employee/list">员工列表</el-menu-item>
          <el-menu-item index="/employee/add">添加员工</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="job">
          <template #title>
            <el-icon><Briefcase /></el-icon>
            <span>岗位管理</span>
          </template>
          <el-menu-item index="/job/list">岗位列表</el-menu-item>
          <el-menu-item index="/job/add">添加岗位</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="department">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </template>
          <el-menu-item index="/department/list">部门列表</el-menu-item>
          <el-menu-item index="/department/add">添加部门</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="training">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>培训管理</span>
          </template>
          <el-menu-item index="/training/lesson">培训课程</el-menu-item>
          <el-menu-item index="/training/trainee">学员管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="salary">
          <template #title>
            <el-icon><Money /></el-icon>
            <span>薪资管理</span>
          </template>
          <el-menu-item index="/salary/list">薪资列表</el-menu-item>
          <el-menu-item index="/salary/add">添加薪资</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/log">系统日志</el-menu-item>
          <el-menu-item index="/system/payment">收支管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="statistics">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>数据统计</span>
          </template>
          <el-menu-item index="/statistics/overview">总览统计</el-menu-item>
          <el-menu-item index="/statistics/employee">员工统计</el-menu-item>
          <el-menu-item index="/statistics/salary">薪资统计</el-menu-item>
          <el-menu-item index="/statistics/department">部门统计</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button 
            type="text" 
            @click="toggleSidebar"
            class="collapse-btn"
          >
            <el-icon><Expand v-if="sidebarCollapsed" /><Fold v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="item in breadcrumbs" 
              :key="item.path"
              :to="item.path"
            >
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 调试信息 -->
          <div class="debug-info" v-if="showDebug">
            <span>Token: {{ authStore.token ? '已设置' : '未设置' }}</span>
            <span>用户: {{ authStore.user?.name || '未登录' }}</span>
          </div>
          
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><Avatar /></el-icon>
              {{ authStore.user?.name || '用户' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="debug">切换调试信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, useAppStore } from '@/stores'
import { 
  House, 
  User, 
  Briefcase, 
  OfficeBuilding, 
  Reading, 
  Money, 
  Setting, 
  TrendCharts,
  Expand,
  Fold,
  Avatar,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 移动端检测
const isMobile = ref(false)
const showDebug = ref(false)

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

const activeMenu = computed(() => {
  return route.path
})

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(Boolean)
  const breadcrumbMap: Record<string, string> = {
    'dashboard': '仪表盘',
    'employee': '员工管理',
    'job': '岗位管理',
    'department': '部门管理',
    'training': '培训管理',
    'salary': '薪资管理',
    'system': '系统管理',
    'statistics': '数据统计',
    'list': '列表',
    'add': '添加',
    'lesson': '培训课程',
    'trainee': '学员管理',
    'user': '用户管理',
    'log': '系统日志',
    'payment': '收支管理',
    'overview': '总览统计'
  }
  
  return pathArray.map((path, index) => ({
    name: breadcrumbMap[path] || path,
    path: '/' + pathArray.slice(0, index + 1).join('/')
  }))
})

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人资料页面
      break
    case 'debug':
      showDebug.value = !showDebug.value
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar {
  background-color: #4A5259;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3A4148;
  color: #FFCA42;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.sidebar-menu {
  border: none;
  background-color: #4A5259;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title,
.sidebar-menu .el-menu-item span,
.sidebar-menu .el-sub-menu__title span {
  color: #FFCA42;
}

/* 图标颜色设置 */
.sidebar-menu .el-menu-item .el-icon,
.sidebar-menu .el-sub-menu__title .el-icon {
  color: #FFCA42;
}

/* 使用更高优先级的选择器覆盖Element Plus默认样式 */
.sidebar-menu.el-menu .el-menu-item:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.sidebar-menu.el-menu .el-menu-item:hover .el-icon {
  color: #4A5259 !important;
}

.sidebar-menu.el-menu .el-menu-item:hover span {
  color: #4A5259 !important;
}

/* el-sub-menu 悬停时的背景色 */
.sidebar-menu.el-menu .el-sub-menu__title:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.sidebar-menu.el-menu .el-sub-menu__title:hover .el-icon {
  color: #4A5259 !important;
}

.sidebar-menu.el-menu .el-sub-menu__title:hover span {
  color: #4A5259 !important;
}

/* 子菜单样式 */
.sidebar-menu .el-sub-menu .el-menu-item {
  background-color: #5A6269;
  color: #FFCA42;
}


.sidebar-menu .el-sub-menu .el-menu-item .el-icon {
  color: #FFCA42;
}

.sidebar-menu.el-menu .el-sub-menu .el-menu-item:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.sidebar-menu.el-menu .el-sub-menu .el-menu-item:hover .el-icon {
  color: #4A5259 !important;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background-color: #FFCA42;
  color: #4A5259 !important;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active .el-icon {
  color: #4A5259 !important;
}

/* 子菜单选中项悬停时保持选中样式 */
.sidebar-menu.el-menu .el-sub-menu .el-menu-item.is-active:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.sidebar-menu.el-menu .el-sub-menu .el-menu-item.is-active:hover .el-icon {
  color: #4A5259 !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #FFCA42;
  color: #4A5259 !important;
}

.sidebar-menu .el-menu-item.is-active .el-icon {
  color: #4A5259 !important;
}

/* 仪表盘选中时的字体颜色 */
.sidebar-menu .el-menu-item.is-active span {
  color: #4A5259 !important;
}

/* 选中项悬停时保持选中样式 */
.sidebar-menu.el-menu .el-menu-item.is-active:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.sidebar-menu.el-menu .el-menu-item.is-active:hover .el-icon {
  color: #4A5259 !important;
}

.header {
  background-color: #4a5259;
  border-bottom: 1px solid #3a4148;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

/* 面包屑导航样式 */
.header .el-breadcrumb {
  color: #FFCA42;
}

.header .el-breadcrumb__item .el-breadcrumb__inner {
  color: #FFCA42;
}

.header .el-breadcrumb__item .el-breadcrumb__inner:hover {
  color: #ffffff;
}

.collapse-btn {
  margin-right: 20px;
  font-size: 18px;
  color: #FFCA42;
}

.collapse-btn:hover {
  color: #ffffff;
}

.header-right {
  display: flex;
  align-items: center;
}

.debug-info {
  margin-right: 20px;
  font-size: 12px;
  color: #FFCA42;
}

.debug-info span {
  margin-right: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #FFCA42;
}

.user-info:hover {
  color: #ffffff;
}

.user-info .el-icon {
  margin: 0 5px;
}

.main-content {
  background-color: #f5f5f5;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 移动端自适应样式 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .header {
    padding: 0 10px;
  }
  
  .main-content {
    padding: 10px;
    margin-left: 0;
  }
  
  .logo h2 {
    font-size: 16px;
  }
  
  .sidebar-menu .el-menu-item,
  .sidebar-menu .el-sub-menu__title {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 5px;
  }
  
  .main-content {
    padding: 5px;
  }
  
  .logo h2 {
    font-size: 14px;
  }
  
  .sidebar-menu .el-menu-item,
  .sidebar-menu .el-sub-menu__title {
    font-size: 12px;
  }
}
</style>
