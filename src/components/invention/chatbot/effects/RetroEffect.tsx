
import React from "react";
import * as THREE from "three";
import { ditherFragmentShader } from "../shaders/waveShaders";

const RetroEffect = () => {
  const shader = {
    fragmentShader: ditherFragmentShader,
    uniforms: {
      colorNum: { value: 4.0 },
      pixelSize: { value: 2.0 },
      resolution: { value: new THREE.Vector2(0, 0) }
    }
  };

  return (
    <mesh position={[0, 0, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        fragmentShader={shader.fragmentShader}
        uniforms={shader.uniforms}
      />
    </mesh>
  );
};

export default RetroEffect;
