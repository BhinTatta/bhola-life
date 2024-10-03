"use client";
"use client";
import React, { useRef, useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    THREE: any;
    Stats: any;
  }
}

const TwoFaceComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [debug, setDebug] = useState<string[]>([]);
  const [scriptsLoaded, setScriptsLoaded] = useState({
    three: false,
    stats: false,
    gltfLoader: false,
    orbitControls: false,
  });

  const addDebug = (message: string) => {
    setDebug((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (Object.values(scriptsLoaded).every(Boolean)) {
      addDebug("All scripts loaded");
      initScene();
    }
  }, [scriptsLoaded]);

  const initScene = () => {
    if (!mountRef.current || !window.THREE) return;
    addDebug("Initializing scene");

    const { THREE } = window;
    const { Stats } = window;

    let camera: any, scene: any, renderer: any, stats: any;
    let animationFrameId: number;

    const init = () => {
      try {
        camera = new THREE.PerspectiveCamera(
          27,
          window.innerWidth / window.innerHeight,
          0.1,
          100
        );
        camera.position.z = 20;
        addDebug("Camera created");

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x444444);
        addDebug("Scene created");

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        addDebug("Cube added to scene");

        // Ensure GLTFLoader is available
        if (THREE.GLTFLoader) {
          const loader = new THREE.GLTFLoader();
          loader.load(
            "/glb-models/LeePerrySmith.glb",
            (gltf: any) => {
              addDebug("GLTF model loaded successfully");
              const geometry = gltf.scene.children[0].geometry;

              let mesh = new THREE.Mesh(geometry, buildTwistMaterial(2.0));
              mesh.position.x = -3.5;
              mesh.position.y = -0.5;
              scene.add(mesh);

              mesh = new THREE.Mesh(geometry, buildTwistMaterial(-2.0));
              mesh.position.x = 3.5;
              mesh.position.y = -0.5;
              scene.add(mesh);
              addDebug("GLTF meshes added to scene");
            },
            (xhr: any) => {
              addDebug(`GLTF ${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error: any) => {
              addDebug(`Error loading GLTF: ${error.message}`);
            }
          );
        } else {
          addDebug("GLTFLoader not available");
        }

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current?.appendChild(renderer.domElement);
        addDebug("Renderer created and added to DOM");

        // Ensure OrbitControls is available
        if (THREE.OrbitControls) {
          const controls = new THREE.OrbitControls(camera, renderer.domElement);
          controls.minDistance = 10;
          controls.maxDistance = 50;
          controls.enableZoom = false;
          addDebug("OrbitControls initialized");
        } else {
          addDebug("OrbitControls not available");
        }

        if (typeof Stats === "function") {
          stats = new Stats();
          mountRef.current?.appendChild(stats.dom);
          addDebug("Stats initialized");
        } else {
          addDebug("Stats not available, skipping initialization");
        }

        window.addEventListener("resize", onWindowResize);
      } catch (error) {
        addDebug(`Error in init: ${(error as Error).message}`);
      }
    };

    const buildTwistMaterial = (amount: number) => {
      const material = new THREE.MeshNormalMaterial();
      material.onBeforeCompile = (shader: any) => {
        shader.uniforms.time = { value: 0 };
        shader.vertexShader = "uniform float time;\n" + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          [
            `float theta = sin( time + position.y ) / ${amount.toFixed(1)};`,
            "float c = cos( theta );",
            "float s = sin( theta );",
            "mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );",
            "vec3 transformed = vec3( position ) * m;",
            "vNormal = vNormal * m;",
          ].join("\n")
        );
        material.userData.shader = shader;
      };
      material.customProgramCacheKey = () => amount.toFixed(1);
      return material;
    };

    const onWindowResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      render();
      if (stats) stats.update();
    };

    const render = () => {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          const shader = child.material.userData.shader;
          if (shader) {
            shader.uniforms.time.value = performance.now() / 1000;
          }
        }
      });
      renderer.render(scene, camera);
    };

    init();
    animate();
    addDebug("Animation started");
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, three: true }))}
        onError={() => addDebug("Error loading Three.js")}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, stats: true }))}
        onError={() => addDebug("Error loading Stats.js")}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"
        onLoad={() =>
          setScriptsLoaded((prev) => ({ ...prev, gltfLoader: true }))
        }
        onError={() => addDebug("Error loading GLTFLoader")}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"
        onLoad={() =>
          setScriptsLoaded((prev) => ({ ...prev, orbitControls: true }))
        }
        onError={() => addDebug("Error loading OrbitControls")}
      />
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100vh", overflow: "hidden" }}
      ></div>
    </>
  );
};

export default TwoFaceComponent;
