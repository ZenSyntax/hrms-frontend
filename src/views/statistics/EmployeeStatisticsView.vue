<template>
  <div class="employee-statistics">
    <el-row :gutter="20">
      <!-- 员工类型分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>员工类型分布</span>
            </div>
          </template>
          <div ref="employeeTypeChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 学历分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>学历分布</span>
            </div>
          </template>
          <div ref="educationChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 性别分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>性别分布</span>
            </div>
          </template>
          <div ref="genderChartRef" style="height: 250px;"></div>
        </el-card>
      </el-col>
      
      <!-- 年龄分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>年龄分布</span>
            </div>
          </template>
          <div ref="ageChartRef" style="height: 250px;"></div>
        </el-card>
      </el-col>
      
      <!-- 部门分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门分布</span>
            </div>
          </template>
          <div ref="departmentChartRef" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 入职趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>入职趋势</span>
            </div>
          </template>
          <div ref="onboardingTrendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 离职趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>离职趋势</span>
            </div>
          </template>
          <div ref="departureTrendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { statisticsApi } from '@/api/statistics'
import type { EmployeeStatisticsVO } from '@/types/statistics'

const employeeTypeChartRef = ref<HTMLElement>()
const educationChartRef = ref<HTMLElement>()
const genderChartRef = ref<HTMLElement>()
const ageChartRef = ref<HTMLElement>()
const departmentChartRef = ref<HTMLElement>()
const onboardingTrendChartRef = ref<HTMLElement>()
const departureTrendChartRef = ref<HTMLElement>()

let employeeStats: EmployeeStatisticsVO | null = null

onMounted(async () => {
  await loadData()
  initCharts()
})

const loadData = async () => {
  try {
    employeeStats = await statisticsApi.getEmployeeStatistics()
  } catch (error) {
    console.error('加载员工统计数据失败:', error)
    // 使用模拟数据
    employeeStats = {
      employeeTypeDistribution: {
        formal: 120,
        temporary: 15,
        intern: 7
      },
      educationDistribution: {
        bachelorAbove: 45,
        bachelor: 60,
        college: 30,
        highSchool: 15,
        belowHighSchool: 6
      },
      genderDistribution: {
        male: 85,
        female: 57
      },
      ageDistribution: {
        under25: 25,
        age25to30: 45,
        age30to40: 50,
        age40to50: 20,
        above50: 2
      },
      onboardingTrend: [
        { month: '2024-01', count: 8 },
        { month: '2024-02', count: 12 },
        { month: '2024-03', count: 15 },
        { month: '2024-04', count: 10 },
        { month: '2024-05', count: 18 },
        { month: '2024-06', count: 22 },
        { month: '2024-07', count: 16 },
        { month: '2024-08', count: 20 },
        { month: '2024-09', count: 14 },
        { month: '2024-10', count: 11 },
        { month: '2024-11', count: 9 },
        { month: '2024-12', count: 13 }
      ],
      departureTrend: [
        { month: '2024-01', count: 3 },
        { month: '2024-02', count: 5 },
        { month: '2024-03', count: 7 },
        { month: '2024-04', count: 4 },
        { month: '2024-05', count: 6 },
        { month: '2024-06', count: 8 },
        { month: '2024-07', count: 5 },
        { month: '2024-08', count: 9 },
        { month: '2024-09', count: 4 },
        { month: '2024-10', count: 3 },
        { month: '2024-11', count: 2 },
        { month: '2024-12', count: 4 }
      ]
    }
  }
}

const initCharts = () => {
  if (!employeeStats) return
  
  // 员工类型分布饼图
  if (employeeTypeChartRef.value) {
    const chart = echarts.init(employeeTypeChartRef.value)
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
          name: '员工类型',
          type: 'pie',
          radius: '50%',
          data: [
            { value: employeeStats.employeeTypeDistribution.formal, name: '正式工' },
            { value: employeeStats.employeeTypeDistribution.temporary, name: '临时工' },
            { value: employeeStats.employeeTypeDistribution.intern, name: '实习生' }
          ],
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
  
  // 学历分布柱状图
  if (educationChartRef.value) {
    const chart = echarts.init(educationChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['本科以上', '本科', '大专', '高中', '初中及以下']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '人数',
          type: 'bar',
          data: [
            employeeStats.educationDistribution.bachelorAbove,
            employeeStats.educationDistribution.bachelor,
            employeeStats.educationDistribution.college,
            employeeStats.educationDistribution.highSchool,
            employeeStats.educationDistribution.belowHighSchool
          ],
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 性别分布饼图
  if (genderChartRef.value) {
    const chart = echarts.init(genderChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '性别分布',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: employeeStats.genderDistribution.male, name: '男' },
            { value: employeeStats.genderDistribution.female, name: '女' }
          ]
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 年龄分布柱状图
  if (ageChartRef.value) {
    const chart = echarts.init(ageChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['25岁以下', '25-30岁', '30-40岁', '40-50岁', '50岁以上']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '人数',
          type: 'bar',
          data: [
            employeeStats.ageDistribution.under25,
            employeeStats.ageDistribution.age25to30,
            employeeStats.ageDistribution.age30to40,
            employeeStats.ageDistribution.age40to50,
            employeeStats.ageDistribution.above50
          ],
          itemStyle: {
            color: '#67c23a'
          }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 部门分布饼图
  if (departmentChartRef.value) {
    const chart = echarts.init(departmentChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '部门分布',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 45, name: '技术部' },
            { value: 28, name: '市场部' },
            { value: 15, name: '人事部' },
            { value: 12, name: '财务部' },
            { value: 25, name: '运营部' },
            { value: 18, name: '客服部' }
          ]
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 入职趋势折线图
  if (onboardingTrendChartRef.value) {
    const chart = echarts.init(onboardingTrendChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: employeeStats.onboardingTrend.map(item => item.month)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '入职人数',
          type: 'line',
          data: employeeStats.onboardingTrend.map(item => item.count),
          smooth: true,
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 离职趋势折线图
  if (departureTrendChartRef.value) {
    const chart = echarts.init(departureTrendChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: employeeStats.departureTrend.map(item => item.month)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '离职人数',
          type: 'line',
          data: employeeStats.departureTrend.map(item => item.count),
          smooth: true,
          itemStyle: {
            color: '#f56c6c'
          }
        }
      ]
    }
    chart.setOption(option)
  }
}
</script>

<style scoped>
.employee-statistics {
  padding: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>
