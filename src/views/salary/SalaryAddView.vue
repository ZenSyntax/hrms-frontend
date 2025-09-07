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
                <el-option label="张三" :value="1" />
                <el-option label="李四" :value="2" />
                <el-option label="王五" :value="3" />
                <el-option label="赵六" :value="4" />
                <el-option label="钱七" :value="5" />
                <el-option label="孙八" :value="6" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="jobId">
              <el-select v-model="form.jobId" placeholder="请选择岗位" @change="handleJobChange">
                <el-option label="高级工程师" :value="1" />
                <el-option label="软件工程师" :value="2" />
                <el-option label="产品经理" :value="3" />
                <el-option label="市场专员" :value="4" />
                <el-option label="人事专员" :value="5" />
                <el-option label="财务专员" :value="6" />
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
            <el-form-item label="基础工资" prop="salary">
              <el-input-number
                v-model="form.salary"
                :min="2000"
                :max="60000"
                :step="100"
                placeholder="请输入基础工资"
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { salaryApi } from '@/api'
import type { Salary } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<Omit<Salary, 'id'>>({
  jobId: 1,
  workerId: 1,
  settlementTime: '',
  cycle: 1,
  salaryOffset: 0,
  salary: 0
})

const baseSalary = ref(5000)

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

// 岗位变化
const handleJobChange = (jobId: number) => {
  // 根据岗位获取基础工资
  const salaryMap: Record<number, number> = {
    1: 15000, // 高级工程师
    2: 10000, // 软件工程师
    3: 12000, // 产品经理
    4: 8000,  // 市场专员
    5: 7000,  // 人事专员
    6: 7500   // 财务专员
  }
  baseSalary.value = salaryMap[jobId] || 5000
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const submitData = {
      ...form,
      salary: actualSalary.value
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
  baseSalary.value = 5000
}

const handleBack = () => {
  router.push('/salary/list')
}
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
