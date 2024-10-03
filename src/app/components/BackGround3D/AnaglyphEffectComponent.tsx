"use client";
// components/AnaglyphEffectComponent.tsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { AnaglyphEffect } from "./AnaglyphEffect";

// Define the component using TSX
const AnaglyphEffectComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null); // Reference for the container
  const spheres = useRef<THREE.Mesh[]>([]); // Reference to store sphere meshes
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Camera reference
  const sceneRef = useRef<THREE.Scene | null>(null); // Scene reference
  const effectRef = useRef<AnaglyphEffect | null>(null); // Effect reference
  const mouseXRef = useRef<number>(0); // Mouse X position
  const mouseYRef = useRef<number>(0); // Mouse Y position

  useEffect(() => {
    let camera: THREE.PerspectiveCamera,
      scene: THREE.Scene,
      renderer: THREE.WebGLRenderer,
      effect: AnaglyphEffect;
    const container = containerRef.current as HTMLDivElement;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Initialize Three.js Scene
    function init() {
      // Camera
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        100
      );
      camera.position.z = 3;
      cameraRef.current = camera;

      // Scene
      scene = new THREE.Scene();
      const path = "texture/";
      const format = ".png";
      const urls = [
        path + "px" + format,
        path + "nx" + format,
        path + "py" + format,
        path + "ny" + format,
        path + "pz" + format,
        path + "nz" + format,
      ];
      const textureCube = new THREE.CubeTextureLoader().load(urls);
      scene.background = textureCube;
      sceneRef.current = scene;

      // Geometry and Material
      const geometry = new THREE.SphereGeometry(0.1, 32, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        envMap: textureCube,
      });

      // Create 500 sphere meshes
      for (let i = 0; i < 50; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * 10 - 5;
        mesh.position.y = Math.random() * 10 - 5;
        mesh.position.z = Math.random() * 10 - 5;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
        scene.add(mesh);
        spheres.current.push(mesh);
      }

      // Renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Effect
      effect = new AnaglyphEffect(renderer);
      effect.setSize(window.innerWidth, window.innerHeight);
      effectRef.current = effect;

      // Window resize event
      window.addEventListener("resize", onWindowResize);
      document.addEventListener("mousemove", onDocumentMouseMove);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        render();
      };
      animate();
    }

    // Handle window resize
    function onWindowResize() {
      if (!camera || !effect) return;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      effect.setSize(window.innerWidth, window.innerHeight);
    }

    // Handle mouse move
    function onDocumentMouseMove(event: MouseEvent) {
      mouseXRef.current = (event.clientX - windowHalfX) / 100;
      mouseYRef.current = (event.clientY - windowHalfY) / 100;
    }

    // Render the scene
    function render() {
      if (!cameraRef.current || !sceneRef.current || !effectRef.current) return;

      const timer = 0.0001 * Date.now();

      // Update camera position
      cameraRef.current.position.x +=
        (mouseXRef.current - cameraRef.current.position.x) * 0.05;
      cameraRef.current.position.y +=
        (-mouseYRef.current - cameraRef.current.position.y) * 0.05;
      cameraRef.current.lookAt(sceneRef.current.position);

      // Update sphere positions
      spheres.current.forEach((sphere, i) => {
        sphere.position.x = 5 * Math.cos(timer + i);
        sphere.position.y = 5 * Math.sin(timer + i * 1.1);
      });

      // Render with effect
      effectRef.current.render(sceneRef.current, cameraRef.current);
    }

    // Initialize the scene
    init();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("mousemove", onDocumentMouseMove);
      if (container && container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return <div ref={containerRef}></div>;
};

export default AnaglyphEffectComponent;
