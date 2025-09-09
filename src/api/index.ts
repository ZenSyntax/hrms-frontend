import axios from 'axios'
import type { 
  ApiResponse, 
  PageResponse, 
  Worker, 
  Job, 
  Department, 
  Lesson, 
  Salary, 
  SalaryReviseVO,
  User, 
  Log, 
  Payment,
  LoginRequest,
  PageParams,
  WorkerQueryParams,
  JobQueryParams,
  LessonQueryParams,
  SalaryQueryParams,
  TraineeQueryParams,
  LogQueryParams,
  PaymentQueryParams,
  OverviewData
} from '@/types'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080', // 根据实际后端地址调整
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加token等认证信息
    const token = localStorage.getItem('token')
    if (token && 
        token !== 'null' && 
        token !== 'undefined' && 
        token !== '' &&
        token !== 'default-token' &&
        token !== 'Default-Token') {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token added to request:', token)
    } else {
      console.warn('No valid token found for request')
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    
    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('token')
      // 重定向到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// 认证相关API
export const authApi = {
  // 登录
  login: (data: LoginRequest): Promise<ApiResponse> => {
    return api.post('/index/login', data)
  },
  
  // 添加用户（测试用）
  addUser: (data: LoginRequest): Promise<ApiResponse> => {
    return api.post('/index/addUser', data)
  }
}

// 员工管理API
export const workerApi = {
  // 添加员工
  add: (data: Omit<Worker, 'id'>): Promise<ApiResponse> => {
    return api.post('/user/worker/add', data)
  },
  
  // 删除员工
  delete: (id: number): Promise<ApiResponse> => {
    return api.delete(`/user/worker/delete/${id}`)
  },
  
  // 批量删除员工
  deleteBatch: (ids: number[]): Promise<ApiResponse> => {
    return api.delete('/user/worker/deleteBatch', { data: ids })
  },
  
  // 修改员工信息
  update: (data: Worker): Promise<ApiResponse> => {
    return api.put('/user/worker/revise', data)
  },
  
  // 分页查询员工
  getByPage: (params: PageParams): Promise<PageResponse<Worker>> => {
    return api.get('/user/worker/getByPage', { params })
  },
  
  // 根据id或姓名查询
  getById: (params: WorkerQueryParams): Promise<PageResponse<Worker>> => {
    return api.get('/user/worker/getById', { params })
  },
  
  // 根据岗位分页查询员工
  getByJob: (params: { id: string; name: string; pageNum: string; pageSize: string }): Promise<PageResponse<Worker>> => {
    return api.get('/user/worker/getByJob', { params })
  },
  
  // 精确查询员工
  getExact: (id?: number): Promise<ApiResponse<Worker>> => {
    const url = id ? `/user/worker/getExact/${id}` : '/user/worker/getExact'
    return api.get(url)
  },
  
  // 导出员工信息
  exportExcel: (): Promise<ApiResponse> => {
    return api.get('/user/worker/getExcelTable')
  },
  
  // 获取所有员工
  getAll: (): Promise<ApiResponse<Worker[]>> => {
    return api.get('/user/worker/getAll')
  },
  
  // 获取员工薪资回显数据
  getReviseVO: (id: number): Promise<ApiResponse<SalaryReviseVO>> => {
    return api.get(`/user/salary/getAddVO/${id}`)
  }
}

// 岗位管理API
export const jobApi = {
  // 添加岗位
  add: (data: Omit<Job, 'id'>): Promise<ApiResponse> => {
    return api.post('/user/job/add', data)
  },
  
  // 删除岗位
  delete: (id: number): Promise<ApiResponse> => {
    return api.delete(`/user/job/delete/${id}`)
  },
  
  
  // 修改岗位信息
  update: (data: Job): Promise<ApiResponse> => {
    return api.put('/user/job/revise', data)
  },
  
  // 分页查询岗位
  getByPage: (params: PageParams): Promise<PageResponse<Job>> => {
    return api.get('/user/job/getByPage', { params })
  },
  
  // 根据id或名称查询
  getById: (params: JobQueryParams): Promise<PageResponse<Job>> => {
    return api.get('/user/job/getById', { params })
  },
  
  // 精确查询岗位
  getExact: (id: number): Promise<ApiResponse<Job>> => {
    return api.get(`/user/job/getExact/${id}`)
  },
  
  // 获取所有岗位
  getAll: (): Promise<ApiResponse<Job[]>> => {
    return api.get('/user/job/getAll')
  }
}

// 培训管理API
export const lessonApi = {
  // 添加课程
  add: (data: Omit<Lesson, 'id'>): Promise<ApiResponse> => {
    return api.post('/user/lesson/add', data)
  },
  
  // 删除课程
  delete: (id: number): Promise<ApiResponse> => {
    return api.delete(`/user/lesson/delete/${id}`)
  },
  
  // 修改课程信息
  update: (data: Lesson): Promise<ApiResponse> => {
    return api.put('/user/lesson/revise', data)
  },
  
  // 分页查询课程
  getByPage: (params: PageParams): Promise<PageResponse<Lesson>> => {
    return api.get('/user/lesson/getByPage', { params })
  },
  
  // 根据id或名称查询
  getById: (params: LessonQueryParams): Promise<PageResponse<Lesson>> => {
    return api.get('/user/lesson/getById', { params })
  },
  
  // 获取所有课程
  getAll: (): Promise<ApiResponse<Lesson[]>> => {
    return api.get('/user/lesson/getAll')
  }
}

// 学员管理API
export const traineeApi = {
  // 批量添加学员
  addBatch: (data: { lesId: number; workerIds: number[] }): Promise<ApiResponse> => {
    return api.post('/user/number/addBatch', data)
  },
  
  // 批量删除学员
  deleteBatch: (ids: number[]): Promise<ApiResponse> => {
    return api.delete('/user/number/deleteBatch', { data: ids })
  },
  
  // 分页查询学员
  getByPage: (params: TraineeQueryParams): Promise<PageResponse> => {
    return api.get('/user/number/getByPage', { params })
  },
  
  // 获取未选择该课程的员工信息
  getNotInLesson: (lessonId: number): Promise<ApiResponse> => {
    return api.get(`/user/number/notInLesson/${lessonId}`)
  },
  
  // 获取选择了该课程的员工信息
  getInLesson: (lessonId: number): Promise<ApiResponse> => {
    return api.get(`/user/number/inLesson/${lessonId}`)
  }
}

// 薪资管理API
export const salaryApi = {
  // 添加薪资条
  add: (data: Omit<Salary, 'id' | 'salary'>): Promise<ApiResponse> => {
    return api.post('/user/salary/add', data)
  },
  
  // 删除薪资条
  delete: (id: number): Promise<ApiResponse> => {
    return api.delete(`/user/salary/delete/${id}`)
  },
  
  // 修改薪资条内容
  update: (data: Salary): Promise<ApiResponse> => {
    return api.put('/user/salary/revise', data)
  },
  
  // 分页查询薪资条
  getByPage: (params: PageParams): Promise<PageResponse<Salary>> => {
    return api.get('/user/salary/getByPage', { params })
  },
  
  // 根据id或姓名查找薪资条
  getById: (params: SalaryQueryParams): Promise<PageResponse<Salary>> => {
    return api.get('/user/salary/getById', { params })
  }
}

// 用户管理API
export const userApi = {
  // 添加用户
  add: (data: { name: string; password: string; worker: number }): Promise<ApiResponse> => {
    return api.post('/admin/user/addUser', data)
  },
  
  // 删除用户
  delete: (id: number): Promise<ApiResponse> => {
    return api.delete(`/admin/user/deleteUser/${id}`)
  },
  
  // 获取用户列表
  getList: (params: { pageNum: number; pageSize: number }): Promise<PageResponse<User>> => {
    return api.get('/admin/user/getUserList', { params })
  }
}

// 系统日志API
export const logApi = {
  // 分页获取系统日志
  getByPage: (params: PageParams): Promise<PageResponse<Log>> => {
    return api.get('/admin/log/getOptionalByPage', { params })
  },
  
  // 根据日期查询日志
  getByDate: (params: LogQueryParams): Promise<PageResponse<Log>> => {
    return api.get('/admin/log/getOptionalByDate', { params })
  }
}

// 收支管理API
export const paymentApi = {
  // 添加收支信息（测试用）
  add: (): Promise<ApiResponse> => {
    return api.post('/admin/payment/add')
  },
  
  // 分页查询收支信息
  getByPage: (params: PaymentQueryParams): Promise<PageResponse<Payment>> => {
    return api.get('/admin/payment/getByPage', { params })
  },
  
  // 修改当日收支信息
  update: (data: Partial<Payment> & { id: number }): Promise<ApiResponse> => {
    return api.put('/admin/payment/revise', data)
  }
}

// 部门管理API
export const departmentApi = {
  // 新增部门
  add: (data: Omit<Department, 'id'>): Promise<ApiResponse> => {
    return api.post('/admin/department/add', data)
  },
  
  // 修改部门信息
  update: (data: Department): Promise<ApiResponse> => {
    return api.put('/admin/department/revise', data)
  },
  
  // 删除部门
  delete: (id: number): Promise<ApiResponse> => {
    return api.delete(`/admin/department/delete/${id}`)
  },
  
  // 分页获取部门列表
  getByPage: (params: PageParams): Promise<PageResponse<Department>> => {
    return api.get('/user/statistic/getDeptByPage', { params })
  },
  
  // 获取所有部门
  getAll: (): Promise<ApiResponse<Department[]>> => {
    return api.get('/user/statistic/getAllDept')
  }
}

// 数据统计API
export const statisticsApi = {
  // 获取数据总览
  getOverviewData: (): Promise<ApiResponse<OverviewData>> => {
    return api.get('/user/statistic/getOverviewData')
  }
}

export default api
