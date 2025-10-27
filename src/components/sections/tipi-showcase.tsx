import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useLanguage } from '@/hooks/use-language';
export const TipiShowcase = () => {
  const {
    t
  } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: OrbitControls;
    boxLid?: THREE.Group;
    modem?: THREE.Group;
    weighingScale?: THREE.Group;
    productGroup?: THREE.Group;
    dataCable?: THREE.Group;
  }>({});
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [isIntegrated, setIsIntegrated] = useState(false);
  const [infoText, setInfoText] = useState("Menampilkan USR-G771-E LTE Modem di dalam TIPI gateway. Klik tombol di bawah untuk berinteraksi.");
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const dims = {
      width: 8.26,
      height: 2.5,
      depth: 8.6
    };

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f5);
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(25, 20, 30);
    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 100, 0xcccccc, 0xdddddd);
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.target.set(10, 5, 0);

    // Create models
    const modem = createModem(dims);
    const packagingBox = createPackagingBox(dims, modem);
    const productGroup = new THREE.Group();
    productGroup.add(packagingBox);
    productGroup.position.set(10, (dims.height + 2) / 2, 0);
    scene.add(productGroup);
    const weighingScale = createWeighingScale();
    weighingScale.position.set(-20, 0, 0);
    weighingScale.visible = false;
    scene.add(weighingScale);

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      boxLid: packagingBox.children.find(c => c.name === 'lid') as THREE.Group,
      modem,
      weighingScale,
      productGroup
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!sceneRef.current.camera || !sceneRef.current.renderer) return;
      sceneRef.current.camera.aspect = container.clientWidth / container.clientHeight;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);
  const toggleBox = () => {
    const newState = !isBoxOpen;
    setIsBoxOpen(newState);
    if (sceneRef.current.modem) {
      sceneRef.current.modem.visible = newState;
    }
  };
  const toggleIntegration = () => {
    const newState = !isIntegrated;
    setIsIntegrated(newState);
    const {
      weighingScale,
      productGroup,
      scene,
      controls
    } = sceneRef.current;
    if (!weighingScale || !productGroup || !scene || !controls) return;
    const displayMesh = weighingScale.getObjectByName('displayMesh');
    if (!displayMesh) return;
    if (newState) {
      // Integrate
      if (isBoxOpen) toggleBox();
      weighingScale.visible = true;
      displayMesh.add(productGroup);
      productGroup.position.set(0, 0, -7.25);
      productGroup.rotation.set(Math.PI / 2, 0, 0);
      if (sceneRef.current.dataCable) scene.remove(sceneRef.current.dataCable);
      sceneRef.current.dataCable = createDataCable(productGroup, weighingScale);
      scene.add(sceneRef.current.dataCable);
      setInfoText("Produk TIPI lengkap dipasang di belakang layar timbangan, terhubung untuk solusi IoT yang sempurna.");
      controls.target.copy(new THREE.Vector3(-10, 25, 0));
    } else {
      // Separate
      weighingScale.visible = false;
      scene.add(productGroup);
      productGroup.position.set(10, 2.5, 0);
      productGroup.rotation.set(0, 0, 0);
      if (sceneRef.current.dataCable) {
        scene.remove(sceneRef.current.dataCable);
        sceneRef.current.dataCable = undefined;
      }
      setInfoText("Menampilkan USR-G771-E LTE Modem di dalam TIPI gateway. Klik tombol di bawah untuk berinteraksi.");
      controls.target.copy(new THREE.Vector3(10, 5, 0));
    }
  };
  return <section className="py-20 lg:py-24 bg-gradient-to-b from-background to-background-soft">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-4">Timbangan Pintar (TIPI)</h2>
          <p className="text-foreground-muted text-lg max-w-3xl mx-auto">
            Jelajahi fitur dan kemampuan integrasi TIPI IoT Gateway kami. 
            Klik tombol di bawah untuk melihatnya beraksi.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative bg-surface-primary rounded-3xl shadow-elegant overflow-hidden border border-border-light">
            {/* Info Box */}
            <div className="absolute top-6 left-6 z-10 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10 backdrop-blur-md p-6 rounded-2xl shadow-elegant border border-brand-primary/20 max-w-xs">
              <h3 className="text-xl font-bold text-brand-primary mb-3">TIPI Gateway</h3>
              <p className="text-foreground-muted text-sm mb-4 leading-relaxed">{infoText}</p>
              
              <div className="space-y-3">
                
                
                <button onClick={toggleIntegration} className="w-full py-3 px-4 rounded-xl font-semibold bg-brand-secondary text-white hover:bg-brand-secondary/90 transition-all duration-300 shadow-soft hover:shadow-medium">
                  {isIntegrated ? 'Tampilkan Terpisah' : 'Integrasikan dengan Timbangan'}
                </button>
              </div>
            </div>

            {/* 3D Canvas */}
            <div ref={containerRef} className="w-full h-[600px] lg:h-[700px]" />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 p-6 rounded-2xl shadow-elegant border border-brand-primary/20 hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">📡</div>
              <h4 className="text-xl font-bold text-white mb-2">Konektivitas LTE</h4>
              <p className="text-white/90">USR-G771-E LTE Modem untuk koneksi internet yang andal</p>
            </div>
            
            <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 p-6 rounded-2xl shadow-elegant border border-brand-primary/20 hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">🔌</div>
              <h4 className="text-xl font-bold text-white mb-2">Integrasi Mudah</h4>
              <p className="text-white/90">Port RS232/RS485 untuk koneksi dengan berbagai perangkat</p>
            </div>
            
            <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 p-6 rounded-2xl shadow-elegant border border-brand-primary/20 hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-bold text-white mb-2">Desain Kompak</h4>
              <p className="text-white/90">82.6 x 86 x 25 mm - mudah dipasang di berbagai lokasi</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

