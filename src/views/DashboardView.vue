<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: card.color }">
              <el-icon :size="24">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ card.value }}</div>
              <div class="stat-title">{{ card.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 员工统计图表 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>员工统计</span>
            </div>
          </template>
          <div ref="employeeChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <!-- 部门统计图表 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门统计</span>
            </div>
          </template>
          <div ref="departmentChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 薪资趋势图表 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>薪资趋势</span>
            </div>
          </template>
          <div ref="salaryChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- API测试区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>API测试</span>
            </div>
          </template>
          <div class="api-test">
            <div class="token-info">
              <h4>当前Token状态:</h4>
              <p><strong>Token:</strong> {{ authStore.token || '未设置' }}</p>
              <p><strong>登录状态:</strong> {{ authStore.isLoggedIn ? '已登录' : '未登录' }}</p>
              <p><strong>用户:</strong> {{ authStore.user?.name || '未知' }}</p>
            </div>
            <el-button type="primary" @click="testApiCall" :loading="apiLoading">
              测试API调用
            </el-button>
            <div v-if="apiResult" class="api-result">
              <h4>API调用结果:</h4>
              <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { 
  User, 
  Briefcase, 
  OfficeBuilding
} from '@element-plus/icons-vue'
import { workerApi } from '@/api'
import { useAuthStore } from '@/stores'

const employeeChartRef = ref<HTMLElement>()
const departmentChartRef = ref<HTMLElement>()
const salaryChartRef = ref<HTMLElement>()
const apiLoading = ref(false)
const apiResult = ref<any>(null)

const authStore = useAuthStore()

const statCards = ref([
  {
    title: '总员工数',
    value: 156,
    icon: User,
    color: '#409eff'
  },
  {
    title: '在职员工',
    value: 142,
    icon: User,
    color: '#67c23a'
  },
  {
    title: '岗位数量',
    value: 28,
    icon: Briefcase,
    color: '#e6a23c'
  },
  {
    title: '部门数量',
    value: 12,
    icon: OfficeBuilding,
    color: '#f56c6c'
  }
])

// API测试函数
const testApiCall = async () => {
  apiLoading.value = true
  apiResult.value = null
  
  try {
    // 测试员工API调用
    const result = await workerApi.getByPage({ pageNum: 1, pageSize: 10 })
    apiResult.value = result
    ElMessage.success('API调用成功')
  } catch (error: any) {
    console.error('API test error:', error)
    apiResult.value = {
      error: true,
      message: error.message || 'API调用失败',
      status: error.response?.status,
      data: error.response?.data
    }
    ElMessage.error('API调用失败')
  } finally {
    apiLoading.value = false
  }
}

onMounted(() => {
  initCharts()
})

const initCharts = () => {
  // 员工统计图表
  if (employeeChartRef.value) {
    const employeeChart = echarts.init(employeeChartRef.value)
    const employeeOption = {
      tooltip: {
        trigger: 'item'
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
            { value: 120, name: '正式工' },
            { value: 15, name: '临时工' },
            { value: 7, name: '实习生' }
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
    employeeChart.setOption(employeeOption)
  }
  
  // 部门统计图表
  if (departmentChartRef.value) {
    const departmentChart = echarts.init(departmentChartRef.value)
    const departmentOption = {
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
    departmentChart.setOption(departmentOption)
  }
  
  // 薪资趋势图表
  if (salaryChartRef.value) {
    const salaryChart = echarts.init(salaryChartRef.value)
    const salaryOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['平均薪资', '最高薪资', '最低薪资']
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月']
      },
      yAxis: {
        type: 'value',
        name: '薪资(元)'
      },
      series: [
        {
          name: '平均薪资',
          type: 'line',
          data: [8500, 8600, 8700, 8800, 8900, 9000, 9100, 9200],
          smooth: true,
          itemStyle: { color: '#409eff' }
        },
        {
          name: '最高薪资',
          type: 'line',
          data: [12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500],
          smooth: true,
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '最低薪资',
          type: 'line',
          data: [5000, 5100, 5200, 5300, 5400, 5500, 5600, 5700],
          smooth: true,
          itemStyle: { color: '#e6a23c' }
        }
      ]
    }
    salaryChart.setOption(salaryOption)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  width: 100%;
  height: 100%;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.api-test {
  padding: 20px;
}

.token-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
}

.token-info h4 {
  margin: 0 0 10px 0;
  color: #0369a1;
}

.token-info p {
  margin: 5px 0;
  color: #0c4a6e;
}

.api-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.api-result h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.api-result pre {
  margin: 0;
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 移动端自适应样式 */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-title {
    font-size: 12px;
  }
  
  .card-header {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 5px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .stat-title {
    font-size: 11px;
  }
  
  .card-header {
    font-size: 13px;
  }
}
</style>
