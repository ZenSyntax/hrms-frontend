<template>
  <div class="statistics-overview">
    <el-row :gutter="20">
      <!-- 关键指标卡片 -->
      <el-col :span="6" v-for="card in overviewCards" :key="card.title">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: card.color }">
              <el-icon :size="24">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ card.value }}</div>
              <div class="card-title">{{ card.title }}</div>
              <!-- 只有员工总数显示变化趋势，其他卡片显示占位元素保持高度一致 -->
              <div v-if="card.title === '员工总数'" class="card-trend" :class="card.change > 0 ? 'positive' : 'negative'">
                <el-icon><component :is="card.change > 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
                {{ card.change > 0 ? '+' : '' }}{{ card.change }}
              </div>
              <div v-else class="card-trend-placeholder"></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 员工增长趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>员工增长趋势</span>
            </div>
          </template>
          <div ref="employeeGrowthChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      
      <!-- 薪资分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>薪资分布</span>
            </div>
          </template>
          <div ref="salaryDistributionChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 收支趋势 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>收支趋势</span>
            </div>
          </template>
          <div ref="paymentTrendChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { statisticsApi } from '@/api/statistics'
import { 
  User, 
  Briefcase, 
  OfficeBuilding
} from '@element-plus/icons-vue'

const employeeGrowthChartRef = ref<HTMLElement>()
const salaryDistributionChartRef = ref<HTMLElement>()
const paymentTrendChartRef = ref<HTMLElement>()

const overviewCards = ref([
  {
    title: '员工总数',
    value: 0,
    icon: User,
    color: '#409eff',
    change: 0
  },
  {
    title: '在职员工',
    value: 0,
    icon: User,
    color: '#67c23a',
    change: 0
  },
  {
    title: '岗位数量',
    value: 0,
    icon: Briefcase,
    color: '#e6a23c',
    change: 0
  },
  {
    title: '部门数量',
    value: 0,
    icon: OfficeBuilding,
    color: '#f56c6c',
    change: 0
  }
])

onMounted(async () => {
  await loadData()
  initCharts()
})

