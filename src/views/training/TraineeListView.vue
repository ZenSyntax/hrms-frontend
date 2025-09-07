<template>
  <div class="trainee-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学员管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleBatchOperation">
              <el-icon><Plus /></el-icon>
              批量操作
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="选择课程">
          <el-select
            v-model="searchForm.id"
            placeholder="请选择课程"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="lesson in lessons"
              :key="lesson.id"
              :label="lesson.name"
              :value="lesson.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学员姓名">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入学员姓名" 
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
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
         <el-table-column prop="name" label="学员姓名" min-width="180" />
         <el-table-column prop="departmentName" label="部门" min-width="200" />
         <el-table-column prop="jobName" label="岗位" min-width="220" show-overflow-tooltip />
         <el-table-column prop="lessonName" label="课程名称" min-width="250" show-overflow-tooltip />
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
    
    <!-- 批量操作对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量操作" width="800px" center>
      <div class="batch-operation">
        <el-form :model="batchForm" label-width="80px">
          <el-form-item label="选择课程">
            <el-select 
              v-model="batchForm.lessonId" 
              placeholder="请选择课程"
              @change="handleLessonChange"
              class="course-select"
            >
              <el-option
                v-for="lesson in lessons"
                :key="lesson.id"
                :label="lesson.name"
                :value="lesson.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        
        <div class="transfer-container">
          <div class="transfer-section">
            <div class="section-header">
              <h4>可选员工</h4>
              <el-input
                v-model="availableSearchText"
                placeholder="搜索员工"
                size="small"
                style="width: 150px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <div class="employee-list">
              <div 
                v-for="employee in filteredAvailableEmployees" 
                :key="employee.id"
                class="employee-item"
              >
                <el-checkbox 
                  v-model="employee.selected"
                  @change="handleAvailableSelectionChange"
                >
                  {{ employee.name }}
                </el-checkbox>
              </div>
            </div>
          </div>
          
          <div class="transfer-buttons">
            <el-button 
              type="primary" 
              @click="moveToSelected"
              :disabled="!hasAvailableSelected"
            >
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button 
              type="primary" 
              @click="moveToAvailable"
              :disabled="!hasSelectedSelected"
            >
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
          </div>
          
          <div class="transfer-section">
            <div class="section-header">
              <h4>已选员工</h4>
              <el-input
                v-model="selectedSearchText"
                placeholder="搜索员工"
                size="small"
                style="width: 150px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <div class="employee-list">
              <div 
                v-for="employee in filteredSelectedEmployees" 
                :key="employee.id"
                class="employee-item"
              >
                <el-checkbox 
                  v-model="employee.selected"
                  @change="handleSelectedSelectionChange"
                >
                  {{ employee.name }}
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮区域 -->
        <div class="action-buttons">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmBatch" :loading="batchLoading">
            确定
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowRight, ArrowLeft, Search } from '@element-plus/icons-vue'
import { traineeApi, lessonApi } from '@/api'
import type { Lesson } from '@/types'

const loading = ref(false)
const batchLoading = ref(false)
const batchDialogVisible = ref(false)
const tableData = ref<any[]>([])
const availableEmployees = ref<any[]>([])
const selectedEmployees = ref<any[]>([])
const availableSearchText = ref('')
const selectedSearchText = ref('')

// 课程数据
const lessons = ref<Lesson[]>([])

const searchForm = reactive({
  id: null as number | null,
  name: null as string | null
})

