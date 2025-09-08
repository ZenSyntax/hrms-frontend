---
title: HRMS Statistics API
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# HRMS Statistics API

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# 数据统计接口

## GET 获取总览统计

GET /statistics/overview

获取系统总览统计数据，包括员工总数、岗位数量、部门数量、薪资总额等关键指标。

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalEmployees": 156,
    "activeEmployees": 142,
    "totalJobs": 28,
    "totalDepartments": 12,
    "totalSalary": 1250000,
    "averageSalary": 8800,
    "monthlyGrowth": 2.5
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|StatisticsOverviewVO|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||响应码|
|» message|string|true|none||响应消息|
|» data|object|true|none||统计数据|
|»» totalEmployees|integer|true|none||总员工数|
|»» activeEmployees|integer|true|none||在职员工数|
|»» totalJobs|integer|true|none||岗位总数|
|»» totalDepartments|integer|true|none||部门总数|
|»» totalSalary|integer|true|none||薪资总额|
|»» averageSalary|integer|true|none||平均薪资|
|»» monthlyGrowth|number|true|none||月度增长率(%)|

## GET 获取员工统计

GET /statistics/employee

获取员工相关的统计数据，包括员工类型分布、学历分布、性别分布、年龄分布、入职离职趋势等。

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "employeeTypeDistribution": {
      "formal": 120,
      "temporary": 15,
      "intern": 7
    },
    "educationDistribution": {
      "bachelorAbove": 45,
      "bachelor": 60,
      "college": 30,
      "highSchool": 15,
      "belowHighSchool": 6
    },
    "genderDistribution": {
      "male": 85,
      "female": 57
    },
    "ageDistribution": {
      "under25": 25,
      "age25to30": 45,
      "age30to40": 50,
      "age40to50": 20,
      "above50": 2
    },
    "onboardingTrend": [
      {
        "month": "2024-01",
        "count": 8
      }
    ],
    "departureTrend": [
      {
        "month": "2024-01",
        "count": 3
      }
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|EmployeeStatisticsVO|

## GET 获取薪资统计

GET /statistics/salary

获取薪资相关的统计数据，包括薪资分布、平均薪资趋势、部门薪资对比、岗位薪资对比等。

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "salaryDistribution": {
      "under5000": 15,
      "salary5000to8000": 45,
      "salary8000to12000": 60,
      "salary12000to20000": 25,
      "above20000": 8
    },
    "averageSalaryTrend": [
      {
        "month": "2024-01",
        "averageSalary": 8500,
        "maxSalary": 12000,
        "minSalary": 5000
      }
    ],
    "departmentSalaryComparison": [
      {
        "departmentName": "技术部",
        "averageSalary": 12000,
        "maxSalary": 20000,
        "minSalary": 8000,
        "employeeCount": 45
      }
    ],
    "jobSalaryComparison": [
      {
        "jobName": "高级工程师",
        "averageSalary": 15000,
        "maxSalary": 25000,
        "minSalary": 12000,
        "employeeCount": 20
      }
    ],
    "salaryGrowthRate": {
      "monthlyGrowth": 1.2,
      "yearlyGrowth": 15.5
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|SalaryStatisticsVO|


## GET 获取培训统计

GET /statistics/training

获取培训相关的统计数据，包括培训课程统计、学员统计、培训效果统计、培训成本统计等。

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "courseStatistics": {
      "totalCourses": 25,
      "completedCourses": 18,
      "ongoingCourses": 5,
      "plannedCourses": 2
    },
    "traineeStatistics": {
      "totalTrainees": 156,
      "completedTrainees": 120,
      "ongoingTrainees": 30,
      "completionRate": 76.9
    },
    "trainingEffectiveness": [
      {
        "courseName": "新员工入职培训",
        "completionRate": 95.0,
        "averageScore": 88.5,
        "satisfactionRate": 92.0
      }
    ],
    "trainingCostStats": [
      {
        "month": "2024-01",
        "totalCost": 50000,
        "costPerTrainee": 320,
        "budgetUtilization": 85.0
      }
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|TrainingStatisticsVO|

## GET 获取系统统计

GET /statistics/system

获取系统相关的统计数据，包括用户活跃度统计、系统性能统计、操作日志统计、数据增长统计等。

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userActivityStats": [
      {
        "date": "2024-01-01",
        "activeUsers": 45,
        "loginCount": 120,
        "operationCount": 850
      }
    ],
    "systemPerformanceStats": {
      "averageResponseTime": 150,
      "errorRate": 0.5,
      "uptime": 99.8,
      "peakConcurrentUsers": 65
    },
    "operationLogStats": [
      {
        "operationType": "员工管理",
        "count": 1250,
        "successRate": 98.5
      }
    ],
    "dataGrowthStats": [
      {
        "month": "2024-01",
        "employeeGrowth": 8,
        "salaryGrowth": 125000,
        "logGrowth": 2500
      }
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|SystemStatisticsVO|

## GET 获取收支统计

GET /statistics/payment

获取收支相关的统计数据，包括收支概览、收入构成、支出构成、收支趋势、成本分析等。

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "paymentOverview": {
      "totalRevenue": 2500000,
      "totalExpense": 1800000,
      "netProfit": 700000,
      "profitMargin": 28.0
    },
    "revenueComposition": [
      {
        "category": "主营业务收入",
        "amount": 2000000,
        "percentage": 80.0
      }
    ],
    "expenseComposition": [
      {
        "category": "人力成本",
        "amount": 1200000,
        "percentage": 66.7
      }
    ],
    "paymentTrend": [
      {
        "month": "2024-01",
        "revenue": 200000,
        "expense": 150000,
        "profit": 50000
      }
    ],
    "costAnalysis": {
      "salaryCost": 1200000,
      "trainingCost": 50000,
      "operationCost": 200000,
      "otherCost": 350000
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|PaymentStatisticsVO|

# 数据模型

<h2 id="tocS_StatisticsOverviewVO">StatisticsOverviewVO</h2>

<a id="schemastatisticsoverviewvo"></a>
<a id="schema_StatisticsOverviewVO"></a>
<a id="tocSstatisticsoverviewvo"></a>
<a id="tocsstatisticsoverviewvo"></a>

```json
{
  "totalEmployees": 156,
  "activeEmployees": 142,
  "totalJobs": 28,
  "totalDepartments": 12,
  "totalSalary": 1250000,
  "averageSalary": 8800,
  "monthlyGrowth": 2.5
}
```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|totalEmployees|integer|true|none||总员工数|
|activeEmployees|integer|true|none||在职员工数|
|totalJobs|integer|true|none||岗位总数|
|totalDepartments|integer|true|none||部门总数|
|totalSalary|integer|true|none||薪资总额|
|averageSalary|integer|true|none||平均薪资|
|monthlyGrowth|number|true|none||月度增长率(%)|

<h2 id="tocS_EmployeeStatisticsVO">EmployeeStatisticsVO</h2>

<a id="schemaemployeestatisticsvo"></a>
<a id="schema_EmployeeStatisticsVO"></a>
<a id="tocSemployeestatisticsvo"></a>
<a id="tocsemployeestatisticsvo"></a>

```json
{
  "employeeTypeDistribution": {
    "formal": 120,
    "temporary": 15,
    "intern": 7
  },
  "educationDistribution": {
    "bachelorAbove": 45,
    "bachelor": 60,
    "college": 30,
    "highSchool": 15,
    "belowHighSchool": 6
  },
  "genderDistribution": {
    "male": 85,
    "female": 57
  },
  "ageDistribution": {
    "under25": 25,
    "age25to30": 45,
    "age30to40": 50,
    "age40to50": 20,
    "above50": 2
  },
  "onboardingTrend": [
    {
      "month": "2024-01",
      "count": 8
    }
  ],
  "departureTrend": [
    {
      "month": "2024-01",
      "count": 3
    }
  ]
}
```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|employeeTypeDistribution|object|true|none||员工类型分布|
|» formal|integer|true|none||正式工数量|
|» temporary|integer|true|none||临时工数量|
|» intern|integer|true|none||实习生数量|
|educationDistribution|object|true|none||学历分布|
|» bachelorAbove|integer|true|none||本科以上|
|» bachelor|integer|true|none||本科|
|» college|integer|true|none||大专|
|» highSchool|integer|true|none||高中|
|» belowHighSchool|integer|true|none||初中及以下|
|genderDistribution|object|true|none||性别分布|
|» male|integer|true|none||男性数量|
|» female|integer|true|none||女性数量|
|ageDistribution|object|true|none||年龄分布|
|» under25|integer|true|none||25岁以下|
|» age25to30|integer|true|none||25-30岁|
|» age30to40|integer|true|none||30-40岁|
|» age40to50|integer|true|none||40-50岁|
|» above50|integer|true|none||50岁以上|
|onboardingTrend|[object]|true|none||入职趋势|
|» month|string|true|none||月份|
|» count|integer|true|none||入职人数|
|departureTrend|[object]|true|none||离职趋势|
|» month|string|true|none||月份|
|» count|integer|true|none||离职人数|

<h2 id="tocS_SalaryStatisticsVO">SalaryStatisticsVO</h2>

<a id="schemasalarystatisticsvo"></a>
<a id="schema_SalaryStatisticsVO"></a>
<a id="tocSsalarystatisticsvo"></a>
<a id="tocssalarystatisticsvo"></a>

```json
{
  "salaryDistribution": {
    "under5000": 15,
    "salary5000to8000": 45,
    "salary8000to12000": 60,
    "salary12000to20000": 25,
    "above20000": 8
  },
  "averageSalaryTrend": [
    {
      "month": "2024-01",
      "averageSalary": 8500,
      "maxSalary": 12000,
      "minSalary": 5000
    }
  ],
  "departmentSalaryComparison": [
    {
      "departmentName": "技术部",
      "averageSalary": 12000,
      "maxSalary": 20000,
      "minSalary": 8000,
      "employeeCount": 45
    }
  ],
  "jobSalaryComparison": [
    {
      "jobName": "高级工程师",
      "averageSalary": 15000,
      "maxSalary": 25000,
      "minSalary": 12000,
      "employeeCount": 20
    }
  ],
  "salaryGrowthRate": {
    "monthlyGrowth": 1.2,
    "yearlyGrowth": 15.5
  }
}
```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|salaryDistribution|object|true|none||薪资分布|
|» under5000|integer|true|none||5000以下人数|
|» salary5000to8000|integer|true|none||5000-8000人数|
|» salary8000to12000|integer|true|none||8000-12000人数|
|» salary12000to20000|integer|true|none||12000-20000人数|
|» above20000|integer|true|none||20000以上人数|
|averageSalaryTrend|[object]|true|none||平均薪资趋势|
|» month|string|true|none||月份|
|» averageSalary|integer|true|none||平均薪资|
|» maxSalary|integer|true|none||最高薪资|
|» minSalary|integer|true|none||最低薪资|
|departmentSalaryComparison|[object]|true|none||部门薪资对比|
|» departmentName|string|true|none||部门名称|
|» averageSalary|integer|true|none||平均薪资|
|» maxSalary|integer|true|none||最高薪资|
|» minSalary|integer|true|none||最低薪资|
|» employeeCount|integer|true|none||员工数量|
|jobSalaryComparison|[object]|true|none||岗位薪资对比|
|» jobName|string|true|none||岗位名称|
|» averageSalary|integer|true|none||平均薪资|
|» maxSalary|integer|true|none||最高薪资|
|» minSalary|integer|true|none||最低薪资|
|» employeeCount|integer|true|none||员工数量|
|salaryGrowthRate|object|true|none||薪资增长率|
|» monthlyGrowth|number|true|none||月度增长率(%)|
|» yearlyGrowth|number|true|none||年度增长率(%)|


<h2 id="tocS_TrainingStatisticsVO">TrainingStatisticsVO</h2>

<a id="schematrainingstatisticsvo"></a>
<a id="schema_TrainingStatisticsVO"></a>
<a id="tocStrainingstatisticsvo"></a>
<a id="tocstrainingstatisticsvo"></a>

```json
{
  "courseStatistics": {
    "totalCourses": 25,
    "completedCourses": 18,
    "ongoingCourses": 5,
    "plannedCourses": 2
  },
  "traineeStatistics": {
    "totalTrainees": 156,
    "completedTrainees": 120,
    "ongoingTrainees": 30,
    "completionRate": 76.9
  },
  "trainingEffectiveness": [
    {
      "courseName": "新员工入职培训",
      "completionRate": 95.0,
      "averageScore": 88.5,
      "satisfactionRate": 92.0
    }
  ],
  "trainingCostStats": [
    {
      "month": "2024-01",
      "totalCost": 50000,
      "costPerTrainee": 320,
      "budgetUtilization": 85.0
    }
  ]
}
```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|courseStatistics|object|true|none||培训课程统计|
|» totalCourses|integer|true|none||总课程数|
|» completedCourses|integer|true|none||已完成课程数|
|» ongoingCourses|integer|true|none||进行中课程数|
|» plannedCourses|integer|true|none||计划课程数|
|traineeStatistics|object|true|none||学员统计|
|» totalTrainees|integer|true|none||总学员数|
|» completedTrainees|integer|true|none||已完成学员数|
|» ongoingTrainees|integer|true|none||进行中学员数|
|» completionRate|number|true|none||完成率(%)|
|trainingEffectiveness|[object]|true|none||培训效果统计|
|» courseName|string|true|none||课程名称|
|» completionRate|number|true|none||完成率(%)|
|» averageScore|number|true|none||平均分数|
|» satisfactionRate|number|true|none||满意度(%)|
|trainingCostStats|[object]|true|none||培训成本统计|
|» month|string|true|none||月份|
|» totalCost|integer|true|none||总成本|
|» costPerTrainee|integer|true|none||人均成本|
|» budgetUtilization|number|true|none||预算利用率(%)|

<h2 id="tocS_SystemStatisticsVO">SystemStatisticsVO</h2>

<a id="schemasystemstatisticsvo"></a>
<a id="schema_SystemStatisticsVO"></a>
<a id="tocSsystemstatisticsvo"></a>
<a id="tocssystemstatisticsvo"></a>

```json
{
  "userActivityStats": [
    {
      "date": "2024-01-01",
      "activeUsers": 45,
      "loginCount": 120,
      "operationCount": 850
    }
  ],
  "systemPerformanceStats": {
    "averageResponseTime": 150,
    "errorRate": 0.5,
    "uptime": 99.8,
    "peakConcurrentUsers": 65
  },
  "operationLogStats": [
    {
      "operationType": "员工管理",
      "count": 1250,
      "successRate": 98.5
    }
  ],
  "dataGrowthStats": [
    {
      "month": "2024-01",
      "employeeGrowth": 8,
      "salaryGrowth": 125000,
      "logGrowth": 2500
    }
  ]
}
```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|userActivityStats|[object]|true|none||用户活跃度统计|
|» date|string|true|none||日期|
|» activeUsers|integer|true|none||活跃用户数|
|» loginCount|integer|true|none||登录次数|
|» operationCount|integer|true|none||操作次数|
|systemPerformanceStats|object|true|none||系统性能统计|
|» averageResponseTime|integer|true|none||平均响应时间(ms)|
|» errorRate|number|true|none||错误率(%)|
|» uptime|number|true|none||系统可用性(%)|
|» peakConcurrentUsers|integer|true|none||峰值并发用户数|
|operationLogStats|[object]|true|none||操作日志统计|
|» operationType|string|true|none||操作类型|
|» count|integer|true|none||操作次数|
|» successRate|number|true|none||成功率(%)|
|dataGrowthStats|[object]|true|none||数据增长统计|
|» month|string|true|none||月份|
|» employeeGrowth|integer|true|none||员工增长数|
|» salaryGrowth|integer|true|none||薪资增长额|
|» logGrowth|integer|true|none||日志增长数|

<h2 id="tocS_PaymentStatisticsVO">PaymentStatisticsVO</h2>

<a id="schemapaymentstatisticsvo"></a>
<a id="schema_PaymentStatisticsVO"></a>
<a id="tocSpaymentstatisticsvo"></a>
<a id="tocspaymentstatisticsvo"></a>

```json
{
  "paymentOverview": {
    "totalRevenue": 2500000,
    "totalExpense": 1800000,
    "netProfit": 700000,
    "profitMargin": 28.0
  },
  "revenueComposition": [
    {
      "category": "主营业务收入",
      "amount": 2000000,
      "percentage": 80.0
    }
  ],
  "expenseComposition": [
    {
      "category": "人力成本",
      "amount": 1200000,
      "percentage": 66.7
    }
  ],
  "paymentTrend": [
    {
      "month": "2024-01",
      "revenue": 200000,
      "expense": 150000,
      "profit": 50000
    }
  ],
  "costAnalysis": {
    "salaryCost": 1200000,
    "trainingCost": 50000,
    "operationCost": 200000,
    "otherCost": 350000
  }
}
```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|paymentOverview|object|true|none||收支概览|
|» totalRevenue|integer|true|none||总收入|
|» totalExpense|integer|true|none||总支出|
|» netProfit|integer|true|none||净利润|
|» profitMargin|number|true|none||利润率(%)|
|revenueComposition|[object]|true|none||收入构成|
|» category|string|true|none||收入类别|
|» amount|integer|true|none||金额|
|» percentage|number|true|none||占比(%)|
|expenseComposition|[object]|true|none||支出构成|
|» category|string|true|none||支出类别|
|» amount|integer|true|none||金额|
|» percentage|number|true|none||占比(%)|
|paymentTrend|[object]|true|none||收支趋势|
|» month|string|true|none||月份|
|» revenue|integer|true|none||收入|
|» expense|integer|true|none||支出|
|» profit|integer|true|none||利润|
|costAnalysis|object|true|none||成本分析|
|» salaryCost|integer|true|none||薪资成本|
|» trainingCost|integer|true|none||培训成本|
|» operationCost|integer|true|none||运营成本|
|» otherCost|integer|true|none||其他成本|
