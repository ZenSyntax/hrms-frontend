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
              <div class="card-trend" :class="card.trend > 0 ? 'positive' : 'negative'">
                <el-icon><component :is="card.trend > 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
                {{ Math.abs(card.trend) }}%
              </div>
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
          <div ref="employeeGrowthChartRef" style="height: 300px;"></div>
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
          <div ref="salaryDistributionChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 部门人员分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门人员分布</span>
            </div>
          </template>
          <div ref="departmentDistributionChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 培训完成情况 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>培训完成情况</span>
            </div>
          </template>
          <div ref="trainingProgressChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 系统使用情况 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统使用情况</span>
            </div>
          </template>
          <div ref="systemUsageChartRef" style="height: 300px;"></div>
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
  OfficeBuilding, 
  Money,
  TrendCharts,
  Bottom
} from '@element-plus/icons-vue'

const employeeGrowthChartRef = ref<HTMLElement>()
const salaryDistributionChartRef = ref<HTMLElement>()
const departmentDistributionChartRef = ref<HTMLElement>()
const trainingProgressChartRef = ref<HTMLElement>()
const systemUsageChartRef = ref<HTMLElement>()
const paymentTrendChartRef = ref<HTMLElement>()

const overviewCards = ref([
  {
    title: '总员工数',
    value: 156,
    icon: User,
    color: '#409eff',
    trend: 5.2
  },
  {
    title: '在职员工',
    value: 142,
    icon: User,
    color: '#67c23a',
    trend: 3.8
  },
  {
    title: '岗位数量',
    value: 28,
    icon: Briefcase,
    color: '#e6a23c',
    trend: 2.1
  },
  {
    title: '部门数量',
    value: 12,
    icon: OfficeBuilding,
    color: '#f56c6c',
    trend: 0
  }
])

onMounted(async () => {
  await loadData()
  initCharts()
})

const loadData = async () => {
  try {
    const overviewData = await statisticsApi.getOverview()
    // 更新卡片数据
    overviewCards.value[0].value = overviewData.totalEmployees
    overviewCards.value[1].value = overviewData.activeEmployees
    overviewCards.value[2].value = overviewData.totalJobs
    overviewCards.value[3].value = overviewData.totalDepartments
  } catch (error) {
    console.error('加载总览数据失败:', error)
    // 使用模拟数据
  }
}

const initCharts = () => {
  // 员工增长趋势
  if (employeeGrowthChartRef.value) {
    const chart = echarts.init(employeeGrowthChartRef.value)
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
          data: [8, 12, 15, 10, 18, 22, 16, 20, 14, 11, 9, 13],
          smooth: true,
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '离职人数',
          type: 'line',
          data: [3, 5, 7, 4, 6, 8, 5, 9, 4, 3, 2, 4],
          smooth: true,
          itemStyle: { color: '#f56c6c' }
        },
        {
          name: '净增长',
          type: 'bar',
          data: [5, 7, 8, 6, 12, 14, 11, 11, 10, 8, 7, 9],
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
            { value: 15, name: '5000以下' },
            { value: 45, name: '5000-8000' },
            { value: 60, name: '8000-12000' },
            { value: 25, name: '12000-20000' },
            { value: 8, name: '20000以上' }
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
  
  // 部门人员分布
  if (departmentDistributionChartRef.value) {
    const chart = echarts.init(departmentDistributionChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['技术部', '市场部', '人事部', '财务部', '运营部', '客服部']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '员工数量',
          type: 'bar',
          data: [45, 28, 15, 12, 25, 18],
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 培训完成情况
  if (trainingProgressChartRef.value) {
    const chart = echarts.init(trainingProgressChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '培训完成情况',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 120, name: '已完成' },
            { value: 30, name: '进行中' },
            { value: 6, name: '未开始' }
          ]
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 系统使用情况
  if (systemUsageChartRef.value) {
    const chart = echarts.init(systemUsageChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '活跃用户',
          type: 'line',
          data: [45, 52, 48, 55, 60, 35, 25],
          smooth: true,
          itemStyle: { color: '#409eff' }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 收支趋势
  if (paymentTrendChartRef.value) {
    const chart = echarts.init(paymentTrendChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis'
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
        name: '金额(万元)'
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: [20, 22, 25, 23, 28, 30, 27, 32, 29, 26, 24, 31],
          smooth: true,
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '支出',
          type: 'line',
          data: [15, 16, 18, 17, 20, 22, 19, 24, 21, 18, 16, 23],
          smooth: true,
          itemStyle: { color: '#f56c6c' }
        },
        {
          name: '净利润',
          type: 'bar',
          data: [5, 6, 7, 6, 8, 8, 8, 8, 8, 8, 8, 8],
          itemStyle: { color: '#409eff' }
        }
      ]
    }
    chart.setOption(option)
  }
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
}

.card-trend.positive {
  color: #67c23a;
}

.card-trend.negative {
  color: #f56c6c;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>
