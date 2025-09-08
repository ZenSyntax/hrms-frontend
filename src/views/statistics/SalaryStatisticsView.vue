<template>
  <div class="salary-statistics">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>薪资统计</span>
        </div>
      </template>
      
      <!-- 员工选择区域 -->
      <div class="employee-selector">
        <el-row :gutter="20" align="middle">
          <el-col :span="6">
            <label class="selector-label">选择员工：</label>
          </el-col>
          <el-col :span="18">
            <el-select
              v-model="selectedEmployeeId"
              placeholder="请选择员工"
              filterable
              remote
              :remote-method="filterEmployees"
              :loading="loading"
              @change="onEmployeeChange"
              style="width: 100%"
            >
              <el-option
                v-for="employee in filteredEmployees"
                :key="employee.id"
                :label="employee.name"
                :value="employee.id"
              />
            </el-select>
          </el-col>
        </el-row>
      </div>
      
      <!-- 薪资趋势图表 -->
      <div class="chart-container" v-if="selectedEmployeeId && salaryData.length > 0">
        <div class="chart-title">薪资变化趋势</div>
        <div ref="salaryChartRef" class="salary-chart"></div>
      </div>
      
      <!-- 无数据提示 -->
      <div v-else-if="selectedEmployeeId && salaryData.length === 0" class="no-data">
        <el-empty description="该员工暂无薪资数据" />
      </div>
      
      <!-- 未选择员工提示 -->
      <div v-else class="no-selection">
        <el-empty description="请选择员工查看薪资统计" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import api from '@/api/index'

// 员工接口类型
interface Employee {
  id: number
  name: string
}

// 薪资数据接口类型
interface SalaryData {
  settlementTime: string
  salary: number
}

// 响应数据接口类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 响应式数据
const selectedEmployeeId = ref<number | null>(null)
const allEmployees = ref<Employee[]>([])
const filteredEmployees = ref<Employee[]>([])
const salaryData = ref<SalaryData[]>([])
const loading = ref(false)
const salaryChartRef = ref<HTMLElement>()

// 获取所有员工列表
const getAllEmployees = async () => {
  try {
    loading.value = true
    const response: ApiResponse<Employee[]> = await api.get('/user/worker/getAll')
    if (response.code === 0) {
      allEmployees.value = response.data
      filteredEmployees.value = response.data
    } else {
      ElMessage.error(response.message || '获取员工列表失败')
    }
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败')
  } finally {
    loading.value = false
  }
}

// 过滤员工（模糊搜索）
const filterEmployees = (query: string) => {
  if (!query) {
    filteredEmployees.value = allEmployees.value
  } else {
    filteredEmployees.value = allEmployees.value.filter(employee =>
      employee.name.toLowerCase().includes(query.toLowerCase())
    )
  }
}

// 员工选择变化
const onEmployeeChange = async (employeeId: number) => {
  if (employeeId) {
    await getSalaryData(employeeId)
  } else {
    salaryData.value = []
  }
}

// 获取员工薪资数据
const getSalaryData = async (employeeId: number) => {
  try {
    loading.value = true
    const response: ApiResponse<SalaryData[]> = await api.get(`/user/statistic/getWorkerSalaryData/${employeeId}`)
    if (response.code === 0) {
      salaryData.value = response.data
      await nextTick()
      initSalaryChart()
    } else {
      ElMessage.error(response.message || '获取薪资数据失败')
      salaryData.value = []
    }
  } catch (error) {
    console.error('获取薪资数据失败:', error)
    ElMessage.error('获取薪资数据失败')
    salaryData.value = []
  } finally {
    loading.value = false
  }
}

// 初始化薪资图表
const initSalaryChart = () => {
  if (!salaryChartRef.value || salaryData.value.length === 0) return
  
  const chart = echarts.init(salaryChartRef.value)
  
  // 按时间排序数据
  const sortedData = [...salaryData.value].sort((a, b) => 
    new Date(a.settlementTime).getTime() - new Date(b.settlementTime).getTime()
  )
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const data = params[0]
        return `${data.axisValue}<br/>薪资: ¥${data.value}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sortedData.map(item => item.settlementTime),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '薪资(元)',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '薪资',
        type: 'line',
        data: sortedData.map(item => item.salary),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#409eff',
          width: 3
        },
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 组件挂载
onMounted(() => {
  getAllEmployees()
})
</script>

<style scoped>
.salary-statistics {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.employee-selector {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  line-height: 32px;
}

.chart-container {
  margin-top: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.salary-chart {
  height: 400px;
  width: 100%;
}

.no-data,
.no-selection {
  margin-top: 40px;
  text-align: center;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
}
</style>
