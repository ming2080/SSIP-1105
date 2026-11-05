import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  Box, 
  Rotate3d, 
  Eye, 
  Compass, 
  Layers, 
  Maximize2,
  Sparkles,
  Camera,
  Sun,
  ShieldAlert,
  Sliders
} from 'lucide-react';

interface Shipyard3DSceneProps {
  viewScope: 'yard' | 'project';
  projectId?: string;
  selectedModelLevel?: string;
  onBackgroundClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

export function Shipyard3DScene({
  viewScope,
  projectId = 'H1851A',
  selectedModelLevel = 'all',
  onBackgroundClick,
  className = ''
}: Shipyard3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  
  // 3D 运行时状态控制
  const [isRotating, setIsRotating] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [lightingPreset, setLightingPreset] = useState<'night' | 'dusk' | 'day'>('night');
  const [showControlsHint, setShowControlsHint] = useState(true);

  // 引用保留以避免重渲染时重复挂载
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  
  // 场景中动态组对象引用
  const yardGroupRef = useRef<THREE.Group | null>(null);
  const shipGroupRef = useRef<THREE.Group | null>(null);
  const craneHookGroupRef = useRef<THREE.Group | null>(null);
  const wavesMeshRef = useRef<THREE.Mesh | null>(null);
  const radarScanRef = useRef<THREE.Mesh | null>(null);
  const levelGroupsRef = useRef<Record<string, THREE.Group>>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. 检测软件 WebGL 环境防崩溃
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. 场景与电影级环境光初始化 (ACESFilmicToneMapping & RoomEnvironment)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020b14);
    scene.fog = new THREE.FogExp2(0x020b14, 0.0035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    cameraRef.current = camera;
    if (viewScope === 'yard') {
      camera.position.set(220, 160, 240);
      camera.lookAt(0, 20, 0);
    } else {
      camera.position.set(160, 110, 180);
      camera.lookAt(0, 15, 0);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio PBR Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // 防止穿透地面
    controls.minDistance = 30;
    controls.maxDistance = 650;
    controls.target.set(0, 15, 0);

    // 5. 灯光系统（冷暖对比 3 点照明）
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020b14, 0.85);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.8);
    dirLight.position.set(150, 220, 120);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.castShadow) {
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 600;
      const d = 180;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0004;
    }
    scene.add(dirLight);

    const blueRimLight = new THREE.DirectionalLight(0x0284c7, 1.2);
    blueRimLight.position.set(-150, 90, -150);
    scene.add(blueRimLight);

    const dockCyanPoint = new THREE.PointLight(0x00e5ff, 2.5, 200);
    dockCyanPoint.position.set(0, 40, 0);
    scene.add(dockCyanPoint);

    // ==================== 6. 3D 资产建模系统 ====================

    // A. 数字化海床水面 (带动态流动与科技栅格)
    const waterGeo = new THREE.PlaneGeometry(1600, 1600, 48, 48);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x03182b,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -0.2;
    waterMesh.receiveShadow = !isSoftwareGl;
    scene.add(waterMesh);
    wavesMeshRef.current = waterMesh;

    // 水面科技微网格
    const gridHelper = new THREE.GridHelper(800, 80, 0x00e5ff, 0x0f3460);
    gridHelper.position.y = 0.05;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    scene.add(gridHelper);

    // B. 造船厂全景模式组
    const yardGroup = new THREE.Group();
    yardGroupRef.current = yardGroup;
    scene.add(yardGroup);

    // 1号干船坞基座
    const dockFloorGeo = new THREE.BoxGeometry(280, 10, 100);
    const dockFloorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.3
    });
    const dockFloor = new THREE.Mesh(dockFloorGeo, dockFloorMat);
    dockFloor.position.set(0, 2, 0);
    dockFloor.receiveShadow = !isSoftwareGl;
    yardGroup.add(dockFloor);

    // 船坞两侧混凝土防汛坞墙
    const wallGeo = new THREE.BoxGeometry(280, 16, 8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.65,
      metalness: 0.25
    });
    const northWall = new THREE.Mesh(wallGeo, wallMat);
    northWall.position.set(0, 12, 54);
    northWall.castShadow = !isSoftwareGl;
    northWall.receiveShadow = !isSoftwareGl;
    yardGroup.add(northWall);

    const southWall = new THREE.Mesh(wallGeo, wallMat);
    southWall.position.set(0, 12, -54);
    southWall.castShadow = !isSoftwareGl;
    southWall.receiveShadow = !isSoftwareGl;
    yardGroup.add(southWall);

    // 800吨造船重型龙门吊 (Composite 3-12 parts)
    const craneGroup = new THREE.Group();
    craneGroup.position.set(-40, 0, 0);

    const craneLegMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // 经典工程工业黄
      roughness: 0.4,
      metalness: 0.6
    });

    // 门式四立柱腿
    const legGeo = new THREE.CylinderGeometry(2, 3, 90, 8);
    const leg1 = new THREE.Mesh(legGeo, craneLegMat);
    leg1.position.set(-8, 45, 60);
    leg1.rotation.z = -0.06;
    leg1.castShadow = !isSoftwareGl;
    craneGroup.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, craneLegMat);
    leg2.position.set(8, 45, 60);
    leg2.rotation.z = 0.06;
    leg2.castShadow = !isSoftwareGl;
    craneGroup.add(leg2);

    const leg3 = new THREE.Mesh(legGeo, craneLegMat);
    leg3.position.set(-8, 45, -60);
    leg3.rotation.z = -0.06;
    leg3.castShadow = !isSoftwareGl;
    craneGroup.add(leg3);

    const leg4 = new THREE.Mesh(legGeo, craneLegMat);
    leg4.position.set(8, 45, -60);
    leg4.rotation.z = 0.06;
    leg4.castShadow = !isSoftwareGl;
    craneGroup.add(leg4);

    // 主横梁桁架 (箱型大梁)
    const girderGeo = new THREE.BoxGeometry(24, 10, 140);
    const girderMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
      metalness: 0.7
    });
    const mainGirder = new THREE.Mesh(girderGeo, girderMat);
    mainGirder.position.set(0, 92, 0);
    mainGirder.castShadow = !isSoftwareGl;
    craneGroup.add(mainGirder);

    // 起升小车与吊钩
    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.set(0, 86, 0);
    const trolleyGeo = new THREE.BoxGeometry(14, 5, 14);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 });
    const trolley = new THREE.Mesh(trolleyGeo, trolleyMat);
    trolleyGroup.add(trolley);

    // 钢丝绳与吊钩
    const cableGeo = new THREE.CylinderGeometry(0.25, 0.25, 45, 6);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.set(0, -22.5, 0);
    trolleyGroup.add(cable);

    const hookGeo = new THREE.TorusGeometry(3.5, 1.2, 8, 16, Math.PI * 1.5);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.position.set(0, -45, 0);
    hook.rotation.z = Math.PI;
    trolleyGroup.add(hook);
    craneHookGroupRef.current = trolleyGroup;
    craneGroup.add(trolleyGroup);

    yardGroup.add(craneGroup);

    // C. 3D 巨轮数字化船体模型 (包含分层分舱结构)
    const shipGroup = new THREE.Group();
    shipGroupRef.current = shipGroup;
    shipGroup.position.set(10, 7, 0);
    scene.add(shipGroup);

    levelGroupsRef.current = {};

    // 分层 1：船底龙骨与双层底压载舱 (Keel & Ballast Tanks)
    const bottomLevelGroup = new THREE.Group();
    levelGroupsRef.current['bottom'] = bottomLevelGroup;
    const keelGeo = new THREE.BoxGeometry(180, 6, 46);
    const keelMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // 工业防污漆红
      roughness: 0.45,
      metalness: 0.5
    });
    const keel = new THREE.Mesh(keelGeo, keelMat);
    keel.position.set(0, 3, 0);
    keel.castShadow = !isSoftwareGl;
    bottomLevelGroup.add(keel);

    // 流线型球鼻艏 (Bulbous Bow)
    const bulbBowGeo = new THREE.SphereGeometry(12, 16, 16);
    bulbBowGeo.scale(1.8, 0.8, 1);
    const bulbBow = new THREE.Mesh(bulbBowGeo, keelMat);
    bulbBow.position.set(90, 3, 0);
    bottomLevelGroup.add(bulbBow);
    shipGroup.add(bottomLevelGroup);

    // 分层 2：货舱与中层甲板 (Cargo Holds & Mid Decks)
    const midLevelGroup = new THREE.Group();
    levelGroupsRef.current['mid'] = midLevelGroup;

    // 货舱主体
    const hullMidGeo = new THREE.BoxGeometry(170, 18, 48);
    const hullMidMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // 数字化科技蓝
      roughness: 0.3,
      metalness: 0.65
    });
    const hullMid = new THREE.Mesh(hullMidGeo, hullMidMat);
    hullMid.position.set(-2, 15, 0);
    hullMid.castShadow = !isSoftwareGl;
    midLevelGroup.add(hullMid);

    // 4座货舱舱口围壁与舱盖
    const hatchMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.4,
      metalness: 0.5
    });
    for (let i = 0; i < 4; i++) {
      const hatchGeo = new THREE.BoxGeometry(26, 4, 34);
      const hatch = new THREE.Mesh(hatchGeo, hatchMat);
      hatch.position.set(-55 + i * 36, 25, 0);
      hatch.castShadow = !isSoftwareGl;
      midLevelGroup.add(hatch);
    }
    shipGroup.add(midLevelGroup);

    // 分层 3：机舱动力受控区 (Engine Room Section)
    const engineLevelGroup = new THREE.Group();
    levelGroupsRef.current['engine'] = engineLevelGroup;
    const engineRoomGeo = new THREE.BoxGeometry(38, 16, 44);
    const engineRoomMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // 工业机舱琥珀橙
      roughness: 0.35,
      metalness: 0.7
    });
    const engineRoom = new THREE.Mesh(engineRoomGeo, engineRoomMat);
    engineRoom.position.set(-68, 14, 0);
    engineRoom.castShadow = !isSoftwareGl;
    engineLevelGroup.add(engineRoom);

    // 烟囱 (Funnel)
    const funnelGeo = new THREE.CylinderGeometry(4, 5, 20, 12);
    funnelGeo.scale(1.4, 1, 1);
    const funnelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.8
    });
    const funnel = new THREE.Mesh(funnelGeo, funnelMat);
    funnel.position.set(-72, 38, 0);
    funnel.rotation.z = -0.1;
    engineLevelGroup.add(funnel);
    shipGroup.add(engineLevelGroup);

    // 分层 4：上层建筑与驾驶台 (Bridge & Accommodation Deckhouse)
    const deckLevelGroup = new THREE.Group();
    levelGroupsRef.current['deck'] = deckLevelGroup;

    // 5层楼起居建筑群
    const bridgeGeo = new THREE.BoxGeometry(28, 22, 42);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // 工业白
      roughness: 0.2,
      metalness: 0.4
    });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(-52, 34, 0);
    bridge.castShadow = !isSoftwareGl;
    deckLevelGroup.add(bridge);

    // 驾驶台飞桥通透视窗
    const glassGeo = new THREE.BoxGeometry(22, 5, 43.5);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: 0.7
    });
    const bridgeGlass = new THREE.Mesh(glassGeo, glassMat);
    bridgeGlass.position.set(-50, 41, 0);
    deckLevelGroup.add(bridgeGlass);

    // 主雷达桅杆
    const mastGeo = new THREE.CylinderGeometry(0.8, 1.2, 28, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(-48, 56, 0);
    deckLevelGroup.add(mast);

    // 旋转航海雷达天线
    const radarGeo = new THREE.BoxGeometry(10, 1.2, 1.5);
    const radarMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const radar = new THREE.Mesh(radarGeo, radarMat);
    radar.position.set(-48, 70, 0);
    radarScanRef.current = radar;
    deckLevelGroup.add(radar);

    shipGroup.add(deckLevelGroup);

    // 船身周围的物联网安全感知光柱光环
    const beaconGeo = new THREE.RingGeometry(18, 20, 32);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.rotation.x = -Math.PI / 2;
    beacon.position.set(0, 0.4, 0);
    shipGroup.add(beacon);

    // ==================== 7. 高帧率动画渲染主循环 ====================
    let clock = new THREE.Clock();
    let hookDir = 1;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 雷达自转
      if (radarScanRef.current) {
        radarScanRef.current.rotation.y += 0.045;
      }

      // 吊车起升微动画
      if (craneHookGroupRef.current) {
        craneHookGroupRef.current.position.z += hookDir * delta * 4;
        if (craneHookGroupRef.current.position.z > 35) hookDir = -1;
        if (craneHookGroupRef.current.position.z < -35) hookDir = 1;
      }

      // 自动漫游慢旋转 (受 isRotating 开关控制)
      if (isRotating && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 0.65;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 窗口尺寸自适应
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 视角切换与模型分层过滤联动
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !yardGroupRef.current || !shipGroupRef.current) return;

    if (viewScope === 'yard') {
      // 全厂视角：显示全厂坞区
      yardGroupRef.current.visible = true;
      shipGroupRef.current.position.set(10, 7, 0);
      shipGroupRef.current.scale.set(1, 1, 1);
      
      // 相机平滑过渡至全厂大景深
      controlsRef.current.target.set(0, 20, 0);
    } else {
      // 项目孪生专属视角：聚焦船舶模型
      yardGroupRef.current.visible = false;
      shipGroupRef.current.position.set(0, 5, 0);
      shipGroupRef.current.scale.set(1.25, 1.25, 1.25);
      
      controlsRef.current.target.set(0, 25, 0);
    }

    // 分层模型滤镜控制
    const groups: Record<string, THREE.Group> = levelGroupsRef.current;
    if (groups) {
      if (selectedModelLevel === 'all') {
        Object.values(groups).forEach((g: THREE.Group) => {
          g.visible = true;
          g.position.y = 0;
        });
      } else {
        // 隔离高亮选中的空间层级
        Object.entries(groups).forEach(([key, g]: [string, THREE.Group]) => {
          if (key === selectedModelLevel || selectedModelLevel.includes(key)) {
            g.visible = true;
            g.position.y = 8; // 微微浮起呈现爆炸图/分层透视效果
          } else {
            g.visible = selectedModelLevel === 'all';
            g.position.y = 0;
          }
        });
      }
    }
  }, [viewScope, projectId, selectedModelLevel]);

  // 线框模式切换
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m: any) => {
            if ('wireframe' in m) {
              m.wireframe = wireframeMode;
            }
          });
        } else if (mesh.material && 'wireframe' in (mesh.material as any)) {
          (mesh.material as any).wireframe = wireframeMode;
        }
      }
    });
  }, [wireframeMode]);

  // 重置回最佳观察视角
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (viewScope === 'yard') {
      cameraRef.current.position.set(220, 160, 240);
      controlsRef.current.target.set(0, 20, 0);
    } else {
      cameraRef.current.position.set(160, 110, 180);
      controlsRef.current.target.set(0, 15, 0);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      
      {/* 3D WebGL Canvas 挂载点 */}
      <div 
        ref={mountRef} 
        onClick={onBackgroundClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 顶部中央 3D 空间孪生状态胶囊 */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 bg-[#061833]/85 border border-[#00e5ff]/50 px-3.5 py-1 rounded-full text-xs text-[#e2f1ff] shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
        <span className="font-mono text-[#00e5ff] font-bold">THREE.JS PBR</span>
        <span className="text-slate-400">|</span>
        <span>{viewScope === 'yard' ? '船厂全景 3D 数字孪生' : `${projectId} 3D 船舶工程实体`}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>

      {/* 底部悬浮 3D 交互控制坞（符合规范：底部居中、可折叠、不遮挡主要模型视口） */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1.5 bg-[#061833]/90 border border-[#1f4a7c]/80 p-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md text-xs">
        
        {/* 自动巡航/漫游旋转开关 */}
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
            isRotating 
              ? 'bg-[#0284c7] text-white shadow-sm shadow-blue-500/30' 
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="开启或关闭自动环绕旋转"
        >
          <Rotate3d className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{isRotating ? '自转巡航' : '定点凝视'}</span>
        </button>

        {/* 结构线框/白模透视模式 */}
        <button
          type="button"
          onClick={() => setWireframeMode(!wireframeMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
            wireframeMode 
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/60' 
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="切换实体材质与结构线框"
        >
          <Box className="w-3.5 h-3.5" />
          <span>{wireframeMode ? '实体渲染' : '结构线框'}</span>
        </button>

        {/* 最佳视角重置 */}
        <button
          type="button"
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          title="重置相机至最佳观察角度"
        >
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span>视角复位</span>
        </button>

        {/* 操作手势引导 */}
        {showControlsHint && (
          <div className="hidden lg:flex items-center gap-2 pl-3 pr-2 py-0.5 border-l border-slate-700/80 text-[11px] text-slate-400">
            <span>🖱️ 左键旋转</span>
            <span>·</span>
            <span>滚轮缩放</span>
            <span>·</span>
            <span>右键平移</span>
            <button 
              type="button" 
              onClick={() => setShowControlsHint(false)}
              className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer"
              title="收起手势提示"
            >
              ✕
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
