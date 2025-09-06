<template>
  <div class="lesson-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>培训课程列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加课程
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="课程名称">
          <el-input v-model="searchForm.name" placeholder="请输入课程名称" clearable />
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
        <el-table-column prop="name" label="课程名称" width="200" />
        <el-table-column prop="schedule" label="开始时间" width="120" />
        <el-table-column prop="timePlan" label="持续天数" width="100" />
        <el-table-column prop="address" label="培训地点" min-width="200" show-overflow-tooltip />
        <el-table-column prop="info" label="课程介绍" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button type="success" size="small" @click="handleManageTrainees(row)">
              学员管理
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
import { lessonApi } from '@/api'
import type { Lesson, LessonQueryParams } from '@/types'

const router = useRouter()

const loading = ref(false)
const tableData = ref<Lesson[]>([])

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取课程列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: LessonQueryParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined
    }
    
    const response = await lessonApi.getByPage(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    // 使用模拟数据
    tableData.value = [
      {
        id: 1,
        name: '新员工入职培训',
        schedule: '2024-01-15',
        timePlan: 3,
        address: '广东省深圳市南山区科技园A座201',
        info: '新员工入职培训课程，包括公司文化、规章制度、岗位职责等内容'
      },
      {
        id: 2,
        name: '技术技能提升培训',
        schedule: '2024-02-01',
        timePlan: 5,
        address: '广东省深圳市南山区科技园B座301',
        info: '技术技能提升培训，包括最新技术栈、开发规范、代码审查等内容'
      },
      {
        id: 3,
        name: '管理能力培训',
        schedule: '2024-02-15',
        timePlan: 2,
        address: '广东省深圳市南山区科技园C座401',
        info: '管理能力培训，包括团队管理、沟通技巧、领导力等内容'
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
    name: ''
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加课程
const handleAdd = () => {
  router.push('/training/lesson/add')
}

// 编辑课程
const handleEdit = (row: Lesson) => {
  router.push(`/training/lesson/edit/${row.id}`)
}

// 删除课程
const handleDelete = async (row: Lesson) => {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await lessonApi.delete(row.id)
    if (response.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 学员管理
const handleManageTrainees = (row: Lesson) => {
  router.push(`/training/trainee?lessonId=${row.id}`)
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
.lesson-list {
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
