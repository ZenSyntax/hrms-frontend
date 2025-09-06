<template>
  <div class="department-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加部门
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="部门名称">
          <el-input v-model="searchForm.name" placeholder="请输入部门名称" clearable />
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
        <el-table-column prop="name" label="部门名称" width="150" />
        <el-table-column prop="supervisor" label="主管" width="120">
          <template #default="{ row }">
            {{ getSupervisorName(row.supervisor) }}
          </template>
        </el-table-column>
        <el-table-column prop="uperId" label="上级部门" width="120">
          <template #default="{ row }">
            {{ getParentDepartmentName(row.uperId) }}
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
import { departmentApi } from '@/api'
import type { Department } from '@/types'

const router = useRouter()

const loading = ref(false)
const tableData = ref<Department[]>([])

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 主管映射
const getSupervisorName = (supervisorId: number) => {
  const supervisorMap: Record<number, string> = {
    1: '张三',
    2: '李四',
    3: '王五',
    4: '赵六',
    5: '钱七',
    6: '孙八'
  }
  return supervisorMap[supervisorId] || '未设置'
}

// 上级部门映射
const getParentDepartmentName = (parentId: number) => {
  const parentMap: Record<number, string> = {
    0: '公司总部',
    1: '技术部',
    2: '市场部',
    3: '人事部',
    4: '财务部',
    5: '运营部',
    6: '客服部'
  }
  return parentMap[parentId] || '未知'
}

// 获取部门列表
const fetchData = async () => {
  loading.value = true
  try {
    // 模拟数据
    tableData.value = [
      { id: 1, name: '技术部', supervisor: 1, uperId: 0 },
      { id: 2, name: '市场部', supervisor: 2, uperId: 0 },
      { id: 3, name: '人事部', supervisor: 3, uperId: 0 },
      { id: 4, name: '财务部', supervisor: 4, uperId: 0 },
      { id: 5, name: '运营部', supervisor: 5, uperId: 0 },
      { id: 6, name: '客服部', supervisor: 6, uperId: 0 },
      { id: 7, name: '前端组', supervisor: 7, uperId: 1 },
      { id: 8, name: '后端组', supervisor: 8, uperId: 1 },
      { id: 9, name: '测试组', supervisor: 9, uperId: 1 }
    ]
    pagination.total = tableData.value.length
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
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
    name: ''
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加部门
const handleAdd = () => {
  router.push('/department/add')
}

// 编辑部门
const handleEdit = (row: Department) => {
  router.push(`/department/edit/${row.id}`)
}

// 删除部门
const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await departmentApi.delete(row.id)
    if (response.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除部门失败:', error)
      ElMessage.error('删除失败')
    }
  }
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
.department-list {
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
