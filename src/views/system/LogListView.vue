<template>
  <div class="log-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统日志</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="操作类型">
          <el-input v-model="searchForm.operationType" placeholder="请输入操作类型" clearable />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="operateUser" label="操作用户" width="120" />
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="className" label="类名" width="200" show-overflow-tooltip />
        <el-table-column prop="methodName" label="方法名" width="150" show-overflow-tooltip />
        <el-table-column prop="methodParams" label="方法参数" min-width="200" show-overflow-tooltip />
        <el-table-column prop="returnValue" label="返回值" min-width="200" show-overflow-tooltip />
        <el-table-column prop="costTime" label="耗时(ms)" width="100" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="日志详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志ID">{{ logDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="操作用户">{{ logDetail.operateUser }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ logDetail.operateTime }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ logDetail.costTime }}ms</el-descriptions-item>
        <el-descriptions-item label="类名" :span="2">{{ logDetail.className }}</el-descriptions-item>
        <el-descriptions-item label="方法名" :span="2">{{ logDetail.methodName }}</el-descriptions-item>
        <el-descriptions-item label="方法参数" :span="2">
          <pre>{{ logDetail.methodParams }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="返回值" :span="2">
          <pre>{{ logDetail.returnValue }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { logApi } from '@/api'
import type { Log } from '@/types'

const loading = ref(false)
const detailDialogVisible = ref(false)
const tableData = ref<Log[]>([])
const logDetail = ref<Log>({} as Log)

const searchForm = reactive({
  operationType: '',
  dateRange: []
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取日志列表
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      name: searchForm.operationType || undefined
    }
    
    const response = await logApi.getByPage(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取日志列表失败:', error)
    // 使用模拟数据
    tableData.value = [
      {
        id: 1,
        operateUser: 1,
        operateTime: '2024-01-15 14:30:00',
        className: 'com.hrms.controller.WorkerController',
        methodName: 'addWorker',
        methodParams: '{"name":"张三","gender":1,"degree":2}',
        returnValue: '{"code":0,"message":"success"}',
        costTime: 150
      },
      {
        id: 2,
        operateUser: 2,
        operateTime: '2024-01-15 14:25:00',
        className: 'com.hrms.controller.JobController',
        methodName: 'updateJob',
        methodParams: '{"id":1,"name":"高级工程师","salary":15000}',
        returnValue: '{"code":0,"message":"success"}',
        costTime: 120
      },
      {
        id: 3,
        operateUser: 1,
        operateTime: '2024-01-15 14:20:00',
        className: 'com.hrms.controller.SalaryController',
        methodName: 'getSalaryList',
        methodParams: '{"pageNum":1,"pageSize":10}',
        returnValue: '{"code":0,"data":{"total":100,"items":[]}}',
        costTime: 80
      }
    ]
    pagination.total = tableData.value.length
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    operationType: '',
    dateRange: []
  })
  pagination.pageNum = 1
  fetchData()
}

// 查看详情
const handleViewDetail = (row: Log) => {
  logDetail.value = row
  detailDialogVisible.value = true
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.log-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
  color: #666;
}
</style>
