
import React, { useRef, useState } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { waveVertexShader, waveFragmentShader } from "../shaders/waveShaders";

interface DitheredWavesProps {
  waveSpeed: number;
  waveFrequency: number;
  waveAmplitude: number;
  waveColor: [number, number, number];
  colorNum: number;
  pixelSize: number;
  disableAnimation: boolean;
  enableMouseInteraction: boolean;
  mouseRadius: number;
}

function DitheredWaves({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  colorNum,
  pixelSize,
  disableAnimation,
  enableMouseInteraction,
  mouseRadius
}: DitheredWavesProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const { viewport, size, gl } = useThree();

  const waveUniformsRef = useRef({
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(0, 0) },
    waveSpeed: { value: waveSpeed },
    waveFrequency: { value: waveFrequency },
    waveAmplitude: { value: waveAmplitude },
    waveColor: { value: new THREE.Color(...waveColor) },
    mousePos: { value: new THREE.Vector2(0, 0) },
    enableMouseInteraction: { value: enableMouseInteraction ? 1 : 0 },
    mouseRadius: { value: mouseRadius }
  });

  React.useEffect(() => {
    const dpr = gl.getPixelRatio();
    const newWidth = Math.floor(size.width * dpr);
    const newHeight = Math.floor(size.height * dpr);
    waveUniformsRef.current.resolution.value.set(newWidth, newHeight);
  }, [size, gl]);

  useFrame(({ clock }) => {
    if (!disableAnimation) {
      waveUniformsRef.current.time.value = clock.getElapsedTime();
    }
    waveUniformsRef.current.waveSpeed.value = waveSpeed;
    waveUniformsRef.current.waveFrequency.value = waveFrequency;
    waveUniformsRef.current.waveAmplitude.value = waveAmplitude;
    waveUniformsRef.current.waveColor.value.set(...waveColor);
    waveUniformsRef.current.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
    waveUniformsRef.current.mouseRadius.value = mouseRadius;
    if (enableMouseInteraction) {
      waveUniformsRef.current.mousePos.value.set(mousePos.x, mousePos.y);
    }
  });

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!enableMouseInteraction) return;
    const rect = gl.domElement.getBoundingClientRect();
    const dpr = gl.getPixelRatio();
    const x = (event.clientX - rect.left) * dpr;
    const y = (event.clientY - rect.top) * dpr;
    setMousePos({ x, y });
  };

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waveUniformsRef.current}
        />
      </mesh>
      <mesh
        onPointerMove={handlePointerMove}
        position={[0, 0, 0.01]}
        scale={[viewport.width, viewport.height, 1]}
        visible={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export default DitheredWaves;
