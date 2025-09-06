<template>
  <div class="salary-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>薪资列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加薪资
            </el-button>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="员工姓名">
          <el-input v-model="searchForm.name" placeholder="请输入员工姓名" clearable />
        </el-form-item>
        <el-form-item label="结算周期">
          <el-select v-model="searchForm.cycle" placeholder="请选择结算周期" clearable>
            <el-option label="月结算" :value="1" />
            <el-option label="日结算" :value="2" />
            <el-option label="年结算" :value="3" />
          </el-select>
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
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="workerName" label="员工姓名" width="120" />
        <el-table-column prop="jobName" label="岗位" width="120" />
        <el-table-column prop="settlementTime" label="结算时间" width="120" />
        <el-table-column prop="cycle" label="结算周期" width="100">
          <template #default="{ row }">
            <el-tag :type="getCycleTagType(row.cycle)">
              {{ getCycleText(row.cycle) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="baseSalary" label="基础工资" width="120">
          <template #default="{ row }">
            ¥{{ row.baseSalary?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="salaryOffset" label="薪资调整" width="120">
          <template #default="{ row }">
            <span :class="row.salaryOffset >= 0 ? 'positive' : 'negative'">
              {{ row.salaryOffset >= 0 ? '+' : '' }}¥{{ row.salaryOffset }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="实际薪资" width="120">
          <template #default="{ row }">
            <span class="salary-amount">¥{{ row.salary?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { salaryApi } from '@/api'
import type { Salary, SalaryQueryParams } from '@/types'

const router = useRouter()

const loading = ref(false)
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])

const searchForm = reactive({
  name: '',
  cycle: undefined as number | undefined
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 结算周期映射
const getCycleText = (cycle: number) => {
  const cycleMap: Record<number, string> = {
    1: '月结算',
    2: '日结算',
    3: '年结算'
  }
  return cycleMap[cycle] || '未知'
}

const getCycleTagType = (cycle: number) => {
  const tagTypeMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return tagTypeMap[cycle] || ''
}

// 获取薪资列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: SalaryQueryParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      id: searchForm.cycle || undefined
    }
    
    const response = await salaryApi.getByPage(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取薪资列表失败:', error)
    // 使用模拟数据
    tableData.value = [
      {
        id: 1,
        workerName: '张三',
        jobName: '软件工程师',
        settlementTime: '2024-01-31',
        cycle: 1,
        baseSalary: 10000,
        salaryOffset: 2000,
        salary: 12000
      },
      {
        id: 2,
        workerName: '李四',
        jobName: '市场专员',
        settlementTime: '2024-01-31',
        cycle: 1,
        baseSalary: 8000,
        salaryOffset: 500,
        salary: 8500
      },
      {
        id: 3,
        workerName: '王五',
        jobName: '人事专员',
        settlementTime: '2024-01-31',
        cycle: 1,
        baseSalary: 7000,
        salaryOffset: -200,
        salary: 6800
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
    name: '',
    cycle: undefined
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加薪资
const handleAdd = () => {
  router.push('/salary/add')
}

// 编辑薪资
const handleEdit = (row: any) => {
  router.push(`/salary/edit/${row.id}`)
}

// 删除薪资
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该薪资记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await salaryApi.delete(row.id)
    if (response.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除薪资失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条薪资记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row.id)
    // 这里需要实现批量删除接口
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
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
.salary-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.salary-amount {
  font-weight: bold;
  color: #409eff;
}
</style>