const batchForm = reactive({
  lessonId: null as number | null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 移除模拟数据，改为动态获取

// 获取课程数据
const fetchLessons = async () => {
  try {
    const response = await lessonApi.getAll()
    if (response.code === 0) {
      lessons.value = response.data
    }
  } catch (error) {
    console.error('获取课程数据失败:', error)
    // 使用模拟数据
    lessons.value = [
      { id: 1, name: '新员工入职培训', schedule: '2024-01-15', timePlan: 3, address: '培训室A', info: '新员工入职培训课程' },
      { id: 2, name: '技术技能提升培训', schedule: '2024-02-01', timePlan: 5, address: '培训室B', info: '技术技能提升培训' },
      { id: 3, name: '管理能力培训', schedule: '2024-02-15', timePlan: 2, address: '培训室C', info: '管理能力培训' },
      { id: 4, name: '安全培训', schedule: '2024-03-01', timePlan: 1, address: '培训室D', info: '安全培训课程' },
      { id: 5, name: '销售技巧培训', schedule: '2024-03-15', timePlan: 3, address: '培训室E', info: '销售技巧培训' }
    ]
  }
}

// 获取学员列表
const fetchData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    // 如果选择了课程，添加课程ID参数
    if (searchForm.id !== null) {
      params.id = searchForm.id
    }
    
    // 如果输入了学员姓名，添加姓名参数
    if (searchForm.name !== null && searchForm.name.trim() !== '') {
      params.name = searchForm.name.trim()
    }
    
    const response = await traineeApi.getByPage(params)
    if (response.code === 0) {
      // 新接口已经返回处理好的数据，直接使用
      tableData.value = response.data.items.map((trainee: any) => ({
        ...trainee,
        departmentName: trainee.dept, // 直接使用返回的部门名称
        jobName: trainee.job, // 直接使用返回的岗位名称
        lessonName: trainee.lesName // 直接使用返回的课程名称
      }))
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取学员列表失败:', error)
    // 使用模拟数据
    tableData.value = [
      {
        id: 1, // 学员与课程的多对多关系表ID
        name: '吴刚',
        dept: '研发部',
        job: '前端开发工程师',
        lesName: '新员工入职与企业文化培训',
        departmentName: '研发部',
        jobName: '前端开发工程师',
        lessonName: '新员工入职与企业文化培训'
      },
      {
        id: 2, // 学员与课程的多对多关系表ID
        name: '谢军',
        dept: '产品设计部',
        job: '产品经理',
        lesName: '新员工入职与企业文化培训',
        departmentName: '产品设计部',
        jobName: '产品经理',
        lessonName: '新员工入职与企业文化培训'
      },
      {
        id: 3, // 学员与课程的多对多关系表ID
        name: '宋琳',
        dept: '销售部',
        job: '销售代表',
        lesName: '新员工入职与企业文化培训',
        departmentName: '销售部',
        jobName: '销售代表',
        lessonName: '新员工入职与企业文化培训'
      },
      {
        id: 4, // 学员与课程的多对多关系表ID
        name: '黄宇',
        dept: '人力资源部',
        job: '招聘专员',
        lesName: '新员工入职与企业文化培训',
        departmentName: '人力资源部',
        jobName: '招聘专员',
        lessonName: '新员工入职与企业文化培训'
      },
      {
        id: 5, // 学员与课程的多对多关系表ID
        name: '马琳',
        dept: '财务部',
        job: '会计',
        lesName: '新员工入职与企业文化培训',
        departmentName: '财务部',
        jobName: '会计',
        lessonName: '新员工入职与企业文化培训'
      }
    ]
    pagination.total = tableData.value.length
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.id = null
  searchForm.name = null
  pagination.pageNum = 1
  fetchData()
}

// 批量操作
const handleBatchOperation = () => {
  batchDialogVisible.value = true
  // 重置数据
  batchForm.lessonId = null
  availableEmployees.value = []
  selectedEmployees.value = []
  availableSearchText.value = ''
  selectedSearchText.value = ''
}

// 课程选择变化
const handleLessonChange = async (lessonId: number) => {
  if (!lessonId) {
    availableEmployees.value = []
    selectedEmployees.value = []
    availableSearchText.value = ''
    selectedSearchText.value = ''
    return
  }
  
  try {
    // 获取未选择该课程的员工信息
    const notInLessonResponse = await traineeApi.getNotInLesson(lessonId)
    if (notInLessonResponse.code === 0) {
      availableEmployees.value = notInLessonResponse.data.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        selected: false
      }))
    }
    
    // 获取选择了该课程的员工信息
    const inLessonResponse = await traineeApi.getInLesson(lessonId)
    if (inLessonResponse.code === 0) {
      selectedEmployees.value = inLessonResponse.data.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        selected: false
      }))
    }
  } catch (error) {
    console.error('获取员工信息失败:', error)
    ElMessage.error('获取员工信息失败')
  }
}

// 可选员工选择变化
const handleAvailableSelectionChange = () => {
  // 可以在这里添加额外的逻辑
}

