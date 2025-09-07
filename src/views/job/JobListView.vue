<template>
  <div class="job-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>岗位列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加岗位
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="岗位编号">
          <el-input-number v-model="searchForm.id" placeholder="请输入岗位编号" clearable :min="1" style="width: 200px" />
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input v-model="searchForm.name" placeholder="请输入岗位名称" clearable />
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
        style="width: 100%"
        table-layout="auto"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="岗位名称" width="120" />
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
        <el-table-column prop="demand" label="岗位要求" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
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
    
    <!-- 添加岗位悬浮窗 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加岗位"
      width="600px"
      :close-on-click-modal="true"
      @close="handleDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
        class="add-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="name">
              <el-input v-model="addForm.name" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位类型" prop="type">
              <el-select v-model="addForm.type" placeholder="请选择岗位类型">
                <el-option label="正式工" :value="1" />
                <el-option label="临时工" :value="2" />
                <el-option label="实习生" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基础工资" prop="salary">
              <el-input-number
                v-model="addForm.salary"
                :min="2000"
                :max="60000"
                :step="100"
                placeholder="请输入基础工资"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加班工资" prop="overtimePay">
              <el-input-number
                v-model="addForm.overtimePay"
                :min="20"
                :max="100"
                :step="5"
                placeholder="请输入加班工资"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="岗位要求" prop="demand">
          <el-input
            v-model="addForm.demand"
            type="textarea"
            :rows="4"
            placeholder="请输入岗位要求"
          />
        </el-form-item>
        
        <el-form-item label="工作内容" prop="introduction">
          <el-input
            v-model="addForm.introduction"
            type="textarea"
            :rows="4"
            placeholder="请输入工作内容介绍"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit" :loading="addLoading">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑岗位悬浮窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑岗位"
      width="600px"
      :close-on-click-modal="true"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="120px"
        class="edit-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="name">
              <el-input v-model="editForm.name" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位类型" prop="type">
              <el-select v-model="editForm.type" placeholder="请选择岗位类型">
                <el-option label="正式工" :value="1" />
                <el-option label="临时工" :value="2" />
                <el-option label="实习生" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基础工资" prop="salary">
              <el-input-number
                v-model="editForm.salary"
                :min="2000"
                :max="60000"
                :step="100"
                placeholder="请输入基础工资"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加班工资" prop="overtimePay">
              <el-input-number
                v-model="editForm.overtimePay"
                :min="20"
                :max="100"
                :step="5"
                placeholder="请输入加班工资"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="岗位要求" prop="demand">
          <el-input
            v-model="editForm.demand"
            type="textarea"
            :rows="4"
            placeholder="请输入岗位要求"
          />
        </el-form-item>
        
        <el-form-item label="工作内容" prop="introduction">
          <el-input
            v-model="editForm.introduction"
            type="textarea"
            :rows="4"
            placeholder="请输入工作内容介绍"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit" :loading="editLoading">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { jobApi } from '@/api'
import type { Job, JobQueryParams } from '@/types'

const loading = ref(false)
const tableData = ref<Job[]>([])

const searchForm = reactive({
  id: undefined as number | undefined,
  name: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 悬浮窗相关状态
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const addLoading = ref(false)
const editLoading = ref(false)
const addFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

const addForm = reactive<Omit<Job, 'id'>>({
  name: '',
  demand: '',
  type: 1,
  salary: 5000,
  overtimePay: 50,
  introduction: ''
})

const editForm = reactive<Job>({
  id: 0,
  name: '',
  demand: '',
  type: 1,
  salary: 5000,
  overtimePay: 50,
  introduction: ''
})

const addFormRules: FormRules = {
  name: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' }
  ],
  demand: [
    { required: true, message: '请输入岗位要求', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择岗位类型', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '请输入基础工资', trigger: 'blur' }
  ],
  overtimePay: [
    { required: true, message: '请输入加班工资', trigger: 'blur' }
  ],
  introduction: [
    { required: true, message: '请输入工作内容介绍', trigger: 'blur' }
  ]
}

const editFormRules: FormRules = {
  name: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' }
  ],
  demand: [
    { required: true, message: '请输入岗位要求', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择岗位类型', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '请输入基础工资', trigger: 'blur' }
  ],
  overtimePay: [
    { required: true, message: '请输入加班工资', trigger: 'blur' }
  ],
  introduction: [
    { required: true, message: '请输入工作内容介绍', trigger: 'blur' }
  ]
}

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
      id: searchForm.id,
      name: searchForm.name || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    const response = await jobApi.getById(params)
    if (response.code === 0) {
      // 如果返回的是分页数据
      if (response.data && typeof response.data === 'object' && 'items' in response.data) {
        tableData.value = response.data.items
        pagination.total = response.data.total
      } else if (Array.isArray(response.data)) {
        // 如果返回的是数组
        tableData.value = response.data
        pagination.total = (response.data as any[]).length
      } else if (response.data) {
        // 如果返回的是单个对象
        tableData.value = [response.data]
        pagination.total = 1
      } else {
        tableData.value = []
        pagination.total = 0
      }
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

// 重置搜索条件
const handleReset = () => {
  searchForm.id = undefined
  searchForm.name = ''
  pagination.pageNum = 1
  fetchData()
}


// 添加岗位提交
const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    addLoading.value = true
    
    const response = await jobApi.add(addForm)
    if (response.code === 0) {
      ElMessage.success('添加岗位成功')
      showAddDialog.value = false
      resetAddForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '添加岗位失败')
    }
  } catch (error) {
    console.error('添加岗位失败:', error)
    ElMessage.error('添加岗位失败')
  } finally {
    addLoading.value = false
  }
}

// 重置添加表单
const resetAddForm = () => {
  Object.assign(addForm, {
    name: '',
    demand: '',
    type: 1,
    salary: 5000,
    overtimePay: 50,
    introduction: ''
  })
  addFormRef.value?.resetFields()
}

// 悬浮窗关闭处理
const handleDialogClose = () => {
  resetAddForm()
}

const handleEditDialogClose = () => {
  resetEditForm()
}

// 编辑岗位提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editLoading.value = true
    
    const response = await jobApi.update(editForm)
    if (response.code === 0) {
      ElMessage.success('修改岗位成功')
      showEditDialog.value = false
      resetEditForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '修改岗位失败')
    }
  } catch (error) {
    console.error('修改岗位失败:', error)
    ElMessage.error('修改岗位失败')
  } finally {
    editLoading.value = false
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: 0,
    name: '',
    demand: '',
    type: 1,
    salary: 5000,
    overtimePay: 50,
    introduction: ''
  })
  editFormRef.value?.resetFields()
}

// 编辑岗位
const handleEdit = (row: Job) => {
  // 填充编辑表单数据
  Object.assign(editForm, row)
  showEditDialog.value = true
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
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
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

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}

:deep(.el-table__header-wrapper) {
  overflow-x: hidden;
}

:deep(.el-card__body) {
  overflow-x: hidden;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.add-form {
  max-width: 100%;
}

.edit-form {
  max-width: 100%;
}

.dialog-footer {
  text-align: right;
}
</style>
