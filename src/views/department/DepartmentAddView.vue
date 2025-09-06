<template>
  <div class="department-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加部门</span>
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
        class="department-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主管" prop="supervisor">
              <el-select v-model="form.supervisor" placeholder="请选择主管">
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
          <el-select v-model="form.uperId" placeholder="请选择上级部门">
            <el-option label="公司总部" :value="0" />
            <el-option label="技术部" :value="1" />
            <el-option label="市场部" :value="2" />
            <el-option label="人事部" :value="3" />
            <el-option label="财务部" :value="4" />
            <el-option label="运营部" :value="5" />
            <el-option label="客服部" :value="6" />
          </el-select>
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
import { departmentApi } from '@/api'
import type { Department } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<Omit<Department, 'id'>>({
  name: '',
  supervisor: 0,
  uperId: 0
})

const rules: FormRules = {
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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await departmentApi.add(form)
    if (response.code === 0) {
      ElMessage.success('添加部门成功')
      router.push('/department/list')
    } else {
      ElMessage.error(response.message || '添加部门失败')
    }
  } catch (error) {
    console.error('添加部门失败:', error)
    ElMessage.error('添加部门失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}

const handleBack = () => {
  router.push('/department/list')
}
</script>

<style scoped>
.department-add {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.department-form {
  max-width: 600px;
}
</style>
