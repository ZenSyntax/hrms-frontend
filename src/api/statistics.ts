import api from './index'
import type { 
  StatisticsOverviewVO,
  EmployeeStatisticsVO,
  SalaryStatisticsVO,
  DepartmentStatisticsVO,
  TrainingStatisticsVO,
  SystemStatisticsVO,
  PaymentStatisticsVO
} from '@/types/statistics'

// 统计数据API
export const statisticsApi = {
  // 获取总览统计
  getOverview: (): Promise<StatisticsOverviewVO> => {
    return api.get('/user/statistics/overview')
  },
  
  // 获取员工统计
  getEmployeeStatistics: (): Promise<EmployeeStatisticsVO> => {
    return api.get('/user/statistics/employee')
  },
  
  // 获取薪资统计
  getSalaryStatistics: (): Promise<SalaryStatisticsVO> => {
    return api.get('/user/statistics/salary')
  },
  
  // 获取部门统计
  getDepartmentStatistics: (): Promise<DepartmentStatisticsVO> => {
    return api.get('/user/statistics/department')
  },
  
  // 获取培训统计
  getTrainingStatistics: (): Promise<TrainingStatisticsVO> => {
    return api.get('/user/statistics/training')
  },
  
  // 获取系统统计
  getSystemStatistics: (): Promise<SystemStatisticsVO> => {
    return api.get('/user/statistics/system')
  },
  
  // 获取收支统计
  getPaymentStatistics: (): Promise<PaymentStatisticsVO> => {
    return api.get('/user/statistics/payment')
  }
}
