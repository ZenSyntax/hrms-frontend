<template>
  <div class="salary-statistics">
    <el-row :gutter="20">
      <!-- 薪资分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>薪资分布</span>
            </div>
          </template>
          <div ref="salaryDistributionChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 平均薪资趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>平均薪资趋势</span>
            </div>
          </template>
          <div ref="averageSalaryTrendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 部门薪资对比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门薪资对比</span>
            </div>
          </template>
          <div ref="departmentSalaryChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      
      <!-- 岗位薪资对比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>岗位薪资对比</span>
            </div>
          </template>
          <div ref="jobSalaryChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 薪资统计表格 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>薪资统计详情</span>
            </div>
          </template>
          
          <el-tabs v-model="activeTab">
            <el-tab-pane label="部门薪资统计" name="department">
              <el-table :data="departmentSalaryData" stripe border>
                <el-table-column prop="departmentName" label="部门名称" />
                <el-table-column prop="averageSalary" label="平均薪资" />
                <el-table-column prop="maxSalary" label="最高薪资" />
                <el-table-column prop="minSalary" label="最低薪资" />
                <el-table-column prop="employeeCount" label="员工数量" />
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="岗位薪资统计" name="job">
              <el-table :data="jobSalaryData" stripe border>
                <el-table-column prop="jobName" label="岗位名称" />
                <el-table-column prop="averageSalary" label="平均薪资" />
                <el-table-column prop="maxSalary" label="最高薪资" />
                <el-table-column prop="minSalary" label="最低薪资" />
                <el-table-column prop="employeeCount" label="员工数量" />
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
import type { SalaryStatisticsVO } from '@/types/statistics'

const salaryDistributionChartRef = ref<HTMLElement>()
const averageSalaryTrendChartRef = ref<HTMLElement>()
const departmentSalaryChartRef = ref<HTMLElement>()
const jobSalaryChartRef = ref<HTMLElement>()

const activeTab = ref('department')

let salaryStats: SalaryStatisticsVO | null = null

const departmentSalaryData = ref([
  { departmentName: '技术部', averageSalary: 12000, maxSalary: 20000, minSalary: 8000, employeeCount: 45 },
  { departmentName: '市场部', averageSalary: 9500, maxSalary: 15000, minSalary: 6000, employeeCount: 28 },
  { departmentName: '人事部', averageSalary: 8000, maxSalary: 12000, minSalary: 5000, employeeCount: 15 },
  { departmentName: '财务部', averageSalary: 8500, maxSalary: 13000, minSalary: 5500, employeeCount: 12 },
  { departmentName: '运营部', averageSalary: 9000, maxSalary: 14000, minSalary: 6000, employeeCount: 25 },
  { departmentName: '客服部', averageSalary: 7000, maxSalary: 10000, minSalary: 4500, employeeCount: 18 }
])

const jobSalaryData = ref([
  { jobName: '高级工程师', averageSalary: 15000, maxSalary: 25000, minSalary: 12000, employeeCount: 20 },
  { jobName: '软件工程师', averageSalary: 10000, maxSalary: 15000, minSalary: 8000, employeeCount: 25 },
  { jobName: '产品经理', averageSalary: 12000, maxSalary: 18000, minSalary: 9000, employeeCount: 8 },
  { jobName: '市场专员', averageSalary: 8000, maxSalary: 12000, minSalary: 6000, employeeCount: 15 },
  { jobName: '人事专员', averageSalary: 7000, maxSalary: 10000, minSalary: 5000, employeeCount: 10 },
  { jobName: '财务专员', averageSalary: 7500, maxSalary: 11000, minSalary: 5500, employeeCount: 8 }
])

onMounted(async () => {
  await loadData()
  initCharts()
})

