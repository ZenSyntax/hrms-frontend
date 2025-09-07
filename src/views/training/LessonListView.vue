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
        <el-form-item label="课程ID">
          <el-input v-model="searchForm.id" placeholder="请输入课程ID" clearable />
        </el-form-item>
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
    
    <!-- 添加课程悬浮窗 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加课程"
      width="600px"
      :close-on-click-modal="true"
      @close="handleAddDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
        class="add-form"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        
        <el-form-item label="开始时间" prop="schedule">
          <el-date-picker
            v-model="addForm.schedule"
            type="date"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="持续天数" prop="timePlan">
          <el-input-number
            v-model="addForm.timePlan"
            :min="1"
            :max="30"
            placeholder="请输入持续天数"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="培训地点" prop="address">
          <el-input v-model="addForm.address" placeholder="请输入培训地点" />
        </el-form-item>
        
        <el-form-item label="课程介绍" prop="info">
          <el-input
            v-model="addForm.info"
            type="textarea"
            :rows="4"
            placeholder="请输入课程介绍"
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
    
    <!-- 编辑课程悬浮窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑课程"
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
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        
        <el-form-item label="开始时间" prop="schedule">
          <el-date-picker
            v-model="editForm.schedule"
            type="date"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="持续天数" prop="timePlan">
          <el-input-number
            v-model="editForm.timePlan"
            :min="1"
            :max="30"
            placeholder="请输入持续天数"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="培训地点" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入培训地点" />
        </el-form-item>
        
        <el-form-item label="课程介绍" prop="info">
          <el-input
            v-model="editForm.info"
            type="textarea"
            :rows="4"
            placeholder="请输入课程介绍"
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
import { lessonApi } from '@/api'
import type { Lesson, LessonQueryParams } from '@/types'

const loading = ref(false)
const tableData = ref<Lesson[]>([])

// 悬浮窗相关状态
const showAddDialog = ref(false)
const addLoading = ref(false)
const addFormRef = ref<FormInstance>()
const showEditDialog = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()

const addForm = reactive<Omit<Lesson, 'id'>>({
  name: '',
  schedule: '',
  timePlan: 1,
  address: '',
  info: ''
})

const editForm = reactive<Lesson>({
  id: 0,
  name: '',
  schedule: '',
  timePlan: 1,
  address: '',
  info: ''
})

const addFormRules: FormRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  schedule: [
    { required: true, message: '请输入开始时间', trigger: 'blur' }
  ],
  timePlan: [
    { required: true, message: '请输入持续天数', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入培训地点', trigger: 'blur' }
  ],
  info: [
    { required: true, message: '请输入课程介绍', trigger: 'blur' }
  ]
}

const editFormRules: FormRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  schedule: [
    { required: true, message: '请输入开始时间', trigger: 'blur' }
  ],
  timePlan: [
    { required: true, message: '请输入持续天数', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入培训地点', trigger: 'blur' }
  ],
  info: [
    { required: true, message: '请输入课程介绍', trigger: 'blur' }
  ]
}

const searchForm = reactive({
  id: '',
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
      id: searchForm.id ? Number(searchForm.id) : undefined,
      name: searchForm.name || undefined
    }
    
    const response = await lessonApi.getById(params)
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
    id: '',
    name: ''
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加课程
const handleAdd = () => {
  showAddDialog.value = true
}

// 添加课程提交
const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    addLoading.value = true
    
    const response = await lessonApi.add(addForm)
    if (response.code === 0) {
      ElMessage.success('添加课程成功')
      showAddDialog.value = false
      resetAddForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '添加课程失败')
    }
  } catch (error) {
    console.error('添加课程失败:', error)
    ElMessage.error('添加课程失败')
  } finally {
    addLoading.value = false
  }
}

// 编辑课程
const handleEdit = (row: Lesson) => {
  // 填充编辑表单数据
  Object.assign(editForm, row)
  showEditDialog.value = true
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


// 编辑课程提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editLoading.value = true
    
    const response = await lessonApi.update(editForm)
    if (response.code === 0) {
      ElMessage.success('修改课程成功')
      showEditDialog.value = false
      resetEditForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '修改课程失败')
    }
  } catch (error) {
    console.error('修改课程失败:', error)
    ElMessage.error('修改课程失败')
  } finally {
    editLoading.value = false
  }
}

// 重置添加表单
const resetAddForm = () => {
  Object.assign(addForm, {
    name: '',
    schedule: '',
    timePlan: 1,
    address: '',
    info: ''
  })
  addFormRef.value?.resetFields()
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: 0,
    name: '',
    schedule: '',
    timePlan: 1,
    address: '',
    info: ''
  })
  editFormRef.value?.resetFields()
}

// 添加悬浮窗关闭处理
const handleAddDialogClose = () => {
  resetAddForm()
}

// 编辑悬浮窗关闭处理
const handleEditDialogClose = () => {
  resetEditForm()
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

.edit-form {
  max-width: 100%;
}

.dialog-footer {
  text-align: right;
}
</style>
