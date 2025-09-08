<template>
  <div class="payment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>收支管理</span>
          <el-button 
            type="primary" 
            @click="handleEditToday"
            :disabled="!hasTodayData"
          >
            <el-icon><Edit /></el-icon>
            修改今日收支
          </el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入搜索关键字"
            clearable
            style="width: 200px"
          />
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
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="profit" label="收益" min-width="120">
          <template #default="{ row }">
            <span class="positive">+¥{{ row.profit?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tax" label="税收" min-width="100">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.tax?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="socialSecurity" label="社保" min-width="100">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.socialSecurity?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="water" label="水费" min-width="100">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.water?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="electricity" label="电费" min-width="100">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.electricity?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="薪资" min-width="100">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.salary?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="outlay" label="总支出" min-width="120">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.outlay?.toLocaleString() }}</span>
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
    
    <!-- 修改今日收支信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改今日收支信息"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="净收益" prop="profit">
          <el-input-number
            v-model="editForm.profit"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入净收益"
          />
        </el-form-item>
        <el-form-item label="缴税支出" prop="tax">
          <el-input-number
            v-model="editForm.tax"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入缴税支出"
          />
        </el-form-item>
        <el-form-item label="社保支出" prop="socialSecurity">
          <el-input-number
            v-model="editForm.socialSecurity"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入社保支出"
          />
        </el-form-item>
        <el-form-item label="水费" prop="water">
          <el-input-number
            v-model="editForm.water"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入水费"
          />
        </el-form-item>
        <el-form-item label="电费" prop="electricity">
          <el-input-number
            v-model="editForm.electricity"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入电费"
          />
        </el-form-item>
        <el-form-item label="总支出" prop="outlay">
          <el-input-number
            v-model="editForm.outlay"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入总支出"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit" :loading="editLoading">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { paymentApi } from '@/api'
import type { Payment } from '@/types'

const loading = ref(false)
const tableData = ref<Payment[]>([])

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 编辑相关状态
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref()

const editForm = reactive({
  id: 0,
  profit: 0,
  tax: 0,
  socialSecurity: 0,
  water: 0,
  electricity: 0,
  outlay: 0
})

// 表单验证规则
const editFormRules = {
  profit: [
    { required: true, message: '请输入净收益', trigger: 'blur' },
    { type: 'number', min: 0, message: '净收益不能小于0', trigger: 'blur' }
  ],
  tax: [
    { required: true, message: '请输入缴税支出', trigger: 'blur' },
    { type: 'number', min: 0, message: '缴税支出不能小于0', trigger: 'blur' }
  ],
  socialSecurity: [
    { required: true, message: '请输入社保支出', trigger: 'blur' },
    { type: 'number', min: 0, message: '社保支出不能小于0', trigger: 'blur' }
  ],
  water: [
    { required: true, message: '请输入水费', trigger: 'blur' },
    { type: 'number', min: 0, message: '水费不能小于0', trigger: 'blur' }
  ],
  electricity: [
    { required: true, message: '请输入电费', trigger: 'blur' },
    { type: 'number', min: 0, message: '电费不能小于0', trigger: 'blur' }
  ],
  outlay: [
    { required: true, message: '请输入总支出', trigger: 'blur' },
    { type: 'number', min: 0, message: '总支出不能小于0', trigger: 'blur' }
  ]
}

// 检查是否有今日数据（由于后端按日期倒序排序，第一条数据就是最新的）
const hasTodayData = computed(() => {
  return tableData.value.length > 0
})

// 获取今日数据（第一条数据）
const getTodayData = () => {
  return tableData.value.length > 0 ? tableData.value[0] : null
}

// 获取收支列表
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      id: undefined,
      name: searchForm.name || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    const response = await paymentApi.getByPage(params)
    if (response.code === 0) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取收支列表失败:', error)
    // 使用模拟数据
    tableData.value = [
      {
        id: 1,
        profit: 15000.0,
        tax: 1200.0,
        socialSecurity: 2500.0,
        water: 300.5,
        electricity: 800.2,
        salary: 0.0,
        outlay: 4800.7,
        date: '2025-08-01'
      },
      {
        id: 2,
        profit: 18000.0,
        tax: 1500.0,
        socialSecurity: 2500.0,
        water: 310.0,
        electricity: 820.5,
        salary: 0.0,
        outlay: 5130.5,
        date: '2025-08-02'
      },
      {
        id: 3,
        profit: 17500.0,
        tax: 1450.0,
        socialSecurity: 2500.0,
        water: 290.8,
        electricity: 790.0,
        salary: 0.0,
        outlay: 4930.8,
        date: '2025-08-03'
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
    name: ''
  })
  pagination.pageNum = 1
  fetchData()
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

// 处理编辑今日收支
const handleEditToday = () => {
  const todayData = getTodayData()
  if (!todayData) {
    ElMessage.warning('暂无收支数据')
    return
  }
  
  // 回显数据
  Object.assign(editForm, {
    id: todayData.id,
    profit: todayData.profit,
    tax: todayData.tax,
    socialSecurity: todayData.socialSecurity,
    water: todayData.water,
    electricity: todayData.electricity,
    outlay: todayData.outlay
  })
  
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
  } catch (error) {
    return
  }
  
  editLoading.value = true
  try {
    const response = await paymentApi.update(editForm)
    if (response.code === 0) {
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      // 重新获取数据
      await fetchData()
    } else {
      ElMessage.error(response.message || '修改失败')
    }
  } catch (error) {
    console.error('修改收支信息失败:', error)
    ElMessage.error('修改失败，请重试')
  } finally {
    editLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.payment-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-weight: bold;
}

.negative {
  color: #f56c6c;
  font-weight: bold;
}
</style>
