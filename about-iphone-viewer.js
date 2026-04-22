(function () {
  const CONFIG = {
    modelRadius: 0.95,
    basePolarAngle: Math.PI / 2 - 0.03,
    desktopTiltIntensity: 0.36,
    screenYawIntensity: 0.28,
    mobileAutoRotateSpeed: 0.9,
    settleStrength: 0.055,
    settleDelayMs: 180,
    tiltLerp: 0.1,
    baseModelYaw: Math.PI,
    baseModelRoll: -0.22,
    qualityTiers: {
      high: {
        pixelRatioCap: 2.25,
        antialias: true,
        shadows: true,
        keyLightIntensity: 1.45,
      },
      balanced: {
        pixelRatioCap: 1.8,
        antialias: true,
        shadows: true,
        keyLightIntensity: 1.25,
      },
      low: {
        pixelRatioCap: 1.35,
        antialias: false,
        shadows: false,
        keyLightIntensity: 1.15,
      },
    },
  };

  const LIBS = {
    three: [
      "./assets/vendor/three/three.min.js",
      "https://unpkg.com/three@0.126.1/build/three.min.js",
    ],
    orbit: [
      "./assets/vendor/three/OrbitControls.js",
      "https://unpkg.com/three@0.126.1/examples/js/controls/OrbitControls.js",
    ],
    gltf: [
      "./assets/vendor/three/GLTFLoader.js",
      "https://unpkg.com/three@0.126.1/examples/js/loaders/GLTFLoader.js",
    ],
  };

  function setStatus(mount, message) {
    const fallback = mount.querySelector(".about-phone-fallback");
    if (fallback) fallback.textContent = message;
  }

  function markUnavailable(mount, message) {
    mount.classList.remove("is-loaded", "is-dragging");
    mount.classList.add("model-unavailable");
    setStatus(mount, message);
  }

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = url;
      el.async = true;
      el.onload = resolve;
      el.onerror = () => reject(new Error("Failed to load " + url));
      document.head.appendChild(el);
    });
  }

  async function loadFirstAvailable(urls) {
    let lastError = null;
    for (const url of urls) {
      try {
        await loadScript(url);
        return url;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Script load failed");
  }

  async function ensureThreeDeps(mount) {
    if (!window.THREE) {
      setStatus(mount, "Loading 3D engine...");
      await loadFirstAvailable(LIBS.three);
    }
    if (!window.THREE || !window.THREE.OrbitControls) {
      setStatus(mount, "Loading controls...");
      await loadFirstAvailable(LIBS.orbit);
    }
    if (!window.THREE || !window.THREE.GLTFLoader) {
      setStatus(mount, "Loading model loader...");
      await loadFirstAvailable(LIBS.gltf);
    }
    if (!window.THREE || !window.THREE.OrbitControls || !window.THREE.GLTFLoader) {
      throw new Error("THREE dependencies unavailable");
    }
  }

  function supportsWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch (_err) {
      return false;
    }
  }

  function prefersMobileBehavior() {
    return window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 900;
  }

  function pickQualityTier() {
    const memory = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (reducedMotion || memory <= 4 || cores <= 4) return "low";
    if (coarsePointer || memory <= 8 || cores <= 8) return "balanced";
    return "high";
  }

  async function initAboutPhoneViewer() {
    const mount = document.getElementById("about-phone-viewer");
    if (!mount) return;
    mount.dataset.viewerBooted = "1";
    setStatus(mount, "Initializing 3D engine...");

    if (!supportsWebGL()) {
      markUnavailable(mount, "3D preview is unavailable on this browser.");
      return;
    }

    try {
      await ensureThreeDeps(mount);
    } catch (error) {
      markUnavailable(mount, "Could not load 3D libraries (CDN/network issue).");
      return;
    }

    const THREE = window.THREE;
    const modelSrc = mount.dataset.modelSrc || "./assets/models/iphone17pro.glb";
    const isMobile = prefersMobileBehavior();
    const qualityKey = pickQualityTier();
    const quality = CONFIG.qualityTiers[qualityKey];

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 30);
    camera.position.set(0, 0.02, 1.88);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: quality.antialias,
        powerPreference: qualityKey === "high" ? "high-performance" : "default",
      });
    } catch (_err) {
      markUnavailable(mount, "3D renderer failed to initialize on this device.");
      return;
    }

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = quality.shadows;
    renderer.shadowMap.type = qualityKey === "high" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = isMobile;
    controls.autoRotateSpeed = CONFIG.mobileAutoRotateSpeed;
    controls.rotateSpeed = isMobile ? 0.55 : 0.85;
    controls.minPolarAngle = Math.PI / 2 - 0.55;
    controls.maxPolarAngle = Math.PI / 2 + 0.55;
    controls.target.set(0, 0, 0);

    const modelRig = new THREE.Group();
    scene.add(modelRig);

    const tiltRig = new THREE.Group();
    modelRig.add(tiltRig);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, quality.keyLightIntensity);
    keyLight.position.set(0.52, 0.46, 2.4);
    keyLight.castShadow = quality.shadows;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.95);
    fillLight.position.set(-2.0, 1.1, 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.75, 11, 2);
    rimLight.position.set(-1.8, -0.2, -2.2);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.72);
    topLight.position.set(0, 2.8, 0.6);
    scene.add(topLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.62);
    backLight.position.set(0.4, 0.3, -2.4);
    scene.add(backLight);

    let targetTiltX = 0;
    let targetTiltY = 0;
    let dragging = false;
    let lastInteractionTs = performance.now();
    let targetRigYaw = CONFIG.baseModelYaw;

    modelRig.rotation.y = CONFIG.baseModelYaw;
    modelRig.rotation.z = CONFIG.baseModelRoll;

    controls.addEventListener("start", function () {
      dragging = true;
      controls.autoRotate = false;
      lastInteractionTs = performance.now();
      mount.classList.add("is-dragging");
    });

    controls.addEventListener("end", function () {
      dragging = false;
      lastInteractionTs = performance.now();
      mount.classList.remove("is-dragging");
      if (isMobile) controls.autoRotate = true;
    });

    if (!isMobile) {
      window.addEventListener("pointermove", function (event) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        targetTiltX = -y * CONFIG.desktopTiltIntensity;
        targetTiltY = x * CONFIG.desktopTiltIntensity;
        targetRigYaw = CONFIG.baseModelYaw + x * CONFIG.screenYawIntensity;
        lastInteractionTs = performance.now();
      });

      window.addEventListener("pointerleave", function () {
        targetTiltX = 0;
        targetTiltY = 0;
        targetRigYaw = CONFIG.baseModelYaw;
      });
    }

    const loader = new THREE.GLTFLoader();
    setStatus(mount, "Downloading model...");
    loader.load(
      modelSrc,
      function (gltf) {
        const phoneModel = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!phoneModel) {
          markUnavailable(mount, "3D model file loaded, but no mesh was found.");
          return;
        }

        const bounds = new THREE.Box3().setFromObject(phoneModel);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z) || 1;
        const normalizedScale = CONFIG.modelRadius / maxSize;

        phoneModel.position.sub(center);
        phoneModel.scale.setScalar(normalizedScale);

        phoneModel.traverse(function (obj) {
          if (!obj.isMesh) return;
          obj.castShadow = quality.shadows;
          obj.receiveShadow = quality.shadows;
          if (obj.material && "metalness" in obj.material) {
            obj.material.metalness = Math.max(0.2, obj.material.metalness);
            obj.material.roughness = Math.min(0.6, obj.material.roughness);
          }
        });

        tiltRig.add(phoneModel);
        mount.classList.remove("model-unavailable");
        mount.classList.add("is-loaded");
        setStatus(mount, "3D model ready");
      },
      function (event) {
        if (!event || !event.total) return;
        const pct = Math.min(100, Math.round((event.loaded / event.total) * 100));
        setStatus(mount, "Downloading model... " + pct + "%");
      },
      function (error) {
        const isFileProtocol = window.location.protocol === "file:";
        const details = error && error.message ? " (" + error.message + ")" : "";
        if (isFileProtocol) {
          markUnavailable(
            mount,
            "Cannot load model from file://. Run a local server (for example `python3 -m http.server`) and open via http://localhost."
          );
          return;
        }
        markUnavailable(mount, "Model failed to load at " + modelSrc + details);
      }
    );

    function resizeRenderer() {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatioCap));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    resizeRenderer();

    const resizeObserver = new ResizeObserver(function () {
      resizeRenderer();
    });
    resizeObserver.observe(mount);

    let rafId = 0;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      keyLight.position.set(camera.position.x + 0.42, camera.position.y + 0.32, camera.position.z + 0.62);

      if (isMobile) {
        targetTiltX = 0;
        targetTiltY = 0;
        modelRig.rotation.y = CONFIG.baseModelYaw + Math.sin(elapsed * 0.4) * 0.04;
      } else {
        const sinceInteraction = performance.now() - lastInteractionTs;
        if (!dragging && sinceInteraction > CONFIG.settleDelayMs) {
          const azimuth = controls.getAzimuthalAngle();
          const polar = controls.getPolarAngle();
          controls.rotateLeft(azimuth * CONFIG.settleStrength);
          controls.rotateUp((polar - CONFIG.basePolarAngle) * CONFIG.settleStrength);
        }
      }

      modelRig.rotation.y += (targetRigYaw - modelRig.rotation.y) * 0.08;
      tiltRig.rotation.x += (targetTiltX - tiltRig.rotation.x) * CONFIG.tiltLerp;
      tiltRig.rotation.y += (targetTiltY - tiltRig.rotation.y) * CONFIG.tiltLerp;

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("beforeunload", function () {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAboutPhoneViewer);
  } else {
    initAboutPhoneViewer();
  }
})();
