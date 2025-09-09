<template>
  <div class="overview-container">

    <!-- 数据面板 -->
    <div class="data-panels">
      <div class="panel-item">
        <div class="panel-icon employee">
          <el-icon><User /></el-icon>
            </div>
        <div class="panel-content">
          <div class="panel-title">员工总数</div>
          <div class="panel-value">{{ overviewData.panelData.workerAmount }}</div>
          <div class="panel-change" :class="{ positive: overviewData.panelData.workerChange > 0, negative: overviewData.panelData.workerChange < 0 }">
            <el-icon v-if="overviewData.panelData.workerChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="overviewData.panelData.workerChange < 0"><ArrowDown /></el-icon>
            <span>{{ Math.abs(overviewData.panelData.workerChange) }}</span>
              </div>
            </div>
          </div>

      <div class="panel-item">
        <div class="panel-icon employed">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="panel-content">
          <div class="panel-title">在职员工</div>
          <div class="panel-value">{{ overviewData.panelData.employedAmount }}</div>
          <div class="panel-subtitle">当前在职</div>
        </div>
      </div>

      <div class="panel-item">
        <div class="panel-icon job">
          <el-icon><Briefcase /></el-icon>
        </div>
        <div class="panel-content">
          <div class="panel-title">岗位数量</div>
          <div class="panel-value">{{ overviewData.panelData.jobAmount }}</div>
          <div class="panel-subtitle">个岗位</div>
        </div>
      </div>

      <div class="panel-item">
        <div class="panel-icon department">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <div class="panel-content">
          <div class="panel-title">部门数量</div>
          <div class="panel-value">{{ overviewData.panelData.departmentAmount }}</div>
          <div class="panel-subtitle">个部门</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 员工增长趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>员工增长趋势</h3>
          <p>近12个月入职与离职对比</p>
            </div>
        <div class="chart-content">
          <div ref="workerGrowthChart" class="chart"></div>
        </div>
      </div>
      
      <!-- 薪资分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>薪资分布</h3>
          <p>员工薪资水平分布情况</p>
            </div>
        <div class="chart-content">
          <div ref="salaryChart" class="chart"></div>
        </div>
      </div>

      <!-- 收支趋势 -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>收支趋势</h3>
          <p>近12个月收入与支出对比</p>
            </div>
        <div class="chart-content">
          <div ref="incomeExpenseChart" class="chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Briefcase, OfficeBuilding, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { statisticsApi } from '@/api'
import type { OverviewData } from '@/types'

// 响应式数据
const overviewData = ref<OverviewData>({
  panelData: {
    workerAmount: 0,
    employedAmount: 0,
    jobAmount: 0,
    departmentAmount: 0,
    workerChange: 0
  },
  workerGrowthTrend: [],
      salaryDistribution: {
        more: 0,
        high: 0,
        middle: 0,
        low: 0,
        few: 0
      },
  incomeExpenseTrend: []
})

// 图表引用
const workerGrowthChart = ref<HTMLElement>()
const salaryChart = ref<HTMLElement>()
const incomeExpenseChart = ref<HTMLElement>()

// 图表实例
let workerGrowthChartInstance: echarts.ECharts | null = null
let salaryChartInstance: echarts.ECharts | null = null
let incomeExpenseChartInstance: echarts.ECharts | null = null

// 获取数据总览
const fetchOverviewData = async () => {
  try {
    const response = await statisticsApi.getOverviewData()
    if (response.code === 0) {
      overviewData.value = response.data
      // 数据加载完成后初始化图表
      await nextTick()
      initCharts()
      } else {
      ElMessage.error(response.message || '获取数据失败')
      }
    } catch (error) {
    console.error('获取数据总览失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  }
}

// 初始化员工增长趋势图表
const initWorkerGrowthChart = () => {
  if (!workerGrowthChart.value) return
  
  workerGrowthChartInstance = echarts.init(workerGrowthChart.value)
  
  // 生成月份标签（最近12个月）
  const months = []
  const currentDate = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }))
  }
  
  // 处理数据（从最早月份开始）
  const joinData = overviewData.value.workerGrowthTrend.map(item => item[0])
  const leaveData = overviewData.value.workerGrowthTrend.map(item => item[1])
  // 计算净增长数据（入职人数 - 离职人数）
  const netGrowthData = joinData.map((join, index) => join - leaveData[index])
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['入职人数', '离职人数', '净增长', '入职趋势', '离职趋势']
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '入职人数',
        type: 'bar',
        data: joinData,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '离职人数',
        type: 'bar',
        data: leaveData,
        itemStyle: { 
          color: '#F56C6C'
        }
      },
      {
        name: '净增长',
        type: 'bar',
        data: netGrowthData,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '入职趋势',
        type: 'line',
        data: joinData,
        smooth: true,
        lineStyle: {
          color: '#67C23A',
          width: 3
        },
        itemStyle: {
          color: '#67C23A'
        },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '离职趋势',
        type: 'line',
        data: leaveData,
        smooth: true,
        lineStyle: {
          color: '#F56C6C',
          width: 3
        },
        itemStyle: {
          color: '#F56C6C'
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }
  
  workerGrowthChartInstance.setOption(option)
}

