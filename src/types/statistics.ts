// 统计数据VO对象
export interface StatisticsOverviewVO {
  totalEmployees: number
  activeEmployees: number
  totalJobs: number
  totalDepartments: number
  totalSalary: number
  averageSalary: number
  monthlyGrowth: number
}

// 员工统计VO对象
export interface EmployeeStatisticsVO {
  // 员工类型分布
  employeeTypeDistribution: {
    formal: number      // 正式工数量
    temporary: number   // 临时工数量
    intern: number      // 实习生数量
  }
  
  // 学历分布
  educationDistribution: {
    bachelorAbove: number  // 本科以上
    bachelor: number       // 本科
    college: number        // 大专
    highSchool: number     // 高中
    belowHighSchool: number // 初中及以下
  }
  
  // 性别分布
  genderDistribution: {
    male: number
    female: number
  }
  
  // 年龄分布
  ageDistribution: {
    under25: number
    age25to30: number
    age30to40: number
    age40to50: number
    above50: number
  }
  
  // 入职趋势（最近12个月）
  onboardingTrend: Array<{
    month: string
    count: number
  }>
  
  // 离职趋势（最近12个月）
  departureTrend: Array<{
    month: string
    count: number
  }>
}

// 薪资统计VO对象
export interface SalaryStatisticsVO {
  // 薪资分布
  salaryDistribution: {
    under5000: number
    salary5000to8000: number
    salary8000to12000: number
    salary12000to20000: number
    above20000: number
  }
  
  // 平均薪资趋势（最近12个月）
  averageSalaryTrend: Array<{
    month: string
    averageSalary: number
    maxSalary: number
    minSalary: number
  }>
  
  // 部门薪资对比
  departmentSalaryComparison: Array<{
    departmentName: string
    averageSalary: number
    maxSalary: number
    minSalary: number
    employeeCount: number
  }>
  
  // 岗位薪资对比
  jobSalaryComparison: Array<{
    jobName: string
    averageSalary: number
    maxSalary: number
    minSalary: number
    employeeCount: number
  }>
  
  // 薪资增长率
  salaryGrowthRate: {
    monthlyGrowth: number
    yearlyGrowth: number
  }
}

// 部门统计VO对象
export interface DepartmentStatisticsVO {
  // 部门员工数量分布
  departmentEmployeeDistribution: Array<{
    departmentName: string
    employeeCount: number
    percentage: number
  }>
  
  // 部门薪资统计
  departmentSalaryStats: Array<{
    departmentName: string
    totalSalary: number
    averageSalary: number
    salaryBudget: number
    budgetUtilization: number
  }>
  
  // 部门绩效统计
  departmentPerformanceStats: Array<{
    departmentName: string
    performanceScore: number
    targetCompletion: number
    efficiency: number
  }>
  
  // 部门人员流动统计
  departmentTurnoverStats: Array<{
    departmentName: string
    onboardingCount: number
    departureCount: number
    turnoverRate: number
  }>
}

// 培训统计VO对象
export interface TrainingStatisticsVO {
  // 培训课程统计
  courseStatistics: {
    totalCourses: number
    completedCourses: number
    ongoingCourses: number
    plannedCourses: number
  }
  
  // 学员统计
  traineeStatistics: {
    totalTrainees: number
    completedTrainees: number
    ongoingTrainees: number
    completionRate: number
  }
  
  // 培训效果统计
  trainingEffectiveness: Array<{
    courseName: string
    completionRate: number
    averageScore: number
    satisfactionRate: number
  }>
  
  // 培训成本统计
  trainingCostStats: Array<{
    month: string
    totalCost: number
    costPerTrainee: number
    budgetUtilization: number
  }>
}

// 系统统计VO对象
export interface SystemStatisticsVO {
  // 用户活跃度统计
  userActivityStats: Array<{
    date: string
    activeUsers: number
    loginCount: number
    operationCount: number
  }>
  
  // 系统性能统计
  systemPerformanceStats: {
    averageResponseTime: number
    errorRate: number
    uptime: number
    peakConcurrentUsers: number
  }
  
  // 操作日志统计
  operationLogStats: Array<{
    operationType: string
    count: number
    successRate: number
  }>
  
  // 数据增长统计
  dataGrowthStats: Array<{
    month: string
    employeeGrowth: number
    salaryGrowth: number
    logGrowth: number
  }>
}

// 收支统计VO对象
export interface PaymentStatisticsVO {
  // 收支概览
  paymentOverview: {
    totalRevenue: number
    totalExpense: number
    netProfit: number
    profitMargin: number
  }
  
  // 收入构成
  revenueComposition: Array<{
    category: string
    amount: number
    percentage: number
  }>
  
  // 支出构成
  expenseComposition: Array<{
    category: string
    amount: number
    percentage: number
  }>
  
  // 收支趋势（最近12个月）
  paymentTrend: Array<{
    month: string
    revenue: number
    expense: number
    profit: number
  }>
  
  // 成本分析
  costAnalysis: {
    salaryCost: number
    trainingCost: number
    operationCost: number
    otherCost: number
  }
}
