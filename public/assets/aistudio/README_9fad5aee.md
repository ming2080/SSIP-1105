# 船厂三维场景（AI Studio 导入版）

这是从智慧船厂驾驶舱拆出的独立 Three.js 前端页面，不依赖原 React 驾驶舱。

## 文件
- `index.html`：页面结构、样式与 Three.js CDN import map。
- `app.js`：已打包的场景与交互逻辑。

## 本地预览
建议从此目录启动静态 HTTP 服务，再访问 `http://localhost:8000`：

```bash
cd outputs/shipyard-aistudio
python3 -m http.server 8000
```

页面使用 Three.js 0.186.0 的 jsDelivr CDN，因此预览/运行时需要网络连接。

## 交互
- 鼠标左键拖动旋转，右键拖动平移，滚轮缩放。
- 底部可切换斜俯视、顶视、码头和办公生活区视角。
- 右侧可筛选人员、设备、电子围栏，搜索并点选对象定位。
- 当前人员、设备、围栏为演示数据，几何位置为示意坐标，不是实时定位或测绘坐标。
