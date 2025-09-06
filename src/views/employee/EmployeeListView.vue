<template>
  <div class="employee-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>员工列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加员工
            </el-button>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出Excel
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="员工姓名">
          <el-input v-model="searchForm.name" placeholder="请输入员工姓名" clearable />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择部门" clearable>
            <el-option label="技术部" :value="1" />
            <el-option label="市场部" :value="2" />
            <el-option label="人事部" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作状态">
          <el-select v-model="searchForm.workStatus" placeholder="请选择工作状态" clearable>
            <el-option label="在任" :value="1" />
            <el-option label="离职" :value="0" />
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
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="degree" label="学历" width="100">
          <template #default="{ row }">
            {{ getDegreeText(row.degree) }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120">
          <template #default="{ row }">
            {{ getDepartmentName(row.department) }}
          </template>
        </el-table-column>
        <el-table-column prop="workStatus" label="工作状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.workStatus === 1 ? 'success' : 'danger'">
              {{ row.workStatus === 1 ? '在任' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="onboardingTime" label="入职时间" width="120" />
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
import { workerApi } from '@/api'
import type { Worker, WorkerQueryParams } from '@/types'

const router = useRouter()

const loading = ref(false)
const tableData = ref<Worker[]>([])
const selectedRows = ref<Worker[]>([])

const searchForm = reactive({
  name: '',
  department: undefined as number | undefined,
  workStatus: undefined as number | undefined
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 学历映射
const getDegreeText = (degree: number) => {
  const degreeMap: Record<number, string> = {
    1: '本科以上',
    2: '本科',
    3: '大专',
    4: '高中',
    5: '初中及以下'
  }
  return degreeMap[degree] || '未知'
}

// 部门映射
const getDepartmentName = (departmentId: number) => {
  const departmentMap: Record<number, string> = {
    1: '技术部',
    2: '市场部',
    3: '人事部',
    4: '财务部',
    5: '运营部',
    6: '客服部'
  }
  return departmentMap[departmentId] || '未知部门'
}

// 获取员工列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: WorkerQueryParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      id: searchForm.department || undefined
    }
    
    const response = await workerApi.getByPage(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败')
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
    department: undefined,
    workStatus: undefined
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加员工
const handleAdd = () => {
  router.push('/employee/add')
}

// 编辑员工
const handleEdit = (row: Worker) => {
  router.push(`/employee/edit/${row.id}`)
}

// 删除员工
const handleDelete = async (row: Worker) => {
  try {
    await ElMessageBox.confirm('确定要删除该员工吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await workerApi.delete(row.id)
    if (response.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除员工失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个员工吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row.id)
    const response = await workerApi.deleteBatch(ids)
    if (response.code === 0) {
      ElMessage.success('批量删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出Excel
const handleExport = async () => {
  try {
    const response = await workerApi.exportExcel()
    if (response.code === 0) {
      ElMessage.success('导出成功')
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 选择变化
const handleSelectionChange = (selection: Worker[]) => {
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
.employee-list {
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
</style>
