<template>
  <div class="salary-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>薪资列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加薪资
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="薪资条ID">
          <el-input v-model="searchForm.id" placeholder="请输入薪资条ID" clearable type="number" />
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-input v-model="searchForm.name" placeholder="请输入员工姓名" clearable />
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
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="workerName" label="员工姓名" min-width="100" />
        <el-table-column prop="jobName" label="岗位" min-width="100" />
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
    
    <!-- 添加薪资悬浮窗 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加薪资"
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
            <el-form-item label="员工" prop="workerId">
              <el-select v-model="addForm.workerId" placeholder="请选择员工" @change="handleWorkerChange">
                <el-option 
                  v-for="worker in Array.from(workerCache.values())" 
                  :key="worker.id" 
                  :label="worker.name" 
                  :value="worker.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="jobId">
              <el-select v-model="addForm.jobId" placeholder="请选择岗位" @change="handleJobChange">
                <el-option 
                  v-for="job in jobList" 
                  :key="job.id" 
                  :label="job.name" 
                  :value="job.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结算时间" prop="settlementTime">
              <el-date-picker
                v-model="addForm.settlementTime"
                type="date"
                placeholder="请选择结算时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算周期" prop="cycle">
              <el-select v-model="addForm.cycle" placeholder="请选择结算周期">
                <el-option label="月结算" :value="1" />
                <el-option label="日结算" :value="2" />
                <el-option label="年结算" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基础工资">
              <el-input-number
                :model-value="baseSalary"
                :min="2000"
                :max="60000"
                :step="100"
                placeholder="基础工资"
                style="width: 100%"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资调整" prop="salaryOffset">
              <el-input-number
                v-model="addForm.salaryOffset"
                :min="-2000"
                :max="2000"
                :step="50"
                placeholder="请输入薪资调整"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="实际薪资">
          <el-input-number
            v-model="actualSalary"
            :min="2000"
            :max="60000"
            :step="100"
            placeholder="实际薪资"
            style="width: 100%"
            disabled
          />
          <div class="form-tip">
            实际薪资 = 基础工资 + 薪资调整
          </div>
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
    
    <!-- 编辑薪资悬浮窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑薪资"
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
            <el-form-item label="员工" prop="workerId">
              <el-select v-model="editForm.workerId" placeholder="请选择员工">
                <el-option 
                  v-for="worker in Array.from(workerCache.values())" 
                  :key="worker.id" 
                  :label="worker.name" 
                  :value="worker.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="jobId">
              <el-select v-model="editForm.jobId" placeholder="请选择岗位">
                <el-option 
                  v-for="job in jobList" 
                  :key="job.id" 
                  :label="job.name" 
                  :value="job.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结算时间" prop="settlementTime">
              <el-date-picker
                v-model="editForm.settlementTime"
                type="date"
                placeholder="请选择结算时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算周期" prop="cycle">
              <el-select v-model="editForm.cycle" placeholder="请选择结算周期">
                <el-option label="月结算" :value="1" />
                <el-option label="日结算" :value="2" />
                <el-option label="年结算" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基础工资">
              <el-input-number
                :model-value="editBaseSalary"
                :min="2000"
                :max="60000"
                :step="100"
                placeholder="基础工资"
                style="width: 100%"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资调整" prop="salaryOffset">
              <el-input-number
                v-model="editForm.salaryOffset"
                :min="-2000"
                :max="2000"
                :step="50"
                placeholder="请输入薪资调整"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="实际薪资">
          <el-input-number
            :model-value="editActualSalary"
            :min="2000"
            :max="60000"
            :step="100"
            placeholder="实际薪资"
            style="width: 100%"
            disabled
          />
          <div class="form-tip">
            实际薪资 = 基础工资 + 薪资调整
          </div>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { salaryApi, jobApi, workerApi } from '@/api'
import type { Salary, SalaryQueryParams, Job, Worker } from '@/types'

const loading = ref(false)
const tableData = ref<any[]>([])
const jobList = ref<Job[]>([])
const workerCache = ref<Map<number, Worker>>(new Map())

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

const addForm = reactive<Omit<Salary, 'id'>>({
  jobId: 1,
  workerId: 1,
  settlementTime: '',
  cycle: 1,
  salaryOffset: 0,
  salary: 0
})

const editForm = reactive<Salary>({
  id: 0,
  jobId: 1,
  workerId: 1,
  settlementTime: '',
  cycle: 1,
  salaryOffset: 0,
  salary: 0
})

const baseSalary = ref(5000)

const actualSalary = computed(() => {
  return baseSalary.value + (addForm.salaryOffset || 0)
})

// 编辑时的基础工资
const editBaseSalary = computed(() => {
  const job = jobList.value.find(j => j.id === editForm.jobId)
  return job?.salary || 0
})

// 编辑时的实际薪资
const editActualSalary = computed(() => {
  return editBaseSalary.value + (editForm.salaryOffset || 0)
})

const addFormRules: FormRules = {
  workerId: [
    { required: true, message: '请选择员工', trigger: 'change' }
  ],
  jobId: [
    { required: true, message: '请选择岗位', trigger: 'change' }
  ],
  settlementTime: [
    { required: true, message: '请选择结算时间', trigger: 'change' }
  ],
  cycle: [
    { required: true, message: '请选择结算周期', trigger: 'change' }
  ],
  salaryOffset: [
    { required: true, message: '请输入薪资调整', trigger: 'blur' }
  ]
}

