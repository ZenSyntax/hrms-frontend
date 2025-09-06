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
  gender: number // 0-女 1-男
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
  id: number
  lesId: number
  workerId: number
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

// 用户信息
export interface User {
  id: number
  name: string
  password: string
  worker?: number
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
  id: number // 课程id
  name?: string
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
