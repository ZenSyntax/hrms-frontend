<template>
  <div class="employee-statistics">
    <el-row :gutter="20">
      <!-- 员工类型分布 - 环形饼图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>员工类型分布</span>
            </div>
          </template>
          <div ref="employeeTypeChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      
      <!-- 性别分布 - 玫瑰图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>性别分布</span>
            </div>
          </template>
          <div ref="genderChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 年龄分布 - 柱状图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>年龄分布</span>
            </div>
          </template>
          <div ref="ageChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      
      <!-- 部门分布 - 横向柱状图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门员工分布</span>
            </div>
          </template>
          <div ref="departmentChartRef" style="height: 350px;"></div>
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
const genderChartRef = ref<HTMLElement>()
const ageChartRef = ref<HTMLElement>()
const departmentChartRef = ref<HTMLElement>()

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    console.log('开始获取员工统计数据...')
    const response = await statisticsApi.getEmployeeStatistics()
    console.log('获取到的员工统计数据:', response)
    
    // 更新图表数据
    updateCharts(response)
  } catch (error) {
    console.error('加载员工统计数据失败:', error)
    // 使用模拟数据
    const mockData: EmployeeStatisticsVO = {
      workerType: {
        permanent: 22,
        temporary: 1,
        intern: 2
      },
      workerGender: {
        male: 14,
        female: 11
      },
      workerAge: {
        young: 23,
        middle: 2,
        old: 0
      },
      departmentWorkers: [
        { departmentName: "公司总部", workerAmount: 0 },
        { departmentName: "技术中心", workerAmount: 1 },
        { departmentName: "产品中心", workerAmount: 0 },
        { departmentName: "市场与销售中心", workerAmount: 0 },
        { departmentName: "职能中心", workerAmount: 0 },
        { departmentName: "研发部", workerAmount: 6 },
        { departmentName: "测试部", workerAmount: 2 },
        { departmentName: "运维部", workerAmount: 1 },
        { departmentName: "产品设计部", workerAmount: 4 },
        { departmentName: "用户体验部", workerAmount: 1 },
        { departmentName: "市场部", workerAmount: 2 },
        { departmentName: "销售部", workerAmount: 3 },
        { departmentName: "人力资源部", workerAmount: 2 },
        { departmentName: "财务部", workerAmount: 1 },
        { departmentName: "行政部", workerAmount: 2 },
        { departmentName: "宣传分部1", workerAmount: 0 }
      ]
    }
    
    console.log('使用模拟数据更新图表:', mockData)
    updateCharts(mockData)
  }
}

// 更新图表数据
const updateCharts = (employeeData: EmployeeStatisticsVO) => {
  // 1. 员工类型分布 - 环形饼图
  if (employeeTypeChartRef.value) {
    const chart = echarts.init(employeeTypeChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}人 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [
        {
          name: '员工类型',
          type: 'pie',
          radius: ['40%', '70%'], // 环形图
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          data: [
            { value: employeeData.workerType.permanent, name: '正式工', itemStyle: { color: '#409eff' } },
            { value: employeeData.workerType.temporary, name: '临时工', itemStyle: { color: '#67c23a' } },
            { value: employeeData.workerType.intern, name: '实习生', itemStyle: { color: '#e6a23c' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 2. 性别分布 - 玫瑰图
  if (genderChartRef.value) {
    const chart = echarts.init(genderChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}人 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [
        {
          name: '性别分布',
          type: 'pie',
          radius: [20, 110],
          center: ['60%', '50%'],
          roseType: 'radius', // 玫瑰图
          data: [
            { value: employeeData.workerGender.male, name: '男性', itemStyle: { color: '#409eff' } },
            { value: employeeData.workerGender.female, name: '女性', itemStyle: { color: '#f56c6c' } }
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
  
  // 3. 年龄分布 - 柱状图
  if (ageChartRef.value) {
    const chart = echarts.init(ageChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c}人'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['35岁以下', '35-50岁', '50岁以上'],
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '人数'
      },
      series: [
        {
          name: '年龄分布',
          type: 'bar',
          data: [
            { value: employeeData.workerAge.young, itemStyle: { color: '#67c23a' } },
            { value: employeeData.workerAge.middle, itemStyle: { color: '#e6a23c' } },
            { value: employeeData.workerAge.old, itemStyle: { color: '#f56c6c' } }
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
  
  // 4. 部门分布 - 横向柱状图
  if (departmentChartRef.value) {
    const chart = echarts.init(departmentChartRef.value)
    
    // 过滤掉员工数量为0的部门，并按数量排序
    const departmentData = employeeData.departmentWorkers
      .filter(dept => dept.workerAmount > 0)
      .sort((a, b) => b.workerAmount - a.workerAmount)
      .slice(0, 10) // 只显示前10个部门
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c}人'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '人数'
      },
      yAxis: {
        type: 'category',
        data: departmentData.map(dept => dept.departmentName),
        axisLabel: {
          interval: 0,
          formatter: function(value: string) {
            return value.length > 6 ? value.substring(0, 6) + '...' : value
          }
        }
      },
      series: [
        {
          name: '部门员工数',
          type: 'bar',
          data: departmentData.map(dept => ({
            value: dept.workerAmount,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#409eff' },
                { offset: 1, color: '#67c23a' }
              ])
            }
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