const editFormRules: FormRules = {
  workerId: [
    { required: true, message: '请选择员工', trigger: 'change' }
  ],
  jobId: [
    { required: true, message: '请选择岗位', trigger: 'change' }
  ],
  settlementTime: [
    { required: true, message: '请选择结算时间', trigger: 'change' }
  ],
  cycle: [
    { required: true, message: '请选择结算周期', trigger: 'change' }
  ],
  salaryOffset: [
    { required: true, message: '请输入薪资调整', trigger: 'blur' }
  ]
}

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

// 获取岗位列表
const fetchJobList = async () => {
  try {
    const response = await jobApi.getAll()
    if (response.code === 0) {
      jobList.value = response.data
    }
  } catch (error) {
    console.error('获取岗位列表失败:', error)
  }
}

// 获取员工信息
const fetchWorkerInfo = async (workerId: number): Promise<Worker | null> => {
  if (workerCache.value.has(workerId)) {
    return workerCache.value.get(workerId)!
  }
  
  try {
    const response = await workerApi.getExact(workerId)
    if (response.code === 0) {
      const worker = response.data
      workerCache.value.set(workerId, worker)
      return worker
    }
  } catch (error) {
    console.error('获取员工信息失败:', error)
  }
  return null
}

// 获取薪资列表
const fetchData = async () => {
  loading.value = true
  try {
    let response
    
    // 如果有搜索条件，使用搜索接口
    if (searchForm.id || searchForm.name) {
      const params: SalaryQueryParams = {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        id: searchForm.id,
        name: searchForm.name || undefined
      }
      response = await salaryApi.getById(params)
    } else {
      // 否则使用分页查询接口
      const params = {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      }
      response = await salaryApi.getByPage(params)
    }
    
    if (response.code === 0) {
      const salaryItems = response.data.items || []
      
      // 为每个薪资条添加岗位名称、员工姓名和基础薪资
      const enrichedData = await Promise.all(
        salaryItems.map(async (item: any) => {
          const job = jobList.value.find(j => j.id === item.jobId)
          const worker = await fetchWorkerInfo(item.workerId)
          
          return {
            ...item,
            jobName: job?.name || '未知岗位',
            workerName: worker?.name || '未知员工',
            baseSalary: job?.salary || 0 // 从岗位信息中获取基础薪资
          }
        })
      )
      
      tableData.value = enrichedData
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
    id: undefined,
    name: ''
  })
  pagination.pageNum = 1
  fetchData()
}

// 员工变化
const handleWorkerChange = (workerId: number) => {
  // 根据员工获取岗位信息
  console.log('选择员工:', workerId)
}

// 岗位变化
const handleJobChange = (jobId: number) => {
  // 根据岗位获取基础工资
  const job = jobList.value.find(j => j.id === jobId)
  baseSalary.value = job?.salary || 5000
}

// 添加薪资提交
const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    addLoading.value = true
    
    // 根据接口文档，添加薪资时不需要传递salary字段，后端会自动计算
    const submitData = {
      jobId: addForm.jobId,
      workerId: addForm.workerId,
      settlementTime: addForm.settlementTime || '', // 空字符串，后端会自动设置
      cycle: addForm.cycle,
      salaryOffset: addForm.salaryOffset
    }
    
    const response = await salaryApi.add(submitData)
    if (response.code === 0) {
      ElMessage.success('添加薪资成功')
      showAddDialog.value = false
      resetAddForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '添加薪资失败')
    }
  } catch (error) {
    console.error('添加薪资失败:', error)
    ElMessage.error('添加薪资失败')
  } finally {
    addLoading.value = false
  }
}

// 重置添加表单
const resetAddForm = () => {
  Object.assign(addForm, {
    jobId: 1,
    workerId: 1,
    settlementTime: '',
    cycle: 1,
    salaryOffset: 0
  })
  baseSalary.value = 5000
  addFormRef.value?.resetFields()
}

// 悬浮窗关闭处理
const handleDialogClose = () => {
  resetAddForm()
}

const handleEditDialogClose = () => {
  resetEditForm()
}

// 编辑薪资提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editLoading.value = true
    
    // 根据接口文档，修改薪资时需要传递id字段
    const submitData = {
      id: editForm.id,
      jobId: editForm.jobId,
      workerId: editForm.workerId,
      settlementTime: editForm.settlementTime,
      cycle: editForm.cycle,
      salaryOffset: editForm.salaryOffset,
      salary: editForm.salary
    }
    
    const response = await salaryApi.update(submitData)
    if (response.code === 0) {
      ElMessage.success('修改薪资成功')
      showEditDialog.value = false
      resetEditForm()
      fetchData()
    } else {
      ElMessage.error(response.message || '修改薪资失败')
    }
  } catch (error) {
    console.error('修改薪资失败:', error)
    ElMessage.error('修改薪资失败')
  } finally {
    editLoading.value = false
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: 0,
    jobId: 1,
    workerId: 1,
    settlementTime: '',
    cycle: 1,
    salaryOffset: 0,
    salary: 0
  })
  editFormRef.value?.resetFields()
}

// 编辑薪资
const handleEdit = (row: any) => {
  // 填充编辑表单数据
  Object.assign(editForm, row)
  showEditDialog.value = true
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

onMounted(async () => {
  await fetchJobList()
  await fetchData()
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

.add-form {
  max-width: 100%;
}

.edit-form {
  max-width: 100%;
}

.dialog-footer {
  text-align: right;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
