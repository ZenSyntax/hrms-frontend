<template>
  <div class="department-statistics">
    <el-row :gutter="20">
      <!-- 部门员工分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门员工分布</span>
            </div>
          </template>
          <div ref="departmentEmployeeChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 部门薪资对比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门薪资对比</span>
            </div>
          </template>
          <div ref="departmentSalaryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 部门绩效统计 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门绩效统计</span>
            </div>
          </template>
          <div ref="departmentPerformanceChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 部门人员流动 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门人员流动</span>
            </div>
          </template>
          <div ref="departmentTurnoverChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 部门统计表格 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门统计详情</span>
            </div>
          </template>
          
          <el-tabs v-model="activeTab">
            <el-tab-pane label="员工分布统计" name="employee">
              <el-table :data="departmentEmployeeData" stripe border>
                <el-table-column prop="departmentName" label="部门名称" />
                <el-table-column prop="employeeCount" label="员工数量" />
                <el-table-column prop="percentage" label="占比(%)" />
                <el-table-column label="占比图">
                  <template #default="{ row }">
                    <el-progress :percentage="row.percentage" :show-text="false" />
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="薪资统计" name="salary">
              <el-table :data="departmentSalaryData" stripe border>
                <el-table-column prop="departmentName" label="部门名称" />
                <el-table-column prop="totalSalary" label="薪资总额">
                  <template #default="{ row }">
                    ¥{{ row.totalSalary.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="averageSalary" label="平均薪资">
                  <template #default="{ row }">
                    ¥{{ row.averageSalary.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="salaryBudget" label="薪资预算">
                  <template #default="{ row }">
                    ¥{{ row.salaryBudget.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="budgetUtilization" label="预算利用率(%)">
                  <template #default="{ row }">
                    <el-progress :percentage="row.budgetUtilization" :show-text="false" />
                    {{ row.budgetUtilization }}%
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="绩效统计" name="performance">
              <el-table :data="departmentPerformanceData" stripe border>
                <el-table-column prop="departmentName" label="部门名称" />
                <el-table-column prop="performanceScore" label="绩效得分">
                  <template #default="{ row }">
                    <el-progress :percentage="row.performanceScore" :show-text="false" />
                    {{ row.performanceScore }}分
                  </template>
                </el-table-column>
                <el-table-column prop="targetCompletion" label="目标完成率(%)">
                  <template #default="{ row }">
                    <el-progress :percentage="row.targetCompletion" :show-text="false" />
                    {{ row.targetCompletion }}%
                  </template>
                </el-table-column>
                <el-table-column prop="efficiency" label="效率(%)">
                  <template #default="{ row }">
                    <el-progress :percentage="row.efficiency" :show-text="false" />
                    {{ row.efficiency }}%
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="人员流动统计" name="turnover">
              <el-table :data="departmentTurnoverData" stripe border>
                <el-table-column prop="departmentName" label="部门名称" />
                <el-table-column prop="onboardingCount" label="入职人数" />
                <el-table-column prop="departureCount" label="离职人数" />
                <el-table-column prop="turnoverRate" label="流动率(%)">
                  <template #default="{ row }">
                    <el-tag :type="row.turnoverRate > 10 ? 'danger' : row.turnoverRate > 5 ? 'warning' : 'success'">
                      {{ row.turnoverRate }}%
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { statisticsApi } from '@/api/statistics'

const departmentEmployeeChartRef = ref<HTMLElement>()
const departmentSalaryChartRef = ref<HTMLElement>()
const departmentPerformanceChartRef = ref<HTMLElement>()
const departmentTurnoverChartRef = ref<HTMLElement>()

const activeTab = ref('employee')

const departmentEmployeeData = ref([
  { departmentName: '技术部', employeeCount: 45, percentage: 28.8 },
  { departmentName: '市场部', employeeCount: 28, percentage: 17.9 },
  { departmentName: '人事部', employeeCount: 15, percentage: 9.6 },
  { departmentName: '财务部', employeeCount: 12, percentage: 7.7 },
  { departmentName: '运营部', employeeCount: 25, percentage: 16.0 },
  { departmentName: '客服部', employeeCount: 18, percentage: 11.5 }
])

const departmentSalaryData = ref([
  { departmentName: '技术部', totalSalary: 540000, averageSalary: 12000, salaryBudget: 600000, budgetUtilization: 90.0 },
  { departmentName: '市场部', totalSalary: 266000, averageSalary: 9500, salaryBudget: 300000, budgetUtilization: 88.7 },
  { departmentName: '人事部', totalSalary: 120000, averageSalary: 8000, salaryBudget: 150000, budgetUtilization: 80.0 },
  { departmentName: '财务部', totalSalary: 102000, averageSalary: 8500, salaryBudget: 120000, budgetUtilization: 85.0 },
  { departmentName: '运营部', totalSalary: 225000, averageSalary: 9000, salaryBudget: 250000, budgetUtilization: 90.0 },
  { departmentName: '客服部', totalSalary: 126000, averageSalary: 7000, salaryBudget: 150000, budgetUtilization: 84.0 }
])

const departmentPerformanceData = ref([
  { departmentName: '技术部', performanceScore: 85.5, targetCompletion: 92.0, efficiency: 88.0 },
  { departmentName: '市场部', performanceScore: 78.0, targetCompletion: 85.0, efficiency: 82.0 },
  { departmentName: '人事部', performanceScore: 82.0, targetCompletion: 88.0, efficiency: 85.0 },
  { departmentName: '财务部', performanceScore: 90.0, targetCompletion: 95.0, efficiency: 92.0 },
  { departmentName: '运营部', performanceScore: 80.0, targetCompletion: 87.0, efficiency: 84.0 },
  { departmentName: '客服部', performanceScore: 75.0, targetCompletion: 80.0, efficiency: 78.0 }
])

const departmentTurnoverData = ref([
  { departmentName: '技术部', onboardingCount: 8, departureCount: 3, turnoverRate: 6.7 },
  { departmentName: '市场部', onboardingCount: 5, departureCount: 2, turnoverRate: 7.1 },
  { departmentName: '人事部', onboardingCount: 2, departureCount: 1, turnoverRate: 6.7 },
  { departmentName: '财务部', onboardingCount: 1, departureCount: 0, turnoverRate: 0 },
  { departmentName: '运营部', onboardingCount: 4, departureCount: 2, turnoverRate: 8.0 },
  { departmentName: '客服部', onboardingCount: 3, departureCount: 2, turnoverRate: 11.1 }
])

onMounted(async () => {
  await loadData()
  initCharts()
})

const loadData = async () => {
  try {
    const departmentStats = await statisticsApi.getDepartmentStatistics()
    console.log('部门统计数据:', departmentStats)
    // 更新数据
  } catch (error) {
    console.error('加载部门统计数据失败:', error)
    // 使用模拟数据
  }
}

const initCharts = () => {
  // 部门员工分布饼图
  if (departmentEmployeeChartRef.value) {
    const chart = echarts.init(departmentEmployeeChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '部门员工分布',
          type: 'pie',
          radius: '50%',
          data: departmentEmployeeData.value.map(item => ({
            value: item.employeeCount,
            name: item.departmentName
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 部门薪资对比柱状图
  if (departmentSalaryChartRef.value) {
    const chart = echarts.init(departmentSalaryChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['平均薪资', '薪资预算']
      },
      xAxis: {
        type: 'category',
        data: departmentSalaryData.value.map(item => item.departmentName)
      },
      yAxis: {
        type: 'value',
        name: '薪资(元)'
      },
      series: [
        {
          name: '平均薪资',
          type: 'bar',
          data: departmentSalaryData.value.map(item => item.averageSalary),
          itemStyle: { color: '#409eff' }
        },
        {
          name: '薪资预算',
          type: 'bar',
          data: departmentSalaryData.value.map(item => item.salaryBudget / 10), // 除以10显示比例
          itemStyle: { color: '#67c23a' }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 部门绩效统计雷达图
  if (departmentPerformanceChartRef.value) {
    const chart = echarts.init(departmentPerformanceChartRef.value)
    const option = {
      tooltip: {},
      legend: {
        data: ['技术部', '市场部', '人事部', '财务部', '运营部', '客服部']
      },
      radar: {
        indicator: [
          { name: '绩效得分', max: 100 },
          { name: '目标完成率', max: 100 },
          { name: '效率', max: 100 }
        ]
      },
      series: [
        {
          name: '部门绩效',
          type: 'radar',
          data: departmentPerformanceData.value.map(item => ({
            value: [item.performanceScore, item.targetCompletion, item.efficiency],
            name: item.departmentName
          }))
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 部门人员流动柱状图
  if (departmentTurnoverChartRef.value) {
    const chart = echarts.init(departmentTurnoverChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['入职人数', '离职人数']
      },
      xAxis: {
        type: 'category',
        data: departmentTurnoverData.value.map(item => item.departmentName)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '入职人数',
          type: 'bar',
          data: departmentTurnoverData.value.map(item => item.onboardingCount),
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '离职人数',
          type: 'bar',
          data: departmentTurnoverData.value.map(item => item.departureCount),
          itemStyle: { color: '#f56c6c' }
        }
      ]
    }
    chart.setOption(option)
  }
}
</script>

<style scoped>
.department-statistics {
  padding: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>
