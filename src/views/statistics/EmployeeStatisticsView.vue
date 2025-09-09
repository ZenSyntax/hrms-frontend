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
import { ref, onMounted, onActivated, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { statisticsApi } from '@/api/statistics'
import { useDataRefreshStore } from '@/stores'
import type { EmployeeStatisticsVO } from '@/types/statistics'

const employeeTypeChartRef = ref<HTMLElement>()
const genderChartRef = ref<HTMLElement>()
const ageChartRef = ref<HTMLElement>()
const departmentChartRef = ref<HTMLElement>()

// 图表实例管理
const chartInstances = ref<{
  employeeType?: echarts.ECharts
  gender?: echarts.ECharts
  age?: echarts.ECharts
  department?: echarts.ECharts
}>({})

// 获取数据刷新store
const dataRefreshStore = useDataRefreshStore()

onMounted(async () => {
  await loadData()
})

// 当页面被激活时重新加载数据（解决路由切换时数据不更新的问题）
onActivated(async () => {
  await loadData()
})

// 监听数据刷新事件
watch(() => dataRefreshStore.refreshTrigger, async (newVal, oldVal) => {
  console.log('员工统计页面 - 数据刷新事件监听:', { newVal, oldVal })
  if (newVal > oldVal) {
    console.log('员工统计页面 - 检测到数据刷新事件，重新加载员工统计数据...')
    await loadData()
  }
})

const loadData = async () => {
  try {
    console.log('开始获取员工统计数据...')
    const response = await statisticsApi.getEmployeeStatistics()
    console.log('获取到的员工统计数据响应:', response)
    
    // 处理API响应，根据接口文档，响应格式为 { code, message, data }
    // 如果response有data字段，使用data字段；否则直接使用response
    const employeeData = (response as any).data || response
    console.log('处理后的员工统计数据:', employeeData)
    
    // 检查API响应的完整结构
    console.log('API响应完整结构:', {
      response: response,
      hasData: !!(response as any).data,
      dataKeys: employeeData ? Object.keys(employeeData) : [],
      responseKeys: response ? Object.keys(response) : []
    })
    
    // 特别检查部门数据
    console.log('部门员工数据详情:', {
      departmentWorkers: employeeData.departmentWorkers,
      type: typeof employeeData.departmentWorkers,
      isArray: Array.isArray(employeeData.departmentWorkers),
      length: employeeData.departmentWorkers?.length
    })
    
    if (employeeData.departmentWorkers && employeeData.departmentWorkers.length > 0) {
      console.log('部门数据示例:', employeeData.departmentWorkers[0])
    } else {
      console.warn('部门数据为空或格式不正确，API返回的完整数据结构:', employeeData)
      // 检查是否有其他可能的字段名
      const possibleFields = ['departmentWorkers', 'departmentWorkersList', 'departments', 'departmentList']
      for (const field of possibleFields) {
        if (employeeData[field] && Array.isArray(employeeData[field])) {
          console.log(`找到部门数据字段: ${field}`, employeeData[field])
          employeeData.departmentWorkers = employeeData[field]
          break
        }
      }
    }
    
    // 确保DOM元素已经渲染完成后再更新图表
    await nextTick()
    updateCharts(employeeData)
  } catch (error) {
    console.error('加载员工统计数据失败:', error)
    // 使用空数据而不是模拟数据
    const emptyData: EmployeeStatisticsVO = {
      workerType: {
        permanent: 0,
        temporary: 0,
        intern: 0
      },
      workerGender: {
        male: 0,
        female: 0
      },
      workerAge: {
        young: 0,
        middle: 0,
        old: 0
      },
      departmentWorkers: []
    }
    
    console.log('API调用失败，使用空数据更新图表:', emptyData)
    await nextTick()
    updateCharts(emptyData)
  }
}

// 更新图表数据
const updateCharts = (employeeData: EmployeeStatisticsVO) => {
  console.log('员工统计页面 - 开始更新图表数据:', employeeData)
  
  // 1. 员工类型分布 - 环形饼图
  if (employeeTypeChartRef.value) {
    // 如果图表实例不存在，则初始化
    if (!chartInstances.value.employeeType) {
      chartInstances.value.employeeType = echarts.init(employeeTypeChartRef.value)
    }
    const chart = chartInstances.value.employeeType
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
    // 如果图表实例不存在，则初始化
    if (!chartInstances.value.gender) {
      chartInstances.value.gender = echarts.init(genderChartRef.value)
    }
    const chart = chartInstances.value.gender
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
    // 如果图表实例不存在，则初始化
    if (!chartInstances.value.age) {
      chartInstances.value.age = echarts.init(ageChartRef.value)
    }
    const chart = chartInstances.value.age
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
          label: {
            show: true,
            position: 'top',
            formatter: '{c}人',
            fontSize: 12,
            color: '#333'
          },
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
    // 如果图表实例不存在，则初始化
    if (!chartInstances.value.department) {
      chartInstances.value.department = echarts.init(departmentChartRef.value)
    }
    const chart = chartInstances.value.department
    
    console.log('部门图表 - 原始部门数据:', employeeData.departmentWorkers)
    
    // 检查部门数据是否存在且为数组
    if (!employeeData.departmentWorkers || !Array.isArray(employeeData.departmentWorkers)) {
      console.warn('部门数据不存在或格式不正确:', employeeData.departmentWorkers)
      // 使用空数据
      const emptyOption = {
        tooltip: { 
          trigger: 'axis',
          formatter: '{b}: {c}人'
        },
        grid: { 
          left: '15%', 
          right: '4%', 
          bottom: '3%', 
          top: '3%',
          containLabel: true 
        },
        xAxis: { 
          type: 'value', 
          name: '人数',
          nameLocation: 'middle',
          nameGap: 25
        },
        yAxis: { 
          type: 'category', 
          data: [],
          axisLabel: {
            interval: 0
          }
        },
        series: [{ 
          name: '部门员工数', 
          type: 'bar', 
          data: [] 
        }]
      }
      chart.setOption(emptyOption)
      return
    }
    
    // 处理部门数据，根据接口文档格式：departmentName 和 workerAmount
    const departmentData = employeeData.departmentWorkers
      .filter((dept: any) => {
        if (!dept) return false
        // 根据接口文档，字段名为 workerAmount
        const workerCount = dept.workerAmount || 0
        return workerCount >= 0 // 显示所有部门，包括员工数为0的部门
      })
      .map((dept: any) => ({
        departmentName: dept.departmentName || '未知部门',
        workerAmount: dept.workerAmount || 0
      }))
      .sort((a, b) => b.workerAmount - a.workerAmount) // 按员工数量降序排列
    
    console.log('部门图表 - 处理后的部门数据:', departmentData)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          const data = params[0]
          return `${data.name}: ${data.value}人`
        }
      },
      grid: {
        left: '15%', // 增加左边距以容纳部门名称
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '人数',
        nameLocation: 'middle',
        nameGap: 25,
        axisLabel: {
          formatter: '{value}人'
        }
      },
      yAxis: {
        type: 'category',
        data: departmentData.map(dept => dept.departmentName),
        axisLabel: {
          interval: 0, // 显示所有标签
          formatter: function(value: string) {
            // 如果部门名称过长，进行截断处理
            return value.length > 8 ? value.substring(0, 8) + '...' : value
          }
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      series: [
        {
          name: '部门员工数',
          type: 'bar',
          data: departmentData.map(dept => ({
            value: dept.workerAmount,
            itemStyle: {
              color: dept.workerAmount > 0 
                ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#409eff' },
                    { offset: 1, color: '#67c23a' }
                  ])
                : '#e4e7ed' // 员工数为0的部门使用灰色
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}人',
            fontSize: 12
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
