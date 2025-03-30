import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Particles from './Particles';
import GradientText from '@/components/ui/GradientText';
import RotatingText from '@/components/ui/RotatingText';
import { useAuth } from '@/contexts/AuthContext';

// Types for scene reference
interface SceneRef {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  robot?: THREE.Object3D;
  mixer?: THREE.AnimationMixer;
  clock: THREE.Clock;
  animations: THREE.AnimationClip[];
  torsoPosition: THREE.Vector3;
}

// Main component with improved presentation
export default function RobotScene() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const navigate = useNavigate();
  const threeVersion = THREE.REVISION;
  const { user } = useAuth();
  
  // Set up the canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneRef | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Improved camera positions:
  // Initial position gives a straight-on centered view showing the full robot with space around it
  const initialCameraPosition = new THREE.Vector3(0, 0, 6);
  const initialLookAt = new THREE.Vector3(0, 0, 0);
  
  // Mid-level zoom position - still shows full robot but closer
  const zoomedCameraPosition = new THREE.Vector3(0, 0.5, 4);
  
  const startAnimation = () => {
    if (!animationCompleted && !isAnimating && !zooming && sceneRef.current) {
      setIsAnimating(true);
      
      // First animation: Zoom in to mid-level view
      animateCameraToPosition(zoomedCameraPosition, initialLookAt, 1.5, () => {
        // Show button immediately after zoom completes
        setShowButton(true);
        setAnimationCompleted(true);
        setIsAnimating(false);
      });
    }
  };
  
  const handleStartCreating = () => {
    if (showButton && !zooming) {
      setZooming(true);
      // Check if user is logged in, if not redirect to auth with return URL
      if (!user) {
        setTimeout(() => navigate('/auth?returnUrl=/create'), 1000);
      } else {
        setTimeout(() => navigate('/create'), 1000);
      }
    }
  };
  
  const animateCameraToPosition = (
    targetPosition: THREE.Vector3, 
    targetLookAt: THREE.Vector3,
    duration: number = 1.0,
    onComplete?: () => void
  ) => {
    if (!sceneRef.current) return;
    
    const { camera, controls } = sceneRef.current;
    const startPosition = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = Date.now();
    
    const updateCamera = () => {
      if (!sceneRef.current) return;
      
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-in-out function
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Update camera position
      camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
      
      // Update look at target
      controls.target.lerpVectors(startLookAt, targetLookAt, easeProgress);
      controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(updateCamera);
      } else if (onComplete) {
        onComplete();
      }
    };
    
    updateCamera();
  };
  
  // Manual Three.js setup
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize scene
    const scene = new THREE.Scene();
    
    // Set clear transparent background for gradient overlay
    scene.background = null;
    
    // Initialize camera with front-facing straight view
    const camera = new THREE.PerspectiveCamera(
      40, // Narrower FOV for more cinematic look
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.copy(initialCameraPosition);
    camera.lookAt(initialLookAt);
    
    // Initialize renderer with alpha for transparency
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Set tone mapping for better lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5; // Increased exposure for brighter scene
    
    // Add orbit controls with limits
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false; // Disable zooming with mouse wheel
    controls.enableRotate = true; // Enable rotation for interaction
    controls.rotateSpeed = 0.5; // Slower rotation for smoother control
    controls.minPolarAngle = Math.PI * 0.3; // Limit vertical rotation (top view)
    controls.maxPolarAngle = Math.PI * 0.7; // Limit vertical rotation (bottom view)
    controls.target.copy(initialLookAt);
    
    // Add improved lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    // Key light (simulates main light source)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);
    
    // Fill light (softens shadows from opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-5, 8, -5);
    scene.add(fillLight);
    
    // Rim light (creates highlights from behind)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, -5, -2);
    scene.add(rimLight);
    
    // Additional front light for better illumination
    const frontLight = new THREE.PointLight(0xffffff, 1.0);
    frontLight.position.set(0, 2, 8); // Position in front
    scene.add(frontLight);
    
    // Clock for animations
    const clock = new THREE.Clock();
    
    // Store scene references with initial torso position
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      clock,
      animations: [],
      torsoPosition: new THREE.Vector3(0, 0, 0) // Will be updated when model loads
    };
    
    // Load robot model
    const loader = new GLTFLoader();
    
    // Add a loading progress handler
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      setLoadingProgress(progress);
    };
    
    // Set the loading manager on the loader
    loader.manager = loadingManager;
    
    loader.load(
      '/models/robot.glb',
      (gltf) => {
        const model = gltf.scene;
        
        // Set up shadow casting and receiving
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Improve materials
            if (node.material) {
              if (Array.isArray(node.material)) {
                node.material.forEach(mat => {
                  if (mat.isMeshStandardMaterial) {
                    mat.envMapIntensity = 2.0;
                    mat.needsUpdate = true;
                  }
                });
              } else if (node.material.isMeshStandardMaterial) {
                node.material.envMapIntensity = 2.0;
                node.material.needsUpdate = true;
              }
            }
            
            // Find the torso or main body part to position the text
            if (node.name.toLowerCase().includes('torso') || 
                node.name.toLowerCase().includes('body') || 
                node.name.toLowerCase().includes('chest')) {
              if (sceneRef.current) {
                // Get world position of the torso for button placement
                const worldPos = new THREE.Vector3();
                node.getWorldPosition(worldPos);
                sceneRef.current.torsoPosition = worldPos;
              }
            }
          }
        });
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate scale to ensure robot fits properly in view
        // Use the larger of height or width, but give a bit more room
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDimension;
        
        // Position the model at center
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        model.scale.set(scale, scale, scale);
        
        // If we couldn't find a specific torso part, use the center of the model
        if (sceneRef.current && sceneRef.current.torsoPosition.equals(new THREE.Vector3(0, 0, 0))) {
          sceneRef.current.torsoPosition = new THREE.Vector3(0, 0, 0);
        }
        
        // Add model to scene
        scene.add(model);
        if (sceneRef.current) {
          sceneRef.current.robot = model;
        
          // Set up animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            sceneRef.current.mixer = mixer;
            sceneRef.current.animations = gltf.animations;
            
            // Play the first animation
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }
        }
        
        setIsLoading(false);
      },
      (progress) => {
        // Progress callback handled by loading manager
      },
      (error) => {
        console.error('Error loading model:', error);
        setLoadingError(`Failed to load robot model: ${String(error)}`);
        setIsLoading(false);
      }
    );
    
    // Handle window resize
    const handleResize = () => {
      if (!sceneRef.current) return;
      
      const { camera, renderer } = sceneRef.current;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      
      const { 
        scene, 
        camera, 
        renderer,
        controls,
        mixer,
        clock,
        robot
      } = sceneRef.current;
      
      requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Update animations
      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }
      
      // Subtle idle animation for the robot if no animations and no zoom in progress
      if (robot && !mixer && !isAnimating && !showButton) {
        // Subtle breathing motion
        robot.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        sceneRef.current.renderer.dispose();
        sceneRef.current.scene.clear();
      }
    };
  }, []);
  
  return (
    <div className="w-full h-screen relative">
      {/* Updated gradient background to match create page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-300 z-0" />
      
      {/* Particles background with increased density and visibility */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Particles
          particleColors={['#4080ff', '#6ba5ff', '#ffffff', '#b3d1ff']}
          particleCount={1440}
          particleSpread={30}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          particleHoverFactor={1.5}
          alphaParticles={false}
          disableRotation={false}
          sizeRandomness={1.5}
        />
      </div>
      
      {/* Debug info */}
      <div className="absolute top-0 left-0 bg-black/30 text-white p-2 z-10 font-mono text-xs">
        <div>Three.js Version: {threeVersion}</div>
      </div>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-8 rounded-lg">
            <div className="w-24 h-24 border-4 border-t-blue-500 border-b-blue-700 border-l-blue-500 border-r-blue-700 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-white">{loadingProgress.toFixed(0)}% loaded</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {loadingError && (
        <div className="absolute top-4 right-4 bg-red-500/80 text-white p-3 rounded-md z-20">
          {loadingError}
        </div>
      )}
      
      {/* Canvas area - Clickable for initial interaction, then becomes non-interactive */}
      <div
        className={`relative z-20 w-full h-full ${!animationCompleted ? 'cursor-pointer' : ''}`}
        onClick={!animationCompleted ? startAnimation : undefined}
      >
        {/* Main canvas */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        />
      </div>
      
      {/* Initial welcome text - disappears when animation starts */}
      <AnimatePresence>
        {!isAnimating && !showButton && !zooming && (
          <motion.div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-white text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2">Welcome to Vinci</h1>
              <p className="mb-4 flex items-center justify-center">
                your 
                <RotatingText
                  texts={['ideas', 'inventions']}
                  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg ml-2"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </p>
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={5}
                showBorder={false}
                className="text-sm font-medium"
              >
                Click to begin
              </GradientText>
              <p className="text-sm opacity-70 mt-8"><span className="border border-white/40 rounded-md px-2 py-1 mr-2">Drag</span> to rotate the robot</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* "Start Creating" button - appears only after animation completes */}
      <AnimatePresence>
        {showButton && !zooming && (
          <motion.div 
            className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div className="text-white text-center mb-8 max-w-md">
              <h2 className="text-2xl font-semibold mb-2">Meet Your Innovation Assistant</h2>
              <p className="opacity-90">This AI-powered robot will help bring your creative ideas to life through advanced modeling and analysis.</p>
            </motion.div>
            <motion.button
              className="bg-transparent text-white px-8 py-4 rounded-full text-xl font-bold shadow-xl pointer-events-auto hover:bg-white/20 transition-colors border-2 border-white backdrop-blur-sm mt-16"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={handleStartCreating}
            >
              Start Creating
            </motion.button>
            <motion.p className="text-white/70 text-sm mt-4 pointer-events-auto">
              Continue exploring by <span className="border-b border-dotted border-white/40">rotating the robot</span>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Zoom effect */}
      <AnimatePresence>
        {zooming && (
          <motion.div 
            className="absolute inset-0 bg-white z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>
      
      {/* Small prompt to remind users they can interact */}
      {animationCompleted && !zooming && (
        <motion.div 
          className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Drag to rotate
          </div>
        </motion.div>
      )}
    </div>
  );
} 