// Helper functions to create 3D models
function createModem(dims: {
  width: number;
  height: number;
  depth: number;
}) {
  const modemGroup = new THREE.Group();
  const caseMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    metalness: 0.5,
    roughness: 0.6
  });
  const mainCase = new THREE.Mesh(new THREE.BoxGeometry(dims.width, dims.height, dims.depth), caseMaterial);
  mainCase.castShadow = true;
  mainCase.receiveShadow = true;
  modemGroup.add(mainCase);
  modemGroup.visible = false;
  return modemGroup;
}
function createPackagingBox(dims: {
  width: number;
  height: number;
  depth: number;
}, modem: THREE.Group) {
  const boxGroup = new THREE.Group();
  const boxThickness = 0.2;
  const boxDims = {
    width: dims.width + 2,
    height: dims.height + 2,
    depth: dims.depth + 2
  };
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a202c,
    roughness: 0.8
  });

  // Create box sides
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(boxDims.width, boxThickness, boxDims.depth), boxMaterial);
  bottom.position.y = -boxDims.height / 2;
  const front = new THREE.Mesh(new THREE.BoxGeometry(boxDims.width, boxDims.height, boxThickness), boxMaterial);
  front.position.z = boxDims.depth / 2;
  const back = new THREE.Mesh(new THREE.BoxGeometry(boxDims.width, boxDims.height, boxThickness), boxMaterial);
  back.position.z = -boxDims.depth / 2;
  const left = new THREE.Mesh(new THREE.BoxGeometry(boxThickness, boxDims.height, boxDims.depth), boxMaterial);
  left.position.x = -boxDims.width / 2;
  const right = new THREE.Mesh(new THREE.BoxGeometry(boxThickness, boxDims.height, boxDims.depth), boxMaterial);
  right.position.x = boxDims.width / 2;

  // Create lid with TIPI text
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#1A202C';
  context.fillRect(0, 0, 1024, 1024);
  context.fillStyle = '#FFFFFF';
  context.font = 'bold 120px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('TIPI', 512, 512);
  const boxTexture = new THREE.CanvasTexture(canvas);
  const topMaterial = new THREE.MeshStandardMaterial({
    map: boxTexture,
    roughness: 0.8
  });
  const boxLid = new THREE.Group();
  boxLid.name = 'lid';
  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(boxDims.width, boxThickness, boxDims.depth), topMaterial);
  lidMesh.position.y = boxThickness / 2;
  boxLid.add(lidMesh);
  boxLid.position.set(0, boxDims.height / 2, 0);
  const mainBoxBody = new THREE.Group();
  mainBoxBody.add(bottom, front, back, left, right);
  mainBoxBody.add(modem);
  boxGroup.add(mainBoxBody, boxLid);

  // Add data port
  const dataPort = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), new THREE.MeshStandardMaterial({
    color: 0x1a202c
  }));
  dataPort.rotation.x = Math.PI / 2;
  dataPort.position.set(0, 0, -boxDims.depth / 2 - 0.15);
  dataPort.name = 'boxDataPort';
  boxGroup.add(dataPort);
  boxGroup.castShadow = true;
  boxGroup.receiveShadow = true;
  return boxGroup;
}
function createWeighingScale() {
  const scaleGroup = new THREE.Group();
  const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.2
  });
  const platformWidth = 40;
  const platformDepth = 50;
  const platformBaseHeight = 4;
  const platformTopHeight = 1;
  const platformBase = new THREE.Mesh(new THREE.BoxGeometry(platformWidth - 1, platformBaseHeight, platformDepth - 1), new THREE.MeshStandardMaterial({
    color: 0x455a64
  }));
  platformBase.position.y = platformBaseHeight / 2;
  scaleGroup.add(platformBase);
  const platformTop = new THREE.Mesh(new THREE.BoxGeometry(platformWidth, platformTopHeight, platformDepth), platformMaterial);
  platformTop.position.y = platformBaseHeight + platformTopHeight / 2;
  scaleGroup.add(platformTop);

  // Pole
  const poleHeight = 30;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, poleHeight, 32), new THREE.MeshStandardMaterial({
    color: 0x90a4ae,
    metalness: 0.9,
    roughness: 0.3
  }));
  pole.position.set(0, platformBaseHeight + poleHeight / 2, -(platformDepth / 2) + 5);
  scaleGroup.add(pole);

  // Display
  const display = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 10), new THREE.MeshStandardMaterial({
    color: 0xb0bec5,
    metalness: 0.7,
    roughness: 0.4
  }));
  display.position.set(0, platformBaseHeight + poleHeight, -(platformDepth / 2) + 5);
  display.rotation.x = -Math.PI / 8;
  display.name = 'displayMesh';
  scaleGroup.add(display);
  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), new THREE.MeshStandardMaterial({
    color: 0x2d3748
  }));
  port.rotation.z = Math.PI / 2;
  port.position.set(7.15, 0, 0);
  port.name = 'scalePort';
  display.add(port);
  return scaleGroup;
}
function createDataCable(productGroup: THREE.Group, weighingScale: THREE.Group) {
  const cableMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.8
  });
  const modemPort = productGroup.getObjectByName('boxDataPort');
  const scalePort = weighingScale.getObjectByName('scalePort');
  if (!modemPort || !scalePort) return new THREE.Group();
  const modemPortPos = new THREE.Vector3();
  modemPort.getWorldPosition(modemPortPos);
  const scalePortPos = new THREE.Vector3();
  scalePort.getWorldPosition(scalePortPos);
  const controlPoint = modemPortPos.clone().lerp(scalePortPos, 0.5);
  controlPoint.y -= 5;
  const curve = new THREE.CatmullRomCurve3([modemPortPos, controlPoint, scalePortPos]);
  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.2, 8, false);
  const cableMesh = new THREE.Mesh(tubeGeometry, cableMaterial);
  const cableGroup = new THREE.Group();
  cableGroup.add(cableMesh);
  return cableGroup;
}