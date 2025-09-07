<template>
  <div class="employee-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加员工</span>
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
        class="employee-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入员工姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别">
                <el-option label="女" :value="2" />
                <el-option label="男" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历" prop="degree">
              <el-select v-model="form.degree" placeholder="请选择学历">
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
                v-model="form.birthday"
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
              <el-select v-model="form.socialSecurity" placeholder="请选择社保缴纳情况">
                <el-option label="未缴" :value="0" />
                <el-option label="已缴" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作状态" prop="workStatus">
              <el-select v-model="form.workStatus" placeholder="请选择工作状态">
                <el-option label="离职" :value="0" />
                <el-option label="在任" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用工类型" prop="laborStatus">
              <el-select v-model="form.laborStatus" placeholder="请选择用工类型">
                <el-option label="正式工" :value="1" />
                <el-option label="临时工" :value="2" />
                <el-option label="实习生" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="job">
              <el-select v-model="form.job" placeholder="请选择岗位">
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
              <el-select v-model="form.department" placeholder="请选择部门">
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
                v-model="form.onboardingTime"
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
            v-model="form.rpRecord"
            type="textarea"
            :rows="3"
            placeholder="请输入奖惩记录"
          />
        </el-form-item>
        
        <el-form-item label="调动记录">
          <el-input
            v-model="form.transfer"
            type="textarea"
            :rows="3"
            placeholder="请输入调动记录"
          />
        </el-form-item>
        
        <el-form-item label="技能证书">
          <el-input
            v-model="form.certificate"
            type="textarea"
            :rows="3"
            placeholder="请输入技能证书"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { workerApi, jobApi, departmentApi } from '@/api'
import type { Worker, Job, Department } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 部门和岗位列表
const departmentList = ref<Department[]>([])
const jobList = ref<Job[]>([])

const form = reactive<Omit<Worker, 'id'>>({
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

const rules: FormRules = {
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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await workerApi.add(form)
    if (response.code === 0) {
      ElMessage.success('添加员工成功')
      router.push('/employee/list')
    } else {
      ElMessage.error(response.message || '添加员工失败')
    }
  } catch (error) {
    console.error('添加员工失败:', error)
    ElMessage.error('添加员工失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
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

const handleBack = () => {
  router.push('/employee/list')
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchDepartmentList()
  await fetchJobList()
})
</script>

<style scoped>
.employee-add {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-form {
  max-width: 800px;
}
</style>
