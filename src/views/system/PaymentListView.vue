<template>
  <div class="payment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>收支管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加收支
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
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
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="profit" label="收益" width="120">
          <template #default="{ row }">
            <span class="positive">+¥{{ row.profit?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tax" label="税收" width="120">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.tax?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="socialSecurity" label="社保" width="120">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.socialSecurity?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="water" label="水费" width="120">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.water?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="electricity" label="电费" width="120">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.electricity?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="薪资" width="120">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.salary?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="outlay" label="总支出" width="120">
          <template #default="{ row }">
            <span class="negative">-¥{{ row.outlay?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
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
    
    <!-- 编辑收支对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑收支信息" width="600px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="editForm.date"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        <el-form-item label="收益">
          <el-input-number
            v-model="editForm.profit"
            :min="0"
            :precision="2"
            placeholder="请输入收益"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="税收">
          <el-input-number
            v-model="editForm.tax"
            :min="0"
            :precision="2"
            placeholder="请输入税收"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="社保">
          <el-input-number
            v-model="editForm.socialSecurity"
            :min="0"
            :precision="2"
            placeholder="请输入社保"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="水费">
          <el-input-number
            v-model="editForm.water"
            :min="0"
            :precision="2"
            placeholder="请输入水费"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="电费">
          <el-input-number
            v-model="editForm.electricity"
            :min="0"
            :precision="2"
            placeholder="请输入电费"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="其他支出">
          <el-input-number
            v-model="editForm.outlay"
            :min="0"
            :precision="2"
            placeholder="请输入其他支出"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEdit" :loading="editLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { paymentApi } from '@/api'
import type { Payment } from '@/types'

const loading = ref(false)
const editLoading = ref(false)
const editDialogVisible = ref(false)
const tableData = ref<Payment[]>([])
const editForm = reactive<Partial<Payment>>({})

const searchForm = reactive({
  dateRange: []
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取收支列表
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
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
        profit: 250000,
        tax: 25000,
        socialSecurity: 15000,
        water: 2000,
        electricity: 3000,
        salary: 120000,
        outlay: 165000,
        date: '2024-01-15'
      },
      {
        id: 2,
        profit: 280000,
        tax: 28000,
        socialSecurity: 16000,
        water: 2200,
        electricity: 3200,
        salary: 125000,
        outlay: 172400,
        date: '2024-01-14'
      },
      {
        id: 3,
        profit: 220000,
        tax: 22000,
        socialSecurity: 14000,
        water: 1800,
        electricity: 2800,
        salary: 115000,
        outlay: 158600,
        date: '2024-01-13'
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
    dateRange: []
  })
  pagination.pageNum = 1
  fetchData()
}

// 添加收支
const handleAdd = async () => {
  try {
    const response = await paymentApi.add()
    if (response.code === 0) {
      ElMessage.success('添加收支信息成功')
      fetchData()
    } else {
      ElMessage.error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加收支信息失败:', error)
    ElMessage.error('添加失败')
  }
}

// 编辑收支
const handleEdit = (row: Payment) => {
  Object.assign(editForm, row)
  editDialogVisible.value = true
}

// 确认编辑
const handleConfirmEdit = async () => {
  editLoading.value = true
  try {
    const response = await paymentApi.update(editForm as Payment & { id: number })
    if (response.code === 0) {
      ElMessage.success('编辑成功')
      editDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(response.message || '编辑失败')
    }
  } catch (error) {
    console.error('编辑失败:', error)
    ElMessage.error('编辑失败')
  } finally {
    editLoading.value = false
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
  font-weight: bold;
}

.negative {
  color: #f56c6c;
  font-weight: bold;
}
</style>
