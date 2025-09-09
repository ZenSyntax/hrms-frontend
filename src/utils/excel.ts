import * as XLSX from 'xlsx'
import type { Worker } from '@/types'

/**
 * 导出员工数据到Excel文件
 * @param data 员工数据数组
 * @param filename 文件名（可选，默认为"员工列表"）
 */
export function exportWorkersToExcel(data: Worker[], filename: string = '员工列表') {
  try {
    // 准备Excel数据
    const excelData = data.map(worker => ({
      'ID': worker.id,
      '姓名': worker.name,
      '性别': worker.gender === 1 ? '男' : worker.gender === 2 ? '女' : '未知',
      '学历': getDegreeText(worker.degree),
      '生日': worker.birthday,
      '社保缴纳': worker.socialSecurity === 1 ? '已缴' : '未缴',
      '工作状态': worker.workStatus === 1 ? '在任' : '离职',
      '用工类型': getLaborStatusText(worker.laborStatus),
      '入职时间': worker.onboardingTime,
      '离职时间': worker.departureTime || '未离职',
      '奖惩记录': worker.rpRecord || '',
      '调动记录': worker.transfer || '',
      '技能证书': worker.certificate || ''
    }))

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // 设置列宽
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 12 },  // 姓名
      { wch: 8 },   // 性别
      { wch: 12 },  // 学历
      { wch: 12 },  // 生日
      { wch: 12 },  // 社保缴纳
      { wch: 10 },  // 工作状态
      { wch: 12 },  // 用工类型
      { wch: 12 },  // 入职时间
      { wch: 12 },  // 离职时间
      { wch: 20 },  // 奖惩记录
      { wch: 20 },  // 调动记录
      { wch: 20 }   // 技能证书
    ]
    worksheet['!cols'] = columnWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '员工列表')
    
    // 生成文件名（包含时间戳）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
    const finalFilename = `${filename}_${timestamp}.xlsx`
    
    // 导出文件
    XLSX.writeFile(workbook, finalFilename)
    
    return {
      success: true,
      filename: finalFilename
    }
  } catch (error) {
    console.error('导出Excel失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败'
    }
  }
}

/**
 * 获取学历文本
 */
function getDegreeText(degree: number): string {
  const degreeMap: Record<number, string> = {
    1: '本科以上',
    2: '本科',
    3: '大专',
    4: '高中',
    5: '初中及以下'
  }
  return degreeMap[degree] || '未知'
}

/**
 * 获取用工类型文本
 */
function getLaborStatusText(laborStatus: number): string {
  const laborStatusMap: Record<number, string> = {
    1: '正式工',
    2: '临时工',
    3: '实习生'
  }
  return laborStatusMap[laborStatus] || '未知'
}

/**
 * 导出带部门信息的员工数据到Excel文件
 * @param data 员工数据数组
 * @param departmentMap 部门ID到名称的映射
 * @param jobMap 岗位ID到名称的映射
 * @param filename 文件名（可选，默认为"员工列表"）
 */
export function exportWorkersWithDetailsToExcel(
  data: Worker[], 
  departmentMap: Map<number, string>, 
  jobMap: Map<number, string>,
  filename: string = '员工列表'
) {
  try {
    // 准备Excel数据
    const excelData = data.map(worker => ({
      'ID': worker.id,
      '姓名': worker.name,
      '性别': worker.gender === 1 ? '男' : worker.gender === 2 ? '女' : '未知',
      '学历': getDegreeText(worker.degree),
      '生日': worker.birthday,
      '社保缴纳': worker.socialSecurity === 1 ? '已缴' : '未缴',
      '工作状态': worker.workStatus === 1 ? '在任' : '离职',
      '用工类型': getLaborStatusText(worker.laborStatus),
      '部门': departmentMap.get(worker.department) || '未知部门',
      '岗位': jobMap.get(worker.job) || '未知岗位',
      '入职时间': worker.onboardingTime,
      '离职时间': worker.departureTime || '未离职',
      '奖惩记录': worker.rpRecord || '',
      '调动记录': worker.transfer || '',
      '技能证书': worker.certificate || ''
    }))

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // 设置列宽
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 12 },  // 姓名
      { wch: 8 },   // 性别
      { wch: 12 },  // 学历
      { wch: 12 },  // 生日
      { wch: 12 },  // 社保缴纳
      { wch: 10 },  // 工作状态
      { wch: 12 },  // 用工类型
      { wch: 15 },  // 部门
      { wch: 15 },  // 岗位
      { wch: 12 },  // 入职时间
      { wch: 12 },  // 离职时间
      { wch: 20 },  // 奖惩记录
      { wch: 20 },  // 调动记录
      { wch: 20 }   // 技能证书
    ]
    worksheet['!cols'] = columnWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '员工列表')
    
    // 生成文件名（包含时间戳）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
    const finalFilename = `${filename}_${timestamp}.xlsx`
    
    // 导出文件
    XLSX.writeFile(workbook, finalFilename)
    
    return {
      success: true,
      filename: finalFilename
    }
  } catch (error) {
    console.error('导出Excel失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败'
    }
  }
}
