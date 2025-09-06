<template>
  <div class="home-page">
    <h1>欢迎使用 HRMS 人力资源管理系统</h1>
    <p>这是一个测试页面，用于验证页面填充和移动端自适应效果。</p>
    <div class="test-content">
      <div class="test-card">
        <h3>页面填充测试</h3>
        <p>此页面应该完全填充浏览器窗口</p>
      </div>
      <div class="test-card">
        <h3>移动端自适应测试</h3>
        <p>在移动设备上访问时，页面应该自适应屏幕大小</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的测试页面
</script>

<style scoped>
.home-page {
  padding: 20px;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.home-page h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.home-page p {
  font-size: 1.2em;
  margin-bottom: 30px;
  opacity: 0.9;
}

.test-content {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.test-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 250px;
}

.test-card h3 {
  margin-bottom: 10px;
  font-size: 1.3em;
}

.test-card p {
  margin: 0;
  font-size: 1em;
  opacity: 0.8;
}

/* 移动端自适应样式 */
@media (max-width: 768px) {
  .home-page {
    padding: 15px;
  }
  
  .home-page h1 {
    font-size: 2em;
  }
  
  .home-page p {
    font-size: 1em;
  }
  
  .test-content {
    flex-direction: column;
    align-items: center;
  }
  
  .test-card {
    min-width: 200px;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 10px;
  }
  
  .home-page h1 {
    font-size: 1.5em;
  }
  
  .home-page p {
    font-size: 0.9em;
  }
  
  .test-card {
    min-width: 150px;
    padding: 10px;
  }
  
  .test-card h3 {
    font-size: 1.1em;
  }
  
  .test-card p {
    font-size: 0.8em;
  }
}
</style>