const loadData = async () => {
  try {
    salaryStats = await statisticsApi.getSalaryStatistics()
  } catch (error) {
    console.error('加载薪资统计数据失败:', error)
    // 使用模拟数据
    salaryStats = {
      salaryDistribution: {
        under5000: 15,
        salary5000to8000: 45,
        salary8000to12000: 60,
        salary12000to20000: 25,
        above20000: 8
      },
      averageSalaryTrend: [
        { month: '2024-01', averageSalary: 8500, maxSalary: 12000, minSalary: 5000 },
        { month: '2024-02', averageSalary: 8600, maxSalary: 12500, minSalary: 5100 },
        { month: '2024-03', averageSalary: 8700, maxSalary: 13000, minSalary: 5200 },
        { month: '2024-04', averageSalary: 8800, maxSalary: 13500, minSalary: 5300 },
        { month: '2024-05', averageSalary: 8900, maxSalary: 14000, minSalary: 5400 },
        { month: '2024-06', averageSalary: 9000, maxSalary: 14500, minSalary: 5500 },
        { month: '2024-07', averageSalary: 9100, maxSalary: 15000, minSalary: 5600 },
        { month: '2024-08', averageSalary: 9200, maxSalary: 15500, minSalary: 5700 },
        { month: '2024-09', averageSalary: 9300, maxSalary: 16000, minSalary: 5800 },
        { month: '2024-10', averageSalary: 9400, maxSalary: 16500, minSalary: 5900 },
        { month: '2024-11', averageSalary: 9500, maxSalary: 17000, minSalary: 6000 },
        { month: '2024-12', averageSalary: 9600, maxSalary: 17500, minSalary: 6100 }
      ],
      departmentSalaryComparison: departmentSalaryData.value,
      jobSalaryComparison: jobSalaryData.value,
      salaryGrowthRate: {
        monthlyGrowth: 1.2,
        yearlyGrowth: 15.5
      }
    }
  }
}

const initCharts = () => {
  if (!salaryStats) return
  
  // 薪资分布柱状图
  if (salaryDistributionChartRef.value) {
    const chart = echarts.init(salaryDistributionChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['5000以下', '5000-8000', '8000-12000', '12000-20000', '20000以上']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '人数',
          type: 'bar',
          data: [
            salaryStats.salaryDistribution.under5000,
            salaryStats.salaryDistribution.salary5000to8000,
            salaryStats.salaryDistribution.salary8000to12000,
            salaryStats.salaryDistribution.salary12000to20000,
            salaryStats.salaryDistribution.above20000
          ],
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 平均薪资趋势折线图
  if (averageSalaryTrendChartRef.value) {
    const chart = echarts.init(averageSalaryTrendChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['平均薪资', '最高薪资', '最低薪资']
      },
      xAxis: {
        type: 'category',
        data: salaryStats.averageSalaryTrend.map(item => item.month)
      },
      yAxis: {
        type: 'value',
        name: '薪资(元)'
      },
      series: [
        {
          name: '平均薪资',
          type: 'line',
          data: salaryStats.averageSalaryTrend.map(item => item.averageSalary),
          smooth: true,
          itemStyle: { color: '#409eff' }
        },
        {
          name: '最高薪资',
          type: 'line',
          data: salaryStats.averageSalaryTrend.map(item => item.maxSalary),
          smooth: true,
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '最低薪资',
          type: 'line',
          data: salaryStats.averageSalaryTrend.map(item => item.minSalary),
          smooth: true,
          itemStyle: { color: '#e6a23c' }
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
        data: ['平均薪资', '最高薪资', '最低薪资']
      },
      xAxis: {
        type: 'category',
        data: salaryStats.departmentSalaryComparison.map(item => item.departmentName)
      },
      yAxis: {
        type: 'value',
        name: '薪资(元)'
      },
      series: [
        {
          name: '平均薪资',
          type: 'bar',
          data: salaryStats.departmentSalaryComparison.map(item => item.averageSalary),
          itemStyle: { color: '#409eff' }
        },
        {
          name: '最高薪资',
          type: 'bar',
          data: salaryStats.departmentSalaryComparison.map(item => item.maxSalary),
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '最低薪资',
          type: 'bar',
          data: salaryStats.departmentSalaryComparison.map(item => item.minSalary),
          itemStyle: { color: '#e6a23c' }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 岗位薪资对比柱状图
  if (jobSalaryChartRef.value) {
    const chart = echarts.init(jobSalaryChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['平均薪资', '最高薪资', '最低薪资']
      },
      xAxis: {
        type: 'category',
        data: salaryStats.jobSalaryComparison.map(item => item.jobName)
      },
      yAxis: {
        type: 'value',
        name: '薪资(元)'
      },
      series: [
        {
          name: '平均薪资',
          type: 'bar',
          data: salaryStats.jobSalaryComparison.map(item => item.averageSalary),
          itemStyle: { color: '#409eff' }
        },
        {
          name: '最高薪资',
          type: 'bar',
          data: salaryStats.jobSalaryComparison.map(item => item.maxSalary),
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '最低薪资',
          type: 'bar',
          data: salaryStats.jobSalaryComparison.map(item => item.minSalary),
          itemStyle: { color: '#e6a23c' }
        }
      ]
    }
    chart.setOption(option)
  }
}
</script>

<style scoped>
.salary-statistics {
  padding: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>
