# Image Hover Preview

一个Chrome浏览器扩展，为任意网页提供图片悬停预览功能。当鼠标悬停在图片上时，自动显示图片的放大预览。

## 功能特性

- 🖼️ **智能图片检测** - 支持 `<img>` 标签和CSS背景图片
- 🔍 **自动放大预览** - 仅当原图比显示尺寸更大时才显示预览
- 📱 **响应式定位** - 智能调整预览位置，避免超出视口边界
- 🌙 **深色模式支持** - 自动适配系统深色/浅色主题
- ⚡ **懒加载支持** - 处理各种懒加载图片格式（data-src, data-lazy-src等）
- 🚀 **动态内容支持** - 使用MutationObserver监听新增的图片元素
- 🎨 **优雅过渡效果** - 平滑的淡入淡出动画
- 🎛️ **按网站控制** - 可以为每个网站单独启用或禁用功能
- 💾 **设置持久化** - 用户偏好设置自动保存

## 安装方法

### 开发者模式安装

1. 下载或克隆此仓库到本地
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录
6. 扩展安装完成！

## 使用说明

安装后，扩展会自动在所有网页上工作：

1. **基本使用**：
   - 将鼠标悬停在任意图片上
   - 等待150毫秒后自动显示放大预览
   - 移开鼠标或滚动页面即可隐藏预览
   - 预览会跟随鼠标移动，并智能避开边界

2. **控制设置**：
   - 点击浏览器工具栏中的扩展图标
   - 使用开关为当前网站启用或禁用功能
   - 设置会自动保存并在下次访问时生效

## 技术实现

### 支持的图片格式

- 标准 `<img>` 元素
- CSS `background-image` 属性
- 懒加载图片：
  - `data-src`
  - `data-lazy-src` 
  - `data-original`
  - 其他常见懒加载属性

### 智能过滤

- 自动跳过占位符图片（SVG、GIF等）
- 仅对需要放大的图片显示预览
- 处理相对路径URL转换

### 性能优化

- 使用防抖机制避免频繁触发
- 智能缓存和DOM操作优化
- 最小化重排和重绘

## 项目结构

```
chrome-ext-image-hover-preview/
├── manifest.json           # 扩展清单文件
├── icons/                  # 扩展图标
│   ├── icon16.png         # 16x16 图标
│   ├── icon48.png         # 48x48 图标
│   └── icon128.png        # 128x128 图标
├── content/               # 内容脚本
│   ├── content.js         # 主要功能逻辑
│   └── content.css        # 预览样式
├── popup/                 # 扩展弹窗界面
│   ├── popup.html         # 弹窗UI结构
│   └── popup.js           # 弹窗功能逻辑
├── CLAUDE.md              # 开发者文档
└── README.md              # 项目文档
```

## 开发调试

### 调试信息

扩展在浏览器控制台中提供详细的调试信息：

```javascript
// 在控制台查看调试日志
console.log('ImageHover Debug:', {
    element: element,
    resolvedSrc: imgSrc,
    naturalWidth: element.naturalWidth,
    // ... 更多调试信息
});
```

### 修改配置

可以在 `content/content.js` 中调整以下参数：

```javascript
const HOVER_DELAY = 150;  // 悬停延迟时间（毫秒）
```

## 浏览器兼容性

- ✅ Chrome 88+（Manifest V3支持）
- ✅ Microsoft Edge 88+
- ✅ 其他基于Chromium的浏览器

## 权限说明

此扩展仅使用以下权限：

- `activeTab` - 允许在当前激活标签页中运行内容脚本
- `storage` - 存储用户的按网站启用/禁用偏好设置
- 无需访问用户数据或发送网络请求

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork此仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT License](LICENSE)

## 更新日志

### v1.0.0
- 初始版本发布
- 基础图片悬停预览功能
- 支持懒加载图片
- 深色模式适配
- 智能定位和边界检测
- 新增弹窗界面进行按网站控制
- 添加Chrome存储API支持用户偏好设置
- 优化图片尺寸检测逻辑
- 减少悬停延迟至150ms提升响应性