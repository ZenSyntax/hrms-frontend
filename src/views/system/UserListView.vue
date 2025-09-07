<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="用户名" min-width="200" />
        <el-table-column prop="worker" label="关联员工ID" min-width="200">
          <template #default="{ row }">
            {{ row.worker || '未关联' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
              :disabled="row.name === 'admin' || row.name === 'leader'"
            >
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

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加用户"
      width="500px"
      @close="resetAddForm"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="addForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
          />
        </el-form-item>
        <el-form-item label="员工ID" prop="workerId">
          <el-input 
            v-model="addForm.workerId" 
            type="number" 
            placeholder="请输入员工ID" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdd" :loading="addLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { userApi } from '@/api'

const loading = ref(false)
const tableData = ref<any[]>([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 添加用户相关
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref<FormInstance>()
const addForm = reactive({
  name: '',
  password: '',
  workerId: ''
})

const addFormRules: FormRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  workerId: [
    { required: true, message: '请输入员工ID', trigger: 'blur' }
  ]
}

// 获取用户列表
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    const response = await userApi.getList(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 添加用户
const handleAdd = () => {
  addDialogVisible.value = true
}

// 提交添加用户
const submitAdd = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    addLoading.value = true
    
    const response = await userApi.add({
      name: addForm.name,
      password: addForm.password,
      worker: parseInt(addForm.workerId)
    })
    
    if (response.code === 0) {
      ElMessage.success('添加成功')
      addDialogVisible.value = false
      resetAddForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加用户失败:', error)
    ElMessage.error('添加失败')
  } finally {
    addLoading.value = false
  }
}

// 重置添加表单
const resetAddForm = () => {
  addForm.name = ''
  addForm.password = ''
  addForm.workerId = ''
  addFormRef.value?.resetFields()
}

// 删除用户
const handleDelete = async (row: any) => {
  // 检查是否为admin或leader用户
  if (row.name === 'admin' || row.name === 'leader') {
    ElMessage.warning('admin和leader用户不可删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await userApi.delete(row.id)
    if (response.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
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
.user-list {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 确保表格容器占满宽度 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  width: 100% !important;
}
</style>
