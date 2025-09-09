// 基础响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页响应类型
export interface PageResponse<T = any> {
  code: number
  message: string
  data: {
    total: number
    items: T[]
  }
}

// 员工信息
export interface Worker {
  id: number
  name: string
  gender: number // 1-男 2-女
  degree: number // 1-本科以上 2-本科 3-大专 4-高中 5-初中及以下
  birthday: string
  socialSecurity: number // 0-未缴 1-已缴
  rpRecord?: string
  transfer?: string
  workStatus: number // 0-离职 1-在任
  certificate?: string
  laborStatus: number // 1-正式工 2-临时工 3-实习生
  job: number
  department: number
  onboardingTime: string
  departureTime?: string
}

// 岗位信息
export interface Job {
  id: number
  name: string
  demand: string
  type: number // 1-正式工 2-临时工 3-实习生
  salary: number
  overtimePay: number
  introduction: string
  totalWorker?: number
}

// 部门信息
export interface Department {
  id: number
  name: string
  supervisor: number
  uperId: number
}

// 培训课程
export interface Lesson {
  id: number
  name: string
  schedule: string
  timePlan: number
  address: string
  info: string
}

// 学员信息
export interface Trainee {
  id: number // 学员与课程的多对多关系表ID
  name: string
  dept: string
  job: string
  lesName: string
}

// 薪资信息
export interface Salary {
  id: number
  jobId: number
  workerId: number
  settlementTime: string
  cycle: number // 1-月结算 2-日结算 3-年结算
  salaryOffset: number
  salary: number
}

// 薪资回显数据
export interface SalaryReviseVO {
  jobName: string
  baseSalary: number
}

// 用户信息
export interface User {
  id: number
  name: string
  password: string
  worker?: number
  role?: string // 用户角色：admin, leader, user
}

// 系统日志
export interface Log {
  id: number
  operateUser: number
  operateTime: string
  className: string
  methodName: string
  methodParams?: string
  returnValue?: string
  costTime: number
}

// 收支信息
export interface Payment {
  id: number
  profit: number
  tax: number
  socialSecurity: number
  water: number
  electricity: number
  salary: number
  outlay: number
  date: string
}

// 登录请求
export interface LoginRequest {
  name: string
  password: string
}

// 分页查询参数
export interface PageParams {
  pageNum?: number
  pageSize?: number
}

// 员工查询参数
export interface WorkerQueryParams extends PageParams {
  id?: number
  name?: string
}

// 岗位查询参数
export interface JobQueryParams extends PageParams {
  id?: number
  name?: string
}

// 课程查询参数
export interface LessonQueryParams extends PageParams {
  id?: number
  name?: string
}

// 薪资查询参数
export interface SalaryQueryParams extends PageParams {
  id?: number
  name?: string
}

// 学员查询参数
export interface TraineeQueryParams extends PageParams {
  id?: number | null // 课程ID（精确匹配）
  name?: string | null // 学员姓名（模糊搜索）
}

// 日志查询参数
export interface LogQueryParams extends PageParams {
  id?: number
  name?: string
}

// 收支查询参数
export interface PaymentQueryParams extends PageParams {
  id?: number
  name?: string
}

// 数据总览相关类型
export interface OverviewData {
  panelData: {
    workerAmount: number      // 员工总数
    employedAmount: number    // 在职员工数
    jobAmount: number         // 岗位数量
    departmentAmount: number  // 部门数量
    workerChange: number      // 本月员工总数较上月的变化
  }
  workerGrowthTrend: number[][]  // 员工增长趋势 [入职人数, 离职人数]
  salaryDistribution: {
    more: number    // 20000以上
    high: number    // 12000-20000
    middle: number  // 8000-12000
    low: number     // 5000-8000
    few: number     // 5000以下
  }
  incomeExpenseTrend: number[][]  // 收支趋势 [收入, 支出]
}