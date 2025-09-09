<template>
  <div class="organization-tree">
    <div class="tree-container" ref="treeContainer" @wheel="handleWheel">
      <svg 
        :width="svgWidth" 
        :height="svgHeight" 
        class="tree-svg"
        :viewBox="`${-panX} ${-panY} ${svgWidth / zoomLevel} ${svgHeight / zoomLevel}`"
        @click="handleSvgClick"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <!-- 连接线 -->
        <g class="connections">
          <path
            v-for="(connection, index) in connections"
            :key="`connection-${index}`"
            :d="connection.path"
            :stroke="connection.color"
            :stroke-width="connection.width"
            :stroke-dasharray="connection.dashed ? '5,5' : 'none'"
            fill="none"
            class="connection-line"
            :class="{ 'connection-hover': connection.hovered }"
          />
        </g>
        
        <!-- 节点 -->
        <g class="nodes">
          <g
            v-for="node in flattenedNodes"
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            class="node-group"
            :class="{ 
              'node-expanded': node.expanded,
              'node-collapsed': !node.expanded && node.children && node.children.length > 0,
              'node-leaf': !node.children || node.children.length === 0
            }"
            @click.stop="handleNodeClick(node)"
            @mouseenter="handleNodeHover(node, true)"
            @mouseleave="handleNodeHover(node, false)"
          >
            <!-- 节点背景 -->
            <rect
              :width="nodeWidth"
              :height="nodeHeight"
              :rx="nodeRadius"
              :ry="nodeRadius"
              :fill="node.color"
              :stroke="node.borderColor"
              :stroke-width="node.borderWidth"
              class="node-background"
              :class="{ 'node-hover': node.hovered }"
            />
            
            <!-- 节点阴影 -->
            <rect
              :width="nodeWidth"
              :height="nodeHeight"
              :rx="nodeRadius"
              :ry="nodeRadius"
              :fill="node.shadowColor"
              :transform="`translate(${node.shadowOffset}, ${node.shadowOffset})`"
              class="node-shadow"
            />
            
            <!-- 展开/折叠图标 -->
            <circle
              v-if="node.children && node.children.length > 0"
              :cx="nodeWidth - 15"
              :cy="15"
              :r="8"
              :fill="node.expanded ? '#ff6b6b' : '#4ecdc4'"
              class="expand-icon"
            />
            <text
              v-if="node.children && node.children.length > 0"
              :x="nodeWidth - 15"
              :y="19"
              text-anchor="middle"
              class="expand-text"
              :fill="node.expanded ? '#fff' : '#fff'"
            >
              {{ node.expanded ? '−' : '+' }}
            </text>
            
            <!-- 节点文本 -->
            <text
              :x="nodeWidth / 2"
              :y="nodeHeight / 2 - 5"
              text-anchor="middle"
              class="node-title"
              :fill="node.textColor"
            >
              {{ node.name }}
            </text>
            <text
              v-if="node.description"
              :x="nodeWidth / 2"
              :y="nodeHeight / 2 + 10"
              text-anchor="middle"
              class="node-description"
              :fill="node.textColor"
            >
              {{ node.description }}
            </text>
          </g>
        </g>
      </svg>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

interface TreeNode {
  id: string
  name: string
  description?: string
  children?: TreeNode[]
  expanded?: boolean
  level?: number
  x?: number
  y?: number
  color?: string
  borderColor?: string
  borderWidth?: number
  textColor?: string
  shadowColor?: string
  shadowOffset?: number
  hovered?: boolean
}

interface Connection {
  path: string
  color: string
  width: number
  dashed?: boolean
  hovered?: boolean
}

const props = defineProps<{
  data: TreeNode
  nodeWidth?: number
  nodeHeight?: number
  nodeRadius?: number
  levelHeight?: number
  siblingGap?: number
}>()

const emit = defineEmits<{
  nodeClick: [node: TreeNode]
  nodeHover: [node: TreeNode, hovered: boolean]
}>()

