<template>
  <div class="trainee-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学员管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddBatch">
              <el-icon><Plus /></el-icon>
              批量添加学员
            </el-button>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 课程选择 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="选择课程">
          <el-select v-model="searchForm.lessonId" placeholder="请选择课程" @change="handleLessonChange">
            <el-option label="新员工入职培训" :value="1" />
            <el-option label="技术技能提升培训" :value="2" />
            <el-option label="管理能力培训" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
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
        <el-table-column prop="workerName" label="学员姓名" width="120" />
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="jobName" label="岗位" width="120" />
        <el-table-column prop="lessonName" label="课程名称" width="200" />
        <el-table-column prop="enrollmentTime" label="报名时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
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
    
    <!-- 批量添加学员对话框 -->
    <el-dialog v-model="addDialogVisible" title="批量添加学员" width="800px">
      <el-form :model="addForm" label-width="120px">
        <el-form-item label="选择课程">
          <el-select v-model="addForm.lessonId" placeholder="请选择课程">
            <el-option label="新员工入职培训" :value="1" />
            <el-option label="技术技能提升培训" :value="2" />
            <el-option label="管理能力培训" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择员工">
          <el-transfer
            v-model="addForm.workerIds"
            :data="availableWorkers"
            :titles="['可选员工', '已选员工']"
            filterable
            filter-placeholder="请输入员工姓名"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd" :loading="addLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { traineeApi } from '@/api'

const loading = ref(false)
const addLoading = ref(false)
const addDialogVisible = ref(false)
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])

const searchForm = reactive({
  lessonId: 1
})

const addForm = reactive({
  lessonId: 1,
  workerIds: []
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const availableWorkers = ref([
  { key: 1, label: '张三' },
  { key: 2, label: '李四' },
  { key: 3, label: '王五' },
  { key: 4, label: '赵六' },
  { key: 5, label: '钱七' },
  { key: 6, label: '孙八' },
  { key: 7, label: '周九' },
  { key: 8, label: '吴十' }
])

// 获取学员列表
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      id: searchForm.lessonId,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    const response = await traineeApi.getByPage(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取学员列表失败:', error)
    // 使用模拟数据
    tableData.value = [
      {
        id: 1,
        workerName: '张三',
        departmentName: '技术部',
        jobName: '软件工程师',
        lessonName: '新员工入职培训',
        enrollmentTime: '2024-01-10',
        status: '已完成'
      },
      {
        id: 2,
        workerName: '李四',
        departmentName: '市场部',
        jobName: '市场专员',
        lessonName: '新员工入职培训',
        enrollmentTime: '2024-01-12',
        status: '进行中'
      },
      {
        id: 3,
        workerName: '王五',
        departmentName: '人事部',
        jobName: '人事专员',
        lessonName: '新员工入职培训',
        enrollmentTime: '2024-01-15',
        status: '已完成'
      }
    ]
    pagination.total = tableData.value.length
  } finally {
    loading.value = false
  }
}

// 课程变化
const handleLessonChange = () => {
  pagination.pageNum = 1
  fetchData()
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 批量添加学员
const handleAddBatch = () => {
  addDialogVisible.value = true
}

// 确认添加
const handleConfirmAdd = async () => {
  if (!addForm.lessonId || !addForm.workerIds.length) {
    ElMessage.warning('请选择课程和员工')
    return
  }
  
  addLoading.value = true
  try {
    const response = await traineeApi.addBatch({
      lesId: addForm.lessonId,
      workerIds: addForm.workerIds
    })
    if (response.code === 0) {
      ElMessage.success('批量添加成功')
      addDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(response.message || '批量添加失败')
    }
  } catch (error) {
    console.error('批量添加失败:', error)
    ElMessage.error('批量添加失败')
  } finally {
    addLoading.value = false
  }
}

// 删除学员
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该学员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await traineeApi.deleteBatch([row.id])
    if (response.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除学员失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个学员吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row.id)
    const response = await traineeApi.deleteBatch(ids)
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
.trainee-list {
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
