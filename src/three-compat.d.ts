// This file provides type compatibility for Three.js buffer geometries
// that were removed in newer versions of Three.js but are still
// expected by older versions of @react-three/drei and troika-three-text

import * as THREE from 'three';

declare module 'three' {
  export class PlaneBufferGeometry extends THREE.PlaneGeometry {}
  export class CylinderBufferGeometry extends THREE.CylinderGeometry {}
} 