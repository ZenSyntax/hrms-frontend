<template>
  <div class="job-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加岗位</span>
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
        class="job-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择岗位类型">
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
                v-model="form.salary"
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
                v-model="form.overtimePay"
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
            v-model="form.demand"
            type="textarea"
            :rows="4"
            placeholder="请输入岗位要求"
          />
        </el-form-item>
        
        <el-form-item label="工作内容" prop="introduction">
          <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="4"
            placeholder="请输入工作内容介绍"
          />
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { jobApi } from '@/api'
import type { Job } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<Omit<Job, 'id'>>({
  name: '',
  demand: '',
  type: 1,
  salary: 5000,
  overtimePay: 50,
  introduction: ''
})

const rules: FormRules = {
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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await jobApi.add(form)
    if (response.code === 0) {
      ElMessage.success('添加岗位成功')
      router.push('/job/list')
    } else {
      ElMessage.error(response.message || '添加岗位失败')
    }
  } catch (error) {
    console.error('添加岗位失败:', error)
    ElMessage.error('添加岗位失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}

const handleBack = () => {
  router.push('/job/list')
}
</script>

<style scoped>
.job-add {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-form {
  max-width: 800px;
}
</style>
