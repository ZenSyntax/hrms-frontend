<template>
  <div class="job-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>岗位列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加岗位
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
        <el-form-item label="岗位名称">
          <el-input v-model="searchForm.name" placeholder="请输入岗位名称" clearable />
        </el-form-item>
        <el-form-item label="岗位类型">
          <el-select v-model="searchForm.type" placeholder="请选择岗位类型" clearable>
            <el-option label="正式工" :value="1" />
            <el-option label="临时工" :value="2" />
            <el-option label="实习生" :value="3" />
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
        <el-table-column prop="name" label="岗位名称" width="150" />
        <el-table-column prop="type" label="岗位类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="基础工资" width="120">
          <template #default="{ row }">
            ¥{{ row.salary.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="overtimePay" label="加班工资" width="120">
          <template #default="{ row }">
            ¥{{ row.overtimePay }}/小时
          </template>
        </el-table-column>
        <el-table-column prop="totalWorker" label="在职人数" width="100" />
        <el-table-column prop="demand" label="岗位要求" min-width="200" show-overflow-tooltip />
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
import { jobApi } from '@/api'
import type { Job, JobQueryParams } from '@/types'

const router = useRouter()

const loading = ref(false)
const tableData = ref<Job[]>([])
const selectedRows = ref<Job[]>([])

const searchForm = reactive({
  name: '',
  type: undefined as number | undefined
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 岗位类型映射
const getTypeText = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '正式工',
    2: '临时工',
    3: '实习生'
  }
  return typeMap[type] || '未知'
}

const getTypeTagType = (type: number) => {
  const tagTypeMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return tagTypeMap[type] || ''
}

// 获取岗位列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: JobQueryParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      id: searchForm.type || undefined
    }
    
    const response = await jobApi.getByPage(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取岗位列表失败:', error)
    ElMessage.error('获取岗位列表失败')
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
    type: undefined
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加岗位
const handleAdd = () => {
  router.push('/job/add')
}

// 编辑岗位
const handleEdit = (row: Job) => {
  router.push(`/job/edit/${row.id}`)
}

// 删除岗位
const handleDelete = async (row: Job) => {
  try {
    await ElMessageBox.confirm('确定要删除该岗位吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await jobApi.delete(row.id)
    if (response.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除岗位失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个岗位吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
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
const handleSelectionChange = (selection: Job[]) => {
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
.job-list {
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
