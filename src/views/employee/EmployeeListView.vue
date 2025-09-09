<template>
  <div class="employee-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>员工列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog = true">
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
        <el-form-item label="员工ID">
          <el-input v-model="searchForm.id" placeholder="请输入员工ID" clearable />
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-input v-model="searchForm.name" placeholder="请输入员工姓名" clearable />
        </el-form-item>
        <el-form-item label="岗位筛选">
          <el-select 
            v-model="searchForm.selectedJobId" 
            placeholder="请选择岗位" 
            clearable
            @change="handleJobFilter"
            style="width: 200px"
          >
            <el-option 
              v-for="job in jobList" 
              :key="job.id" 
              :label="job.name" 
              :value="job.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="tableData"
          @selection-change="handleSelectionChange"
          stripe
          border
          style="width: 100%"
          :table-layout="'auto'"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column prop="gender" label="性别" width="80">
            <template #default="{ row }">
              {{ Number(row.gender) === 1 ? '男' : Number(row.gender) === 2 ? '女' : '未知' }}
            </template>
          </el-table-column>
          <el-table-column prop="degree" label="学历" min-width="100">
            <template #default="{ row }">
              {{ getDegreeText(row.degree) }}
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" min-width="120">
            <template #default="{ row }">
              {{ getDepartmentName(row.department) }}
            </template>
          </el-table-column>
          <el-table-column prop="job" label="工作岗位" min-width="120">
            <template #default="{ row }">
              {{ getJobName(row.job) }}
            </template>
          </el-table-column>
          <el-table-column prop="workStatus" label="工作状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.workStatus === 1 ? 'success' : 'danger'">
                {{ row.workStatus === 1 ? '在任' : '离职' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="onboardingTime" label="入职时间" min-width="120" />
          <el-table-column prop="departureTime" label="离职时间" width="100">
            <template #default="{ row }">
              {{ row.departureTime ? row.departureTime : '未离职' }}
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
      </div>
      
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
    
    <!-- 添加员工悬浮窗 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加员工"
      width="800px"
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
            <el-form-item label="员工姓名" prop="name">
              <el-input v-model="addForm.name" placeholder="请输入员工姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="addForm.gender" placeholder="请选择性别">
                <el-option label="女" :value="2" />
                <el-option label="男" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历" prop="degree">
              <el-select v-model="addForm.degree" placeholder="请选择学历">
                <el-option label="本科以上" :value="1" />
                <el-option label="本科" :value="2" />
                <el-option label="大专" :value="3" />
                <el-option label="高中" :value="4" />
                <el-option label="初中及以下" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="addForm.birthday"
                type="date"
                placeholder="请选择生日"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社保缴纳" prop="socialSecurity">
              <el-select v-model="addForm.socialSecurity" placeholder="请选择社保缴纳情况">
                <el-option label="未缴" :value="0" />
                <el-option label="已缴" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作状态" prop="workStatus">
              <el-select v-model="addForm.workStatus" placeholder="请选择工作状态">
                <el-option label="离职" :value="0" />
                <el-option label="在任" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用工类型" prop="laborStatus">
              <el-select v-model="addForm.laborStatus" placeholder="请选择用工类型">
                <el-option label="正式工" :value="1" />
                <el-option label="临时工" :value="2" />
                <el-option label="实习生" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="job">
              <el-select v-model="addForm.job" placeholder="请选择岗位">
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
            <el-form-item label="部门" prop="department">
              <el-select v-model="addForm.department" placeholder="请选择部门">
                <el-option 
                  v-for="department in departmentList" 
                  :key="department.id" 
                  :label="department.name" 
                  :value="department.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职时间" prop="onboardingTime">
              <el-date-picker
                v-model="addForm.onboardingTime"
                type="date"
                placeholder="请选择入职时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="奖惩记录">
          <el-input
            v-model="addForm.rpRecord"
            type="textarea"
            :rows="3"
            placeholder="请输入奖惩记录"
          />
        </el-form-item>
        
        <el-form-item label="调动记录">
          <el-input
            v-model="addForm.transfer"
            type="textarea"
            :rows="3"
            placeholder="请输入调动记录"
          />
        </el-form-item>
        
        <el-form-item label="技能证书">
          <el-input
            v-model="addForm.certificate"
            type="textarea"
            :rows="3"
            placeholder="请输入技能证书"
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
    
    <!-- 编辑员工悬浮窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑员工"
      width="800px"
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
            <el-form-item label="员工姓名" prop="name">
              <el-input v-model="editForm.name" placeholder="请输入员工姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="editForm.gender" placeholder="请选择性别">
                <el-option label="女" :value="2" />
                <el-option label="男" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历" prop="degree">
              <el-select v-model="editForm.degree" placeholder="请选择学历">
                <el-option label="本科以上" :value="1" />
                <el-option label="本科" :value="2" />
                <el-option label="大专" :value="3" />
                <el-option label="高中" :value="4" />
                <el-option label="初中及以下" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="editForm.birthday"
                type="date"
                placeholder="请选择生日"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社保缴纳" prop="socialSecurity">
              <el-select v-model="editForm.socialSecurity" placeholder="请选择社保缴纳情况">
                <el-option label="未缴" :value="0" />
                <el-option label="已缴" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作状态" prop="workStatus">
              <el-select v-model="editForm.workStatus" placeholder="请选择工作状态">
                <el-option label="离职" :value="0" />
                <el-option label="在任" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用工类型" prop="laborStatus">
              <el-select v-model="editForm.laborStatus" placeholder="请选择用工类型">
                <el-option label="正式工" :value="1" />
                <el-option label="临时工" :value="2" />
                <el-option label="实习生" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="job">
              <el-select v-model="editForm.job" placeholder="请选择岗位">
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
            <el-form-item label="部门" prop="department">
              <el-select v-model="editForm.department" placeholder="请选择部门">
                <el-option 
                  v-for="department in departmentList" 
                  :key="department.id" 
                  :label="department.name" 
                  :value="department.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职时间" prop="onboardingTime">
              <el-date-picker
                v-model="editForm.onboardingTime"
                type="date"
                placeholder="请选择入职时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="奖惩记录">
          <el-input
            v-model="editForm.rpRecord"
            type="textarea"
            :rows="3"
            placeholder="请输入奖惩记录"
          />
        </el-form-item>
        
        <el-form-item label="调动记录">
          <el-input
            v-model="editForm.transfer"
            type="textarea"
            :rows="3"
            placeholder="请输入调动记录"
          />
        </el-form-item>
        
        <el-form-item label="技能证书">
          <el-input
            v-model="editForm.certificate"
            type="textarea"
            :rows="3"
            placeholder="请输入技能证书"
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
import { Search, Plus, Delete, Download, Refresh } from '@element-plus/icons-vue'
import { workerApi, jobApi, departmentApi } from '@/api'
import { useDataRefreshStore } from '@/stores'
import { exportWorkersWithDetailsToExcel } from '@/utils/excel'
import type { Worker, WorkerQueryParams, Job, Department } from '@/types'

const loading = ref(false)
const tableData = ref<Worker[]>([])
const selectedRows = ref<Worker[]>([])

// 获取数据刷新store
const dataRefreshStore = useDataRefreshStore()

// 部门和岗位列表
const departmentList = ref<Department[]>([])
const jobList = ref<Job[]>([])

const searchForm = reactive({
  id: '',
  name: '',
  selectedJobId: null as number | null
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

const addForm = reactive<Omit<Worker, 'id'>>({
  name: '',
  gender: 1, // 默认选择男
  degree: 2,
  birthday: '',
  socialSecurity: 1,
  rpRecord: '',
  transfer: '',
  workStatus: 1,
  certificate: '',
  laborStatus: 1,
  job: 1,
  department: 1,
  onboardingTime: '',
  departureTime: ''
})

const editForm = reactive<Worker>({
  id: 0,
  name: '',
  gender: 1, // 默认选择男
  degree: 2,
  birthday: '',
  socialSecurity: 1,
  rpRecord: '',
  transfer: '',
  workStatus: 1,
  certificate: '',
  laborStatus: 1,
  job: 1,
  department: 1,
  onboardingTime: '',
  departureTime: ''
})

const addFormRules: FormRules = {
  name: [
    { required: true, message: '请输入员工姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  degree: [
    { required: true, message: '请选择学历', trigger: 'change' }
  ],
  birthday: [
    { required: true, message: '请选择生日', trigger: 'change' }
  ],
  socialSecurity: [
    { required: true, message: '请选择社保缴纳情况', trigger: 'change' }
  ],
  workStatus: [
    { required: true, message: '请选择工作状态', trigger: 'change' }
  ],
  laborStatus: [
    { required: true, message: '请选择用工类型', trigger: 'change' }
  ],
  job: [
    { required: true, message: '请选择岗位', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  onboardingTime: [
    { required: true, message: '请选择入职时间', trigger: 'change' }
  ]
}

const editFormRules: FormRules = {
  name: [
    { required: true, message: '请输入员工姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  degree: [
    { required: true, message: '请选择学历', trigger: 'change' }
  ],
  birthday: [
    { required: true, message: '请选择生日', trigger: 'change' }
  ],
  socialSecurity: [
    { required: true, message: '请选择社保缴纳情况', trigger: 'change' }
  ],
  workStatus: [
    { required: true, message: '请选择工作状态', trigger: 'change' }
  ],
  laborStatus: [
    { required: true, message: '请选择用工类型', trigger: 'change' }
  ],
  job: [
    { required: true, message: '请选择岗位', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  onboardingTime: [
    { required: true, message: '请选择入职时间', trigger: 'change' }
  ]
}

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

// 获取部门列表
const fetchDepartmentList = async () => {
  try {
    const response = await departmentApi.getAll()
    if (response.code === 0) {
      departmentList.value = response.data
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    // 如果API调用失败，使用模拟数据作为备选
    departmentList.value = [
      { id: 1, name: '技术部', supervisor: 0, uperId: 0 },
      { id: 2, name: '市场部', supervisor: 0, uperId: 0 },
      { id: 3, name: '人事部', supervisor: 0, uperId: 0 },
      { id: 4, name: '财务部', supervisor: 0, uperId: 0 },
      { id: 5, name: '运营部', supervisor: 0, uperId: 0 },
      { id: 6, name: '客服部', supervisor: 0, uperId: 0 }
    ]
  }
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

// 部门映射
const getDepartmentName = (departmentId: number) => {
  const department = departmentList.value.find(d => d.id === Number(departmentId))
  return department ? department.name : '未知部门'
}

// 岗位映射
const getJobName = (jobId: number) => {
  const job = jobList.value.find(j => j.id === Number(jobId))
  return job ? job.name : '未知岗位'
}

// 获取员工列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: WorkerQueryParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      id: searchForm.id ? Number(searchForm.id) : undefined
    }
    
    const response = await workerApi.getById(params)
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

// 岗位筛选
const handleJobFilter = (jobId: number | null) => {
  if (jobId) {
    // 如果选择了岗位，使用岗位查询接口
    fetchDataByJob(jobId)
  } else {
    // 如果清空选择，回到普通搜索
    fetchData()
  }
}

// 根据岗位查询员工
const fetchDataByJob = async (jobId: number) => {
  loading.value = true
  try {
    const params = {
      id: jobId.toString(),
      name: 'null', // 根据要求设置为null
      pageNum: pagination.pageNum.toString(),
      pageSize: pagination.pageSize.toString()
    }
    
    const response = await workerApi.getByJob(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('根据岗位查询员工失败:', error)
    ElMessage.error('根据岗位查询员工失败')
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    id: '',
    name: '',
    selectedJobId: null
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加员工提交
const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    addLoading.value = true
    
    const response = await workerApi.add(addForm)
    if (response.code === 0) {
      ElMessage.success('添加员工成功')
      showAddDialog.value = false
      resetAddForm()
      fetchData()
      // 触发数据刷新事件，通知统计页面更新数据
      dataRefreshStore.triggerRefresh()
    } else {
      ElMessage.error(response.message || '添加员工失败')
    }
  } catch (error) {
    console.error('添加员工失败:', error)
    ElMessage.error('添加员工失败')
  } finally {
    addLoading.value = false
  }
}

// 重置添加表单
const resetAddForm = () => {
  Object.assign(addForm, {
    name: '',
    gender: 1, // 默认选择男
    degree: 2,
    birthday: '',
    socialSecurity: 1,
    rpRecord: '',
    transfer: '',
    workStatus: 1,
    certificate: '',
    laborStatus: 1,
    job: 1,
    department: 1,
    onboardingTime: '',
    departureTime: ''
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

// 编辑员工提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editLoading.value = true
    
    const response = await workerApi.update(editForm)
    if (response.code === 0) {
      ElMessage.success('修改员工成功')
      showEditDialog.value = false
      resetEditForm()
      fetchData()
      // 触发数据刷新事件，通知统计页面更新数据
      dataRefreshStore.triggerRefresh()
    } else {
      ElMessage.error(response.message || '修改员工失败')
    }
  } catch (error) {
    console.error('修改员工失败:', error)
    ElMessage.error('修改员工失败')
  } finally {
    editLoading.value = false
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: 0,
    name: '',
    gender: 1, // 默认选择男
    degree: 2,
    birthday: '',
    socialSecurity: 1,
    rpRecord: '',
    transfer: '',
    workStatus: 1,
    certificate: '',
    laborStatus: 1,
    job: 1,
    department: 1,
    onboardingTime: '',
    departureTime: ''
  })
  editFormRef.value?.resetFields()
}

// 编辑员工
const handleEdit = (row: Worker) => {
  // 填充编辑表单数据，确保数据类型正确
  Object.assign(editForm, {
    ...row,
    gender: Number(row.gender),
    department: Number(row.department),
    job: Number(row.job)
  })
  showEditDialog.value = true
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
      // 触发数据刷新事件，通知统计页面更新数据
      dataRefreshStore.triggerRefresh()
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
      // 触发数据刷新事件，通知统计页面更新数据
      dataRefreshStore.triggerRefresh()
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
    // 检查是否有数据
    if (!tableData.value || tableData.value.length === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    // 创建部门映射
    const departmentMap = new Map<number, string>()
    departmentList.value.forEach(dept => {
      departmentMap.set(dept.id, dept.name)
    })

    // 创建岗位映射
    const jobMap = new Map<number, string>()
    jobList.value.forEach(job => {
      jobMap.set(job.id, job.name)
    })

    // 导出Excel
    const result = exportWorkersWithDetailsToExcel(
      tableData.value,
      departmentMap,
      jobMap,
      '员工列表'
    )

    if (result.success) {
      ElMessage.success(`导出成功，文件名：${result.filename}`)
    } else {
      ElMessage.error(result.error || '导出失败')
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
  if (searchForm.selectedJobId) {
    fetchDataByJob(searchForm.selectedJobId)
  } else {
    fetchData()
  }
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  if (searchForm.selectedJobId) {
    fetchDataByJob(searchForm.selectedJobId)
  } else {
    fetchData()
  }
}

onMounted(async () => {
  // 先加载部门和岗位数据，再加载员工数据
  await Promise.all([fetchDepartmentList(), fetchJobList()])
  await fetchData()
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

.table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
}

.table-container .el-table {
  min-width: 100%;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .table-container {
    font-size: 14px;
  }
  
  .table-container .el-table .el-table__cell {
    padding: 8px 0;
  }
}

@media (max-width: 768px) {
  .employee-list {
    padding: 10px;
  }
  
  .table-container {
    font-size: 12px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
