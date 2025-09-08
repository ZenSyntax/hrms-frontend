// 统计数据VO对象
export interface StatisticsOverviewVO {
  panelData: {
    workerAmount: number      // 员工总数
    employedAmount: number    // 在职员工总数
    jobAmount: number         // 岗位数
    departmentAmount: number  // 部门总数
    workerChange: number      // 本月员工总数较上月的变化
  }
  workerGrowthTrend: number[][]  // 每月员工数量变化趋势 [入职人数, 离职人数]
  salaryDistribution: {
    more: number    // 薪资在20000以上的员工总数
    high: number    // 薪资在12000到20000之间的员工总数
    middle: number  // 薪资在8000到12000之间的员工总数
    low: number     // 薪资在5000到8000之间的员工总数
    few: number     // 薪资在5000以下的员工总数
  }
  incomeExpenseTrend: number[][]  // 每月收支金额变化趋势 [收入, 支出]
}

// 员工统计VO对象
export interface EmployeeStatisticsVO {
  // 员工类型分布
  workerType: {
    permanent: number   // 正式工数量
    temporary: number   // 临时工数量
    intern: number      // 实习生数量
  }
  
  // 性别分布
  workerGender: {
    male: number
    female: number
  }
  
  // 年龄分布
  workerAge: {
    young: number       // 年龄小于35岁的员工数量
    middle: number      // 年龄小于50大于35的员工数量
    old: number         // 年龄大于50的员工数量
  }
  
  // 部门员工分布
  departmentWorkers: Array<{
    departmentName: string
    workerAmount: number
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