// 初始化薪资分布图表
const initSalaryChart = () => {
  if (!salaryChart.value) return
  
  salaryChartInstance = echarts.init(salaryChart.value)
  
  const data = [
    { value: overviewData.value.salaryDistribution.more, name: '20000以上' },
    { value: overviewData.value.salaryDistribution.high, name: '12000-20000' },
    { value: overviewData.value.salaryDistribution.middle, name: '8000-12000' },
    { value: overviewData.value.salaryDistribution.low, name: '5000-8000' },
    { value: overviewData.value.salaryDistribution.few, name: '5000以下' }
  ]
  
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
              name: '薪资分布',
              type: 'pie',
        radius: '50%',
        data: data,
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
  
  salaryChartInstance.setOption(option)
}

// 初始化收支趋势图表
const initIncomeExpenseChart = () => {
  if (!incomeExpenseChart.value) return
  
  incomeExpenseChartInstance = echarts.init(incomeExpenseChart.value)
  
  // 生成月份标签（最近12个月）
  const months = []
  const currentDate = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }))
  }
  
  // 处理数据（从最早月份开始）
  const incomeData = overviewData.value.incomeExpenseTrend.map(item => item[0])
  const expenseData = overviewData.value.incomeExpenseTrend.map(item => item[1])
  // 计算净利润数据（收入 - 支出）
  const netProfitData = incomeData.map((income, index) => income - expenseData[index])
  
  const option = {
          tooltip: {
            trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params: any) {
              let result = params[0].name + '<br/>'
              params.forEach((param: any) => {
          result += param.seriesName + ': ¥' + param.value.toLocaleString() + '<br/>'
              })
              return result
            }
          },
          legend: {
      data: ['收入', '支出', '净利润']
          },
          xAxis: {
            type: 'category',
      data: months
          },
          yAxis: {
            type: 'value',
      name: '金额(元)',
            axisLabel: { 
        formatter: function (value: number) {
          if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万'
          }
          return value.toLocaleString()
        }
      }
          },
          series: [
            {
              name: '收入',
              type: 'line',
              data: incomeData,
              smooth: true,
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(103, 194, 58, 0.3)'
            }, {
              offset: 1, color: 'rgba(103, 194, 58, 0.1)'
            }]
          }
        }
            },
            {
              name: '支出',
              type: 'line',
              data: expenseData,
              smooth: true,
              itemStyle: { 
          color: '#F56C6C'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(245, 108, 108, 0.3)'
            }, {
              offset: 1, color: 'rgba(245, 108, 108, 0.1)'
            }]
          }
        }
            },
            {
              name: '净利润',
              type: 'bar',
              data: netProfitData,
              itemStyle: {
                color: '#409EFF'
              }
            }
      ]
  }
  
  incomeExpenseChartInstance.setOption(option)
}

// 初始化所有图表
const initCharts = () => {
  initWorkerGrowthChart()
  initSalaryChart()
  initIncomeExpenseChart()
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  workerGrowthChartInstance?.resize()
  salaryChartInstance?.resize()
  incomeExpenseChartInstance?.resize()
}

onMounted(() => {
  fetchOverviewData()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  workerGrowthChartInstance?.dispose()
  salaryChartInstance?.dispose()
  incomeExpenseChartInstance?.dispose()
})
</script>

<style scoped>
.overview-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}


/* 数据面板样式 */
.data-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.panel-item {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.panel-item:hover {
  transform: translateY(-2px);
}

.panel-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.panel-icon.employee {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.panel-icon.employed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.panel-icon.job {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.panel-icon.department {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.panel-content {
  flex: 1;
}

.panel-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.panel-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.panel-change {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
}

.panel-change.positive {
  color: #67C23A;
}

.panel-change.negative {
  color: #F56C6C;
}

.panel-change .el-icon {
  margin-right: 4px;
}

.panel-subtitle {
  font-size: 12px;
  color: #909399;
}

/* 图表区域样式 */
.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-header h3 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.chart-header p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.chart-content {
  padding: 20px;
}

.chart {
  width: 100%;
  height: 300px;
}

.chart-card.full-width .chart {
  height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-panels {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .overview-container {
    padding: 16px;
  }
}
</style>
