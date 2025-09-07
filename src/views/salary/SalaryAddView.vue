<template>
  <div class="salary-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加薪资</span>
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="salary-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工" prop="workerId">
              <el-select v-model="form.workerId" placeholder="请选择员工" @change="handleWorkerChange">
                <el-option 
                  v-for="worker in workerList" 
                  :key="worker.id" 
                  :label="worker.name" 
                  :value="worker.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="jobId">
              <el-select v-model="form.jobId" placeholder="请选择岗位" @change="handleJobChange">
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
                v-model="form.settlementTime"
                type="date"
                placeholder="请选择结算时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算周期" prop="cycle">
              <el-select v-model="form.cycle" placeholder="请选择结算周期">
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
                v-model="form.salaryOffset"
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
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            提交
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { salaryApi, jobApi, workerApi } from '@/api'
import type { Salary, Job, Worker } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const jobList = ref<Job[]>([])
const workerList = ref<Worker[]>([])

const form = reactive<Omit<Salary, 'id'>>({
  jobId: 1,
  workerId: 1,
  settlementTime: '',
  cycle: 1,
  salaryOffset: 0,
  salary: 0
})

// 基础工资计算属性，从岗位信息中获取
const baseSalary = computed(() => {
  const job = jobList.value.find(j => j.id === form.jobId)
  return job?.salary || 0
})

const actualSalary = computed(() => {
  return baseSalary.value + (form.salaryOffset || 0)
})

const rules: FormRules = {
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

// 员工变化
const handleWorkerChange = (workerId: number) => {
  // 根据员工获取岗位信息
  console.log('选择员工:', workerId)
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

// 获取员工列表
const fetchWorkerList = async () => {
  try {
    const response = await workerApi.getByPage({ pageNum: 1, pageSize: 1000 })
    if (response.code === 0) {
      workerList.value = response.data.items
    }
  } catch (error) {
    console.error('获取员工列表失败:', error)
  }
}

// 岗位变化处理（基础工资现在通过计算属性自动更新）
const handleJobChange = (jobId: number) => {
  // 基础工资现在通过计算属性自动从岗位信息中获取
  console.log('选择岗位:', jobId)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 根据接口文档，添加薪资时不需要传递salary字段，后端会自动计算
    const submitData = {
      jobId: form.jobId,
      workerId: form.workerId,
      settlementTime: form.settlementTime || null, // 可以为null，后端会自动设置
      cycle: form.cycle,
      salaryOffset: form.salaryOffset
    }
    
    const response = await salaryApi.add(submitData)
    if (response.code === 0) {
      ElMessage.success('添加薪资成功')
      router.push('/salary/list')
    } else {
      ElMessage.error(response.message || '添加薪资失败')
    }
  } catch (error) {
    console.error('添加薪资失败:', error)
    ElMessage.error('添加薪资失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  // baseSalary现在通过计算属性自动计算，无需手动重置
}

const handleBack = () => {
  router.push('/salary/list')
}

onMounted(async () => {
  await fetchJobList()
  await fetchWorkerList()
})
</script>

<style scoped>
.salary-add {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.salary-form {
  max-width: 800px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