// 已选员工选择变化
const handleSelectedSelectionChange = () => {
  // 可以在这里添加额外的逻辑
}

// 移动到已选
const moveToSelected = () => {
  const selected = availableEmployees.value.filter(emp => emp.selected)
  selected.forEach(emp => {
    emp.selected = false
    selectedEmployees.value.push(emp)
  })
  // 从可选员工列表中移除已选中的员工
  availableEmployees.value = availableEmployees.value.filter(emp => !selected.includes(emp))
}

// 移动到可选
const moveToAvailable = () => {
  const selected = selectedEmployees.value.filter(emp => emp.selected)
  selected.forEach(emp => {
    emp.selected = false
    availableEmployees.value.push(emp)
  })
  // 从已选员工列表中移除已选中的员工
  selectedEmployees.value = selectedEmployees.value.filter(emp => !selected.includes(emp))
}

// 确认批量操作
const handleConfirmBatch = async () => {
  if (!batchForm.lessonId) {
    ElMessage.warning('请选择课程')
    return
  }
  
  if (selectedEmployees.value.length === 0) {
    ElMessage.warning('请选择要添加的学员')
    return
  }
  
  batchLoading.value = true
  try {
    const workerIds = selectedEmployees.value.map(emp => emp.id)
    const response = await traineeApi.addBatch({
      lesId: batchForm.lessonId,
      workerIds: workerIds
    })
    if (response.code === 0) {
      ElMessage.success('批量操作成功')
      batchDialogVisible.value = false
      // 重置表单
      batchForm.lessonId = null
      availableEmployees.value = []
      selectedEmployees.value = []
      availableSearchText.value = ''
      selectedSearchText.value = ''
      fetchData()
    } else {
      ElMessage.error(response.message || '批量操作失败')
    }
  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败')
  } finally {
    batchLoading.value = false
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

// 计算属性：是否有可选员工被选中
const hasAvailableSelected = computed(() => {
  return availableEmployees.value.some(emp => emp.selected)
})

// 计算属性：是否有已选员工被选中
const hasSelectedSelected = computed(() => {
  return selectedEmployees.value.some(emp => emp.selected)
})

// 计算属性：过滤后的可选员工
const filteredAvailableEmployees = computed(() => {
  if (!availableSearchText.value) {
    return availableEmployees.value
  }
  return availableEmployees.value.filter(emp => 
    emp.name.toLowerCase().includes(availableSearchText.value.toLowerCase())
  )
})

// 计算属性：过滤后的已选员工
const filteredSelectedEmployees = computed(() => {
  if (!selectedSearchText.value) {
    return selectedEmployees.value
  }
  return selectedEmployees.value.filter(emp => 
    emp.name.toLowerCase().includes(selectedSearchText.value.toLowerCase())
  )
})

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
  fetchLessons()
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

/* 表格样式优化 */
:deep(.el-table) {
  overflow-x: hidden;
}

:deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}

:deep(.el-table__header-wrapper) {
  overflow-x: hidden;
}

/* 确保表格容器不会产生滚动条 */
:deep(.el-card__body) {
  overflow-x: hidden;
}

/* 批量操作样式 */
.batch-operation {
  .el-form {
    margin-bottom: 0;
  }
  
  .course-select {
    width: 100%;
    max-width: 600px; /* 与已选员工栏右边缘对齐 */
  }
  
  .transfer-container {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 20px;
    margin-left: 80px; /* 与表单项的label-width对齐 */
    width: 600px; /* 固定宽度，确保与按钮区域对齐 */
  }
  
  .transfer-section {
    flex: 1;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    padding: 16px;
    min-height: 320px;
    max-width: 280px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h4 {
        margin: 0;
        color: #606266;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
  
  .employee-list {
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 8px;
    background-color: #fafafa;
  }
  
  .employee-item {
    padding: 8px 10px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
    transition: background-color 0.2s;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: #f0f9ff;
      border-radius: 4px;
    }
  }
  
  .transfer-buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding: 0 8px;
    margin-top: 40px;
    
    .el-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      .el-icon {
        font-size: 16px;
      }
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    margin-left: 80px; /* 与transfer-container对齐 */
    width: 600px; /* 与transfer-container宽度一致 */
  }
}
</style>