// 默认配置
const nodeWidth = props.nodeWidth || 160
const nodeHeight = props.nodeHeight || 60
const nodeRadius = props.nodeRadius || 12
const levelHeight = props.levelHeight || 120
const siblingGap = props.siblingGap || 40

// 响应式数据
const treeContainer = ref<HTMLElement>()
const svgWidth = ref(800)
const svgHeight = ref(600)
const flattenedNodes = ref<TreeNode[]>([])
const connections = ref<Connection[]>([])

// 缩放和平移
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const minZoom = 0.3
const maxZoom = 3

// 拖拽控制
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

// 展开状态管理
const expandedStates = ref<Map<string, boolean>>(new Map())

// 保存节点展开状态
const saveExpandedStates = (node: TreeNode, level: number = 0) => {
  const nodeKey = `${node.id || node.name}_${level}`
  expandedStates.value.set(nodeKey, node.expanded ?? false)
  
  if (node.children) {
    for (const child of node.children) {
      saveExpandedStates(child, level + 1)
    }
  }
}

// 颜色配置 - 提高饱和度的节点颜色
const levelColors = [
  { bg: '#FFD6D6', border: '#FF9999', text: '#2C3E50', shadow: 'rgba(255, 153, 153, 0.4)' }, // 根节点 - 中等红色
  { bg: '#D6E8FF', border: '#99C2FF', text: '#2C3E50', shadow: 'rgba(153, 194, 255, 0.4)' }, // 二级节点 - 中等蓝色
  { bg: '#D6F0D6', border: '#99E699', text: '#2C3E50', shadow: 'rgba(153, 230, 153, 0.4)' }, // 三级节点 - 中等绿色
  { bg: '#FFF0D6', border: '#FFD699', text: '#2C3E50', shadow: 'rgba(255, 214, 153, 0.4)' }, // 四级节点 - 中等橙色
  { bg: '#F0D6FF', border: '#E699FF', text: '#2C3E50', shadow: 'rgba(230, 153, 255, 0.4)' }, // 五级节点 - 中等紫色
  { bg: '#F5F0D6', border: '#E6D699', text: '#2C3E50', shadow: 'rgba(230, 214, 153, 0.4)' }, // 六级节点 - 中等金色
  { bg: '#FFE6D6', border: '#FFB399', text: '#2C3E50', shadow: 'rgba(255, 179, 153, 0.4)' }  // 七级节点 - 中等珊瑚色
]

// 初始化节点数据
const initializeNode = (node: TreeNode, level: number = 0, expandedStates?: Map<string, boolean>): TreeNode => {
  const colorConfig = levelColors[level % levelColors.length]
  
  // 如果有展开状态记录，使用它；否则使用节点自身的状态或默认值
  const nodeKey = `${node.id || node.name}_${level}`
  const isExpanded = expandedStates?.get(nodeKey) ?? node.expanded ?? (level < 2)
  
  return {
    ...node,
    level,
    expanded: isExpanded,
    color: colorConfig.bg,
    borderColor: colorConfig.border,
    textColor: colorConfig.text,
    shadowColor: colorConfig.shadow,
    hovered: false,
    children: node.children?.map(child => initializeNode(child, level + 1, expandedStates))
  }
}

