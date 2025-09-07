<template>
  <div class="department-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加部门
            </el-button>
            <el-button @click="fetchData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="部门名称">
          <el-input v-model="searchForm.name" placeholder="请输入部门名称" clearable @keyup.enter="handleSearch" />
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
      
      <!-- 部门树形表格 -->
      <el-table
        v-loading="loading"
        :data="filteredTableData"
        stripe
        border
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        class="department-tree-table"
      >
        <el-table-column prop="name" label="部门名称" min-width="200">
          <template #default="{ row }">
            <div class="department-name">
              <el-icon class="department-icon">
                <OfficeBuilding />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="supervisor" label="主管" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.supervisor > 0" type="primary" size="small">
              {{ getSupervisorNameSync(row.supervisor) }}
            </el-tag>
            <el-tag v-else type="info" size="small">未设置</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uperId" label="上级部门" width="150">
          <template #default="{ row }">
            <span v-if="row.uperId > 0">{{ getParentDepartmentName(row.uperId) }}</span>
            <el-tag v-else type="success" size="small">顶级部门</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="部门层级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)" size="small">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加部门悬浮窗 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加部门"
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
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="addForm.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主管" prop="supervisor">
              <el-select v-model="addForm.supervisor" placeholder="请选择主管">
                <el-option label="未设置" :value="0" />
                <el-option label="张三" :value="1" />
                <el-option label="李四" :value="2" />
                <el-option label="王五" :value="3" />
                <el-option label="赵六" :value="4" />
                <el-option label="钱七" :value="5" />
                <el-option label="孙八" :value="6" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="上级部门" prop="uperId">
          <el-select v-model="addForm.uperId" placeholder="请选择上级部门">
            <el-option label="顶级部门" :value="0" />
            <el-option 
              v-for="dept in allDepartments" 
              :key="dept.id" 
              :label="dept.name" 
              :value="dept.id" 
            />
          </el-select>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { departmentApi, workerApi } from '@/api'
import type { Department } from '@/types'

const router = useRouter()

const loading = ref(false)
const tableData = ref<Department[]>([])
const allDepartments = ref<Department[]>([])

// 主管信息缓存
const supervisorCache = ref<Record<number, string>>({})
const supervisorLoading = ref<Set<number>>(new Set())

const searchForm = reactive({
  name: ''
})

// 扩展部门类型，添加层级和子部门信息
interface ExtendedDepartment extends Department {
  level: number
  children?: ExtendedDepartment[]
  hasChildren?: boolean
}

// 计算属性：过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchForm.name) {
    return tableData.value
  }
  return filterDepartments(tableData.value, searchForm.name)
})

// 悬浮窗相关状态
const showAddDialog = ref(false)
const addLoading = ref(false)
const addFormRef = ref<FormInstance>()

const addForm = reactive<Omit<Department, 'id'>>({
  name: '',
  supervisor: 0,
  uperId: 0
})

const addFormRules: FormRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  supervisor: [
    { required: true, message: '请选择主管', trigger: 'change' }
  ],
  uperId: [
    { required: true, message: '请选择上级部门', trigger: 'change' }
  ]
}

// 构建部门树形结构
const buildDepartmentTree = (departments: Department[]): ExtendedDepartment[] => {
  const departmentMap = new Map<number, ExtendedDepartment>()
  const rootDepartments: ExtendedDepartment[] = []
  
  // 创建部门映射
  departments.forEach(dept => {
    departmentMap.set(dept.id, {
      ...dept,
      level: 0,
      children: [],
      hasChildren: false
    })
  })
  
  // 构建树形结构
  departments.forEach(dept => {
    const extendedDept = departmentMap.get(dept.id)!
    
    if (dept.uperId === 0) {
      // 顶级部门
      extendedDept.level = 1
      rootDepartments.push(extendedDept)
    } else {
      // 子部门
      const parent = departmentMap.get(dept.uperId)
      if (parent) {
        extendedDept.level = parent.level + 1
        parent.children!.push(extendedDept)
        parent.hasChildren = true
      }
    }
  })
  
  return rootDepartments
}

// 过滤部门数据
const filterDepartments = (departments: ExtendedDepartment[], keyword: string): ExtendedDepartment[] => {
  const result: ExtendedDepartment[] = []
  
  const filterRecursive = (depts: ExtendedDepartment[]): ExtendedDepartment[] => {
    return depts.filter(dept => {
      const matches = dept.name.toLowerCase().includes(keyword.toLowerCase())
      const filteredChildren = dept.children ? filterRecursive(dept.children) : []
      
      if (matches || filteredChildren.length > 0) {
        return {
          ...dept,
          children: filteredChildren
        }
      }
      return false
    })
  }
  
  return filterRecursive(departments)
}