const loadData = async () => {
  try {
    console.log('开始获取总览数据...')
    const overviewData = await statisticsApi.getOverview()
    console.log('获取到的总览数据:', overviewData)
    
    // 更新卡片数据
    if (overviewData && overviewData.panelData) {
      console.log('更新卡片数据:', overviewData.panelData)
      overviewCards.value[0].value = overviewData.panelData.workerAmount
      overviewCards.value[0].change = overviewData.panelData.workerChange
      overviewCards.value[1].value = overviewData.panelData.employedAmount
      overviewCards.value[2].value = overviewData.panelData.jobAmount
      overviewCards.value[3].value = overviewData.panelData.departmentAmount
      console.log('卡片数据更新完成:', overviewCards.value)
    } else {
      console.warn('总览数据格式不正确:', overviewData)
    }
    
    // 更新图表数据
    updateCharts(overviewData)
  } catch (error) {
    console.error('加载总览数据失败:', error)
    // 使用模拟数据
    const mockData = {
      panelData: {
        workerAmount: 25,
        employedAmount: 22,
        jobAmount: 19,
        departmentAmount: 16,
        workerChange: 1
      },
      workerGrowthTrend: [
        [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [24, 2], [1, 1]
      ],
      salaryDistribution: {
        more: 5,
        high: 9,
        middle: 4,
        low: 4,
        few: 3
      },
      incomeExpenseTrend: [
        [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [472711.5, 652700.0], [94764.0, 242500.0]
      ]
    }
    
    // 使用模拟数据更新卡片
    console.log('使用模拟数据更新卡片:', mockData.panelData)
    overviewCards.value[0].value = mockData.panelData.workerAmount
    overviewCards.value[0].change = mockData.panelData.workerChange
    overviewCards.value[1].value = mockData.panelData.employedAmount
    overviewCards.value[1].change = 0 // 在职员工变化暂时设为0，因为接口没有提供
    overviewCards.value[2].value = mockData.panelData.jobAmount
    overviewCards.value[2].change = 0 // 岗位数量变化暂时设为0，因为接口没有提供
    overviewCards.value[3].value = mockData.panelData.departmentAmount
    overviewCards.value[3].change = 0 // 部门数量变化暂时设为0，因为接口没有提供
    console.log('模拟数据卡片更新完成:', overviewCards.value)
    
    // 使用模拟数据更新图表
    updateCharts(mockData)
  }
}

// 更新图表数据
const updateCharts = (overviewData: any) => {
  // 员工增长趋势
  if (employeeGrowthChartRef.value) {
    const chart = echarts.init(employeeGrowthChartRef.value)
    
    // 处理员工增长趋势数据
    const onboardingData = overviewData.workerGrowthTrend.map((item: number[]) => item[0])
    const departureData = overviewData.workerGrowthTrend.map((item: number[]) => item[1])
    const netGrowthData = overviewData.workerGrowthTrend.map((item: number[]) => item[0] - item[1])
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['入职人数', '离职人数', '净增长']
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '入职人数',
          type: 'line',
          data: onboardingData,
          smooth: true,
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '离职人数',
          type: 'line',
          data: departureData,
          smooth: true,
          itemStyle: { color: '#f56c6c' }
        },
        {
          name: '净增长',
          type: 'bar',
          data: netGrowthData,
          itemStyle: { color: '#409eff' }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 薪资分布
  if (salaryDistributionChartRef.value) {
    const chart = echarts.init(salaryDistributionChartRef.value)
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
          data: [
            { value: overviewData.salaryDistribution.few, name: '5000以下' },
            { value: overviewData.salaryDistribution.low, name: '5000-8000' },
            { value: overviewData.salaryDistribution.middle, name: '8000-12000' },
            { value: overviewData.salaryDistribution.high, name: '12000-20000' },
            { value: overviewData.salaryDistribution.more, name: '20000以上' }
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
  
  // 收支趋势
  if (paymentTrendChartRef.value) {
    const chart = echarts.init(paymentTrendChartRef.value)
    
    // 处理收支趋势数据
    const incomeData = overviewData.incomeExpenseTrend.map((item: number[]) => item[0])
    const expenseData = overviewData.incomeExpenseTrend.map((item: number[]) => item[1])
    const profitData = overviewData.incomeExpenseTrend.map((item: number[]) => item[0] - item[1])
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          let result = params[0].name + '<br/>'
          params.forEach((param: any) => {
            if (param.seriesName === '收入' || param.seriesName === '支出') {
              result += param.marker + param.seriesName + ': ' + (param.value / 10000).toFixed(2) + '万元<br/>'
            } else {
              result += param.marker + param.seriesName + ': ' + (param.value / 10000).toFixed(2) + '万元<br/>'
            }
          })
          return result
        }
      },
      legend: {
        data: ['收入', '支出', '净利润']
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value',
        name: '金额(万元)',
        axisLabel: {
          formatter: function(value: number) {
            return (value / 10000).toFixed(0)
          }
        }
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: incomeData,
          smooth: true,
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '支出',
          type: 'line',
          data: expenseData,
          smooth: true,
          itemStyle: { color: '#f56c6c' }
        },
        {
          name: '净利润',
          type: 'bar',
          data: profitData,
          itemStyle: { color: '#409eff' }
        }
      ]
    }
    chart.setOption(option)
  }
}

const initCharts = () => {
  // 初始化图表（使用模拟数据）
  const mockData = {
    workerGrowthTrend: [
      [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [24, 2], [1, 1]
    ],
    salaryDistribution: {
      more: 5,
      high: 9,
      middle: 4,
      low: 4,
      few: 3
    },
    incomeExpenseTrend: [
      [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [472711.5, 652700.0], [94764.0, 242500.0]
    ]
  }
  updateCharts(mockData)
}
</script>

<style scoped>
.statistics-overview {
  padding: 20px;
}

.overview-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 15px;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px; /* 设置固定高度 */
  line-height: 20px; /* 确保行高与高度一致 */
}

.card-trend.positive {
  color: #67c23a;
}

.card-trend.negative {
  color: #f56c6c;
}

.card-trend-placeholder {
  height: 20px; /* 与card-trend相同的高度 */
  line-height: 20px; /* 确保行高与高度一致 */
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>
