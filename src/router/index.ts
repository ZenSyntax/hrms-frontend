import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/home'
        },
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/HomeView.vue')
        },
        // 员工管理
        {
          path: 'employee/list',
          name: 'employee-list',
          component: () => import('@/views/employee/EmployeeListView.vue')
        },
        {
          path: 'employee/add',
          name: 'employee-add',
          component: () => import('@/views/employee/EmployeeAddView.vue')
        },
        // 岗位管理
        {
          path: 'job/list',
          name: 'job-list',
          component: () => import('@/views/job/JobListView.vue')
        },
        {
          path: 'job/add',
          name: 'job-add',
          component: () => import('@/views/job/JobAddView.vue')
        },
        // 部门管理
        {
          path: 'department/list',
          name: 'department-list',
          component: () => import('@/views/department/DepartmentListView.vue')
        },
        {
          path: 'department/add',
          name: 'department-add',
          component: () => import('@/views/department/DepartmentAddView.vue')
        },
        // 培训管理
        {
          path: 'training/lesson',
          name: 'training-lesson',
          component: () => import('@/views/training/LessonListView.vue')
        },
        {
          path: 'training/trainee',
          name: 'training-trainee',
          component: () => import('@/views/training/TraineeListView.vue')
        },
        // 薪资管理
        {
          path: 'salary/list',
          name: 'salary-list',
          component: () => import('@/views/salary/SalaryListView.vue')
        },
        {
          path: 'salary/add',
          name: 'salary-add',
          component: () => import('@/views/salary/SalaryAddView.vue')
        },
        // 系统管理
        {
          path: 'system/user',
          name: 'system-user',
          component: () => import('@/views/system/UserListView.vue')
        },
        {
          path: 'system/log',
          name: 'system-log',
          component: () => import('@/views/system/LogListView.vue')
        },
        {
          path: 'system/payment',
          name: 'system-payment',
          component: () => import('@/views/system/PaymentListView.vue')
        },
        // 数据统计
        {
          path: 'statistics/overview',
          name: 'statistics-overview',
          component: () => import('@/views/statistics/OverviewView.vue')
        },
        {
          path: 'statistics/employee',
          name: 'statistics-employee',
          component: () => import('@/views/statistics/EmployeeStatisticsView.vue')
        },
        {
          path: 'statistics/salary',
          name: 'statistics-salary',
          component: () => import('@/views/statistics/SalaryStatisticsView.vue')
        },
        // 禁止访问页面
        {
          path: 'forbidden',
          name: 'forbidden',
          component: () => import('@/views/ForbiddenView.vue')
        }
      ]
    }
  ]
})

// 需要高级管理权限的路由
const adminRoutes = [
  '/department/list',
  '/system/payment',
  '/system/user',
  '/system/log'
]

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth === false) {
    next()
  } else if (authStore.isLoggedIn) {
    // 检查是否需要高级管理权限
    if (adminRoutes.includes(to.path) && !authStore.hasAdminAccess) {
      next('/forbidden')
    } else {
      next()
    }
  } else {
    next('/login')
  }
})

export default router