// 计算节点位置 - 改进的布局算法
const calculatePositions = (node: TreeNode, startX: number = 0, startY: number = 0): { width: number, height: number, maxX: number, maxY: number } => {
  if (!node.children || node.children.length === 0 || !node.expanded) {
    node.x = startX
    node.y = startY
    return { 
      width: nodeWidth, 
      height: nodeHeight, 
      maxX: startX + nodeWidth, 
      maxY: startY + nodeHeight 
    }
  }

  // 先计算所有子节点的尺寸
  const childSizes: { width: number, height: number, maxX: number, maxY: number }[] = []
  for (const child of node.children) {
    const childSize = calculatePositions(child, 0, startY + levelHeight)
    childSizes.push(childSize)
  }

  // 计算子节点的总宽度
  const totalChildWidth = childSizes.reduce((sum, size) => sum + size.width, 0) + (childSizes.length - 1) * siblingGap
  
  // 计算父节点位置（居中）
  const parentX = startX + (totalChildWidth - nodeWidth) / 2
  node.x = parentX
  node.y = startY

  // 重新计算子节点位置
  let currentX = startX
  let maxX = parentX + nodeWidth
  let maxY = startY + nodeHeight

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const childSize = childSizes[i]
    
    // 重新计算子节点位置
    const childResult = calculatePositions(child, currentX, startY + levelHeight)
    maxX = Math.max(maxX, childResult.maxX)
    maxY = Math.max(maxY, childResult.maxY)
    
    currentX += childSize.width + siblingGap
  }

  return { 
    width: totalChildWidth, 
    height: maxY - startY, 
    maxX, 
    maxY 
  }
}

// 扁平化节点
const flattenNodes = (node: TreeNode): TreeNode[] => {
  const result: TreeNode[] = []
  
  if (node.x !== undefined && node.y !== undefined) {
    result.push(node)
  }
  
  if (node.children && node.expanded) {
    for (const child of node.children) {
      result.push(...flattenNodes(child))
    }
  }
  
  return result
}

// 计算连接线
const calculateConnections = (node: TreeNode): Connection[] => {
  const result: Connection[] = []
  
  if (node.children && node.expanded && node.x !== undefined && node.y !== undefined) {
    for (const child of node.children) {
      if (child.x !== undefined && child.y !== undefined) {
        const startX = node.x + nodeWidth / 2
        const startY = node.y + nodeHeight
        const endX = child.x + nodeWidth / 2
        const endY = child.y
        
        // 创建曲线路径
        const controlY = startY + (endY - startY) / 2
        const path = `M ${startX} ${startY} Q ${startX} ${controlY} ${endX} ${endY}`
        
        result.push({
          path,
          color: '#333333',
          width: 2,
          dashed: false,
          hovered: false
        })
      }
      
      // 递归计算子节点的连接线
      result.push(...calculateConnections(child))
    }
  }
  
  return result
}

// 更新树状图
const updateTree = (skipSaveStates: boolean = false) => {
  // 如果有现有的节点且不是跳过保存状态，先保存它们的展开状态
  if (!skipSaveStates && flattenedNodes.value.length > 0) {
    const rootNode = flattenedNodes.value.find(node => node.level === 0)
    if (rootNode) {
      saveExpandedStates(rootNode)
    }
  }
  
  const rootNode = initializeNode(props.data, 0, expandedStates.value)
  const containerWidth = treeContainer.value?.clientWidth || 800
  const containerHeight = treeContainer.value?.clientHeight || 600
  
  // 计算布局
  const treeSize = calculatePositions(rootNode, 100, 100)
  
  // 更新SVG尺寸，确保能容纳所有节点，并添加足够的边距
  svgWidth.value = Math.max(containerWidth, treeSize.maxX + 200)
  svgHeight.value = Math.max(containerHeight, treeSize.maxY + 200)
  
  // 更新节点和连接线
  flattenedNodes.value = flattenNodes(rootNode)
  connections.value = calculateConnections(rootNode)
}

// 事件处理
const handleNodeClick = (node: TreeNode) => {
  if (node.children && node.children.length > 0) {
    // 直接切换节点的展开状态
    node.expanded = !node.expanded
    // 重新计算布局
    updateTree()
  }
  emit('nodeClick', node)
}

const handleNodeHover = (node: TreeNode, hovered: boolean) => {
  node.hovered = hovered
  emit('nodeHover', node, hovered)
}

const handleSvgClick = () => {
  // 点击空白区域取消所有悬停状态
  flattenedNodes.value.forEach(node => {
    node.hovered = false
  })
}