// 获取主管姓名 - 通过API获取
const getSupervisorName = async (supervisorId: number): Promise<string> => {
  // 如果缓存中已有，直接返回
  if (supervisorCache.value[supervisorId]) {
    return supervisorCache.value[supervisorId]
  }
  
  // 如果正在加载中，返回加载状态
  if (supervisorLoading.value.has(supervisorId)) {
    return '加载中...'
  }
  
  try {
    // 标记为加载中
    supervisorLoading.value.add(supervisorId)
    
    // 调用API获取员工信息
    const response = await workerApi.getExact(supervisorId)
    
    if (response.code === 0 && response.data && response.data.name) {
      // 缓存结果
      supervisorCache.value[supervisorId] = response.data.name
      return response.data.name
    } else {
      return `员工${supervisorId}`
    }
  } catch (error) {
    console.error('获取主管信息失败:', error)
    return `员工${supervisorId}`
  } finally {
    // 移除加载状态
    supervisorLoading.value.delete(supervisorId)
  }
}

// 同步获取主管姓名（用于模板显示）
const getSupervisorNameSync = (supervisorId: number): string => {
  return supervisorCache.value[supervisorId] || '加载中...'
}

// 上级部门映射 - 根据实际数据动态获取
const getParentDepartmentName = (parentId: number) => {
  const parentDept = allDepartments.value.find(dept => dept.id === parentId)
  return parentDept ? parentDept.name : '未知部门'
}

// 获取层级标签类型
const getLevelTagType = (level: number) => {
  const types = ['', 'success', 'warning', 'danger', 'info']
  return types[level] || 'info'
}

// 获取层级文本
const getLevelText = (level: number) => {
  const texts = ['', '一级', '二级', '三级', '四级', '五级']
  return texts[level] || `${level}级`
}

// 预加载主管信息
const preloadSupervisorInfo = async (departments: Department[]) => {
  const supervisorIds = departments
    .map(dept => dept.supervisor)
    .filter(id => id > 0)
    .filter((id, index, arr) => arr.indexOf(id) === index) // 去重
  
  // 并发获取所有主管信息
  const promises = supervisorIds.map(async (supervisorId) => {
    if (!supervisorCache.value[supervisorId]) {
      try {
        const response = await workerApi.getExact(supervisorId)
        if (response.code === 0 && response.data && response.data.name) {
          supervisorCache.value[supervisorId] = response.data.name
        }
      } catch (error) {
        console.error(`获取主管${supervisorId}信息失败:`, error)
      }
    }
  })
  
  await Promise.all(promises)
}

// 获取部门列表
const fetchData = async () => {
  loading.value = true
  try {
    const response = await departmentApi.getAll()
    if (response.code === 0) {
      allDepartments.value = response.data
      tableData.value = buildDepartmentTree(response.data)
      
      // 预加载主管信息
      await preloadSupervisorInfo(response.data)
      
      ElMessage.success('获取部门列表成功')
    } else {
      ElMessage.error(response.message || '获取部门列表失败')
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 搜索功能由计算属性 filteredTableData 自动处理
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: ''
  })
}

// 添加部门提交
const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    addLoading.value = true
    
    const response = await departmentApi.add(addForm)
    if (response.code === 0) {
      ElMessage.success('添加部门成功')
      showAddDialog.value = false
      resetAddForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '添加部门失败')
    }
  } catch (error) {
    console.error('添加部门失败:', error)
    ElMessage.error('添加部门失败')
  } finally {
    addLoading.value = false
  }
}

// 重置添加表单
const resetAddForm = () => {
  Object.assign(addForm, {
    name: '',
    supervisor: 0,
    uperId: 0
  })
  addFormRef.value?.resetFields()
}

// 悬浮窗关闭处理
const handleDialogClose = () => {
  resetAddForm()
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

.department-tree-table {
  margin-top: 20px;
}

.department-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.department-icon {
  color: #409eff;
  font-size: 16px;
}

.add-form {
  max-width: 100%;
}

.dialog-footer {
  text-align: right;
}

/* 树形表格样式优化 */
:deep(.el-table__row) {
  transition: background-color 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table__expand-icon) {
  color: #409eff;
}

:deep(.el-table__expand-icon--expanded) {
  transform: rotate(90deg);
}

/* 部门层级缩进 */
:deep(.el-table__indent) {
  padding-left: 20px;
}

/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
  font-weight: 500;
}

/* 按钮组样式 */
:deep(.el-button + .el-button) {
  margin-left: 8px;
}
</style>
