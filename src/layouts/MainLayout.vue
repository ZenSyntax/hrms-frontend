<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside 
      :width="sidebarCollapsed ? '64px' : '200px'" 
      :class="['sidebar', { 'show': !sidebarCollapsed && isMobile }]"
    >
      <div class="logo" @click="goToHome">
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
        <el-sub-menu index="home">
          <template #title>
            <el-icon><House /></el-icon>
            <span>数据看板</span>
          </template>
          <el-menu-item index="/statistics/overview">
            <el-icon><TrendCharts /></el-icon>
            <span>总览统计</span>
          </el-menu-item>
          <el-menu-item index="/statistics/employee">
            <el-icon><DataAnalysis /></el-icon>
            <span>员工统计</span>
          </el-menu-item>
          <el-menu-item index="/statistics/salary">
            <el-icon><PieChart /></el-icon>
            <span>薪资统计</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/employee/list">
          <el-icon><User /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
        
        <el-menu-item index="/job/list">
          <el-icon><Briefcase /></el-icon>
          <span>岗位管理</span>
        </el-menu-item>
        
        <el-menu-item index="/training/lesson">
          <el-icon><Reading /></el-icon>
          <span>培训管理</span>
        </el-menu-item>
        
        <el-menu-item index="/training/trainee">
          <el-icon><UserFilled /></el-icon>
          <span>学员管理</span>
        </el-menu-item>
        
        <el-menu-item index="/salary/list">
          <el-icon><Money /></el-icon>
          <span>薪资管理</span>
        </el-menu-item>
        
        <el-sub-menu v-if="authStore.hasAdminAccess" index="advanced">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>高级管理</span>
          </template>
          <el-menu-item index="/department/list">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item index="/system/payment">
            <el-icon><Money /></el-icon>
            <span>收支管理</span>
          </el-menu-item>
          <el-menu-item index="/system/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/log">
            <el-icon><Document /></el-icon>
            <span>系统日志</span>
          </el-menu-item>
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
          <div class="user-display">
            <span class="user-name">{{ authStore.user?.name || '用户' }}</span>
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><Avatar /></el-icon>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
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
  TrendCharts,
  Expand,
  Fold,
  Avatar,
  ArrowDown,
  Document,
  UserFilled,
  DataAnalysis,
  PieChart,
  Histogram,
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 移动端检测
const isMobile = ref(false)

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
  
  // 处理home页面 - 点击logo访问
  if (pathArray.length === 1 && pathArray[0] === 'home') {
    return [{
      name: '数据看板',
      path: '/home'
    }]
  }
  
  // 处理统计页面的路径 - 现在在数据看板子菜单下
  if (pathArray.length === 3 && pathArray[0] === 'statistics') {
    const statNameMap: Record<string, string> = {
      'employee': '员工统计',
      'salary': '薪资统计',
      'overview': '总览统计'
    }
    return [
      {
        name: '数据看板',
        path: '#'
      },
      {
        name: statNameMap[pathArray[2]] || pathArray[2],
        path: '/' + pathArray.join('/')
      }
    ]
  }
  
  // 处理高级管理页面的路径
  if (pathArray.length === 2 && pathArray[0] === 'department' && pathArray[1] === 'list') {
    return [
      {
        name: '高级管理',
        path: '#'
      },
      {
        name: '部门管理',
        path: '/department/list'
      }
    ]
  }
  
  if (pathArray.length === 3 && pathArray[0] === 'system') {
    const systemNameMap: Record<string, string> = {
      'log': '系统日志',
      'payment': '收支管理',
      'user': '用户管理'
    }
    return [
      {
        name: '高级管理',
        path: '#'
      },
      {
        name: systemNameMap[pathArray[2]] || pathArray[2],
        path: '/' + pathArray.join('/')
      }
    ]
  }
  
  // 处理培训管理页面 - 现在是独立菜单项
  if (pathArray.length === 2 && pathArray[0] === 'training' && pathArray[1] === 'lesson') {
    return [{
      name: '培训管理',
      path: '/training/lesson'
    }]
  }
  
  // 处理学员管理页面 - 现在是独立菜单项
  if (pathArray.length === 2 && pathArray[0] === 'training' && pathArray[1] === 'trainee') {
    return [{
      name: '学员管理',
      path: '/training/trainee'
    }]
  }
  
  // 处理独立菜单项
  const menuMap: Record<string, string> = {
    'employee': '员工管理',
    'job': '岗位管理',
    'salary': '薪资管理'
  }
  
  if (pathArray.length === 2 && pathArray[1] === 'list' && menuMap[pathArray[0]]) {
    return [{
      name: menuMap[pathArray[0]],
      path: '/' + pathArray.join('/')
    }]
  }
  
  // 处理添加页面
  if (pathArray.length === 2 && pathArray[1] === 'add') {
    const addPageMap: Record<string, string> = {
      'employee': '员工管理',
      'job': '岗位管理',
      'department': '部门管理',
      'salary': '薪资管理'
    }
    return [
      {
        name: addPageMap[pathArray[0]] || pathArray[0],
        path: '/' + pathArray[0] + '/list'
      },
      {
        name: '添加',
        path: '/' + pathArray.join('/')
      }
    ]
  }
  
  // 默认处理 - 使用路径映射显示中文名称
  const pathNameMap: Record<string, string> = {
    'statistics': '数据看板',
    'overview': '总览统计',
    'employee': '员工统计',
    'salary': '薪资统计',
    'system': '高级管理',
    'log': '系统日志',
    'payment': '收支管理',
    'user': '用户管理',
    'training': '培训管理',
    'lesson': '培训管理',
    'trainee': '学员管理',
    'job': '岗位管理',
    'list': '列表',
    'add': '添加'
  }
  
  return pathArray.map((path, index) => ({
    name: pathNameMap[path] || path,
    path: '/' + pathArray.slice(0, index + 1).join('/')
  }))
})

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const goToHome = () => {
  router.push('/home')
}