// 鼠标滚轮缩放
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value + delta))
  
  // 计算缩放中心点
  const rect = treeContainer.value?.getBoundingClientRect()
  if (rect) {
    const centerX = event.clientX - rect.left
    const centerY = event.clientY - rect.top
    
    // 调整平移以保持鼠标位置不变
    const zoomRatio = newZoom / zoomLevel.value
    panX.value = centerX - (centerX - panX.value) * zoomRatio
    panY.value = centerY - (centerY - panY.value) * zoomRatio
  }
  
  zoomLevel.value = newZoom
}

// 鼠标拖拽事件处理
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) { // 左键
    isDragging.value = true
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
    event.preventDefault()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - lastMouseX.value
    const deltaY = event.clientY - lastMouseY.value
    
    panX.value += deltaX
    panY.value += deltaY
    
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
    event.preventDefault()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 控制方法
const expandAll = () => {
  // 展开全部：遍历树，将所有有子节点的节点都展开
  const expandNode = (node: TreeNode, level: number = 0) => {
    if (node.children && node.children.length > 0) {
      const nodeKey = `${node.id || node.name}_${level}`
      expandedStates.value.set(nodeKey, true)
      node.children.forEach(child => expandNode(child, level + 1))
    }
  }
  expandNode(props.data)
  updateTree(true) // 跳过保存状态，直接使用我们设置的状态
}

const collapseAll = () => {
  // 折叠全部：遍历树，将所有有子节点的节点都折叠
  const collapseNode = (node: TreeNode, level: number = 0) => {
    if (node.children && node.children.length > 0) {
      const nodeKey = `${node.id || node.name}_${level}`
      expandedStates.value.set(nodeKey, false)
      node.children.forEach(child => collapseNode(child, level + 1))
    }
  }
  collapseNode(props.data)
  updateTree(true) // 跳过保存状态，直接使用我们设置的状态
}

const resetView = () => {
  // 重置视图：展开前两级，重置缩放和平移
  const resetNode = (node: TreeNode, level: number = 0) => {
    if (node.children && node.children.length > 0) {
      const nodeKey = `${node.id || node.name}_${level}`
      expandedStates.value.set(nodeKey, level < 2)
      node.children.forEach(child => resetNode(child, level + 1))
    }
  }
  resetNode(props.data)
  
  // 重置缩放和平移
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  
  updateTree(true) // 跳过保存状态，直接使用我们设置的状态
}

// 暴露方法给父组件
defineExpose({
  expandAll,
  collapseAll,
  resetView
})

// 监听数据变化
watch(() => props.data, updateTree, { deep: true })

// 生命周期
onMounted(() => {
  nextTick(() => {
    updateTree()
    // 初始化时保存展开状态
    const rootNode = flattenedNodes.value.find(node => node.level === 0)
    if (rootNode) {
      saveExpandedStates(rootNode)
    }
  })
})
</script>

<style scoped>
.organization-tree {
  width: 100%;
  height: 100%;
  position: relative;
  background: #FFFEFA;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tree-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.tree-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.tree-svg:active {
  cursor: grabbing;
}

/* 连接线样式 */
.connection-line {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.connection-line:hover,
.connection-hover {
  stroke-width: 3px !important;
  stroke: #ff6b6b !important;
  filter: drop-shadow(0 2px 8px rgba(255, 107, 107, 0.3));
}

/* 节点样式 */
.node-group {
  cursor: pointer;
  transition: filter 0.3s ease;
}

.node-background {
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.node-hover {
  filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.25)) !important;
}

.node-shadow {
  opacity: 0.3;
  pointer-events: none;
}

/* 展开/折叠图标 */
.expand-icon {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.expand-text {
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 节点文本 */
.node-title {
  font-size: 14px;
  font-weight: 600;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.node-description {
  font-size: 11px;
  font-weight: 400;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .tree-container {
    height: 100%;
  }
}
</style>