const handleCommand = (command: string) => {
  switch (command) {
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
  cursor: pointer;
  transition: background-color 0.3s;
}

.logo:hover {
  background-color: #FFCA42;
  color: #3A4148;
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

/* el-sub-menu 悬停时的背景色 - 使用更高优先级的选择器 */
.layout-container .sidebar .sidebar-menu.el-menu .el-sub-menu__title:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.layout-container .sidebar .sidebar-menu.el-menu .el-sub-menu__title:hover .el-icon {
  color: #4A5259 !important;
}

.layout-container .sidebar .sidebar-menu.el-menu .el-sub-menu__title:hover span {
  color: #4A5259 !important;
}

/* 使用深度选择器确保覆盖Element Plus默认样式 */
.layout-container .sidebar :deep(.el-sub-menu__title:hover) {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.layout-container .sidebar :deep(.el-sub-menu__title:hover .el-icon) {
  color: #4A5259 !important;
}

.layout-container .sidebar :deep(.el-sub-menu__title:hover span) {
  color: #4A5259 !important;
}

/* 更具体的选择器 - 针对数据看板和高级管理父菜单 */
.el-container .el-aside .sidebar .sidebar-menu .el-sub-menu .el-sub-menu__title:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.el-container .el-aside .sidebar .sidebar-menu .el-sub-menu .el-sub-menu__title:hover .el-icon {
  color: #4A5259 !important;
}

.el-container .el-aside .sidebar .sidebar-menu .el-sub-menu .el-sub-menu__title:hover span {
  color: #4A5259 !important;
}

/* 最高优先级选择器 - 确保覆盖所有Element Plus样式 */
.layout-container .el-aside.sidebar .sidebar-menu.el-menu .el-sub-menu .el-sub-menu__title:hover {
  background-color: #FFCA42 !important;
  color: #4A5259 !important;
}

.layout-container .el-aside.sidebar .sidebar-menu.el-menu .el-sub-menu .el-sub-menu__title:hover .el-icon {
  color: #4A5259 !important;
}

.layout-container .el-aside.sidebar .sidebar-menu.el-menu .el-sub-menu .el-sub-menu__title:hover span {
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

/* 面包屑导航样式 - 使用最高优先级的选择器 */
.el-container .el-header .el-breadcrumb {
  color: #FFCA42 !important;
}

.el-container .el-header .el-breadcrumb .el-breadcrumb__item .el-breadcrumb__inner {
  color: #FFCA42 !important;
  font-weight: bold !important;
}

.el-container .el-header .el-breadcrumb .el-breadcrumb__item .el-breadcrumb__inner:hover {
  color: #ffffff !important;
}

/* 面包屑分隔符颜色 - 使用最高优先级 */
.el-container .el-header .el-breadcrumb .el-breadcrumb__separator {
  color: #FFCA42 !important;
}

/* 使用深度选择器来覆盖 Element Plus 样式 */
.layout-container .header :deep(.el-breadcrumb__item .el-breadcrumb__inner) {
  color: #FFCA42 !important;
  font-weight: bold !important;
}

.layout-container .header :deep(.el-breadcrumb__separator) {
  color: #FFCA42 !important;
}

/* 更具体的选择器 */
.layout-container .header .el-breadcrumb .el-breadcrumb__item .el-breadcrumb__inner {
  color: #FFCA42 !important;
  font-weight: bold !important;
}

.layout-container .header .el-breadcrumb .el-breadcrumb__separator {
  color: #FFCA42 !important;
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


.user-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  color: #FFCA42;
  font-weight: bold;
  font-size: 14px;
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
