import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CompanionPet, PetMarriage } from '../../types';
import { sounds } from '../../utils/audio';

export type PetAnimationAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'pet'
  | 'eat'
  | 'sleep'
  | 'happy'
  | 'play_ball'
  | 'spin';

interface Pet3DViewerProps {
  pet: CompanionPet;
  marriage?: PetMarriage;
  weatherTheme: 'sun' | 'rain' | 'night';
  currentAction: PetAnimationAction;
  targetPos: { x: number; z: number } | null;
  ballPos: { x: number; z: number; active: boolean } | null;
  foodItem: { type: 'berry' | 'cake' | 'water'; x: number; z: number; active: boolean } | null;
  onPetClick?: () => void;
  onPetArrived?: () => void;
  onBallCaught?: () => void;
  onFoodEaten?: () => void;
  soundEnabled?: boolean;
}

export const Pet3DViewer: React.FC<Pet3DViewerProps> = ({
  pet,
  marriage,
  weatherTheme,
  currentAction,
  targetPos,
  ballPos,
  foodItem,
  onPetClick,
  onPetArrived,
  onBallCaught,
  onFoodEaten,
  soundEnabled = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep animation loop clean & updated
  const stateRef = useRef({
    currentAction,
    targetPos,
    ballPos,
    foodItem,
    weatherTheme,
    pet,
    marriage,
    soundEnabled,
  });

  useEffect(() => {
    stateRef.current = {
      currentAction,
      targetPos,
      ballPos,
      foodItem,
      weatherTheme,
      pet,
      marriage,
      soundEnabled,
    };
  }, [currentAction, targetPos, ballPos, foodItem, weatherTheme, pet, marriage, soundEnabled]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 420;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    let cameraDistance = 9.0;
    let cameraAngleX = 0.35; // pitch
    let cameraAngleY = 0.0;  // yaw (orbit)

    const updateCameraPos = () => {
      camera.position.x = Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * cameraDistance;
      camera.position.y = Math.sin(cameraAngleX) * cameraDistance + 1.2;
      camera.position.z = Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * cameraDistance;
      camera.lookAt(0, 0.6, 0);
    };
    updateCameraPos();

    // High quality renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- LIGHTING (Warm stylized studio lighting) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(6, 12, 7);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x70a1ff, 0.8);
    fillLight.position.set(-6, 5, -5);
    scene.add(fillLight);

    const bounceLight = new THREE.DirectionalLight(0xa8e6cf, 0.4);
    bounceLight.position.set(0, -5, 2);
    scene.add(bounceLight);

    // --- PROCEDURAL TEXTURES (Glossy Eyes & Soft Gradient Canvas) ---
    const createGradientTexture = (c1: string, c2: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // --- STYLIZED 3D FLOATING ISLAND (Nintendo / Animal Crossing aesthetic) ---
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // 1. Lush Green Top Platform with bevel
    const grassTopGeo = new THREE.CylinderGeometry(4.6, 4.4, 0.55, 36);
    const grassTopMat = new THREE.MeshStandardMaterial({
      color: 0x6bcb77,
      roughness: 0.65,
      metalness: 0.05,
    });
    const grassTop = new THREE.Mesh(grassTopGeo, grassTopMat);
    grassTop.position.y = -0.28;
    grassTop.receiveShadow = true;
    islandGroup.add(grassTop);

    // 2. Earthy Rock Under-base
    const rockBaseGeo = new THREE.CylinderGeometry(4.3, 2.2, 1.4, 28);
    const rockBaseMat = new THREE.MeshStandardMaterial({
      color: 0x795548,
      roughness: 0.9,
    });
    const rockBase = new THREE.Mesh(rockBaseGeo, rockBaseMat);
    rockBase.position.y = -1.2;
    rockBase.receiveShadow = true;
    islandGroup.add(rockBase);

    // 3. Stepping stones path
    const stoneGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.06, 12);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xdfdfdf, roughness: 0.8 });
    const stoneCoords = [
      { x: 0, z: 1.6 },
      { x: 0.5, z: 2.1 },
      { x: 1.2, z: 2.4 },
      { x: -0.6, z: 2.3 },
    ];
    stoneCoords.forEach((c) => {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(c.x, 0.02, c.z);
      stone.receiveShadow = true;
      islandGroup.add(stone);
    });

    // 4. Sparkling Water Basin with ripple animation
    const pondGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.08, 28);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x2980b9,
      roughness: 0.05,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(2.5, 0.02, -0.6);
    islandGroup.add(pond);

    // Pond stone rim
    const pondRimGeo = new THREE.TorusGeometry(1.05, 0.08, 12, 28);
    const pondRimMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.7 });
    const pondRim = new THREE.Mesh(pondRimGeo, pondRimMat);
    pondRim.rotation.x = Math.PI / 2;
    pondRim.position.set(2.5, 0.04, -0.6);
    islandGroup.add(pondRim);

    // 5. Blooming Flowers & Grass Tufts
    const flowersGroup = new THREE.Group();
    islandGroup.add(flowersGroup);

    const flowerData = [
      { x: -2.6, z: 1.6, col: 0xff6b81 },
      { x: -3.1, z: -1.2, col: 0xffd32a },
      { x: 2.8, z: 1.9, col: 0xffa801 },
      { x: 3.3, z: -1.4, col: 0x54a0ff },
      { x: -1.6, z: -2.8, col: 0xff6b81 },
      { x: 1.4, z: -3.0, col: 0x9c88ff },
    ];

    flowerData.forEach((f) => {
      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(f.x, 0.17, f.z);
      flowersGroup.add(stem);

      // Blossom Head
      const blossomGeo = new THREE.SphereGeometry(0.16, 12, 12);
      blossomGeo.scale(1.1, 0.6, 1.1);
      const blossomMat = new THREE.MeshStandardMaterial({ color: f.col, roughness: 0.3 });
      const blossom = new THREE.Mesh(blossomGeo, blossomMat);
      blossom.position.set(f.x, 0.34, f.z);
      blossom.castShadow = true;
      flowersGroup.add(blossom);

      // Yellow Center
      const centerGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xfffa65 });
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.position.set(f.x, 0.38, f.z);
      flowersGroup.add(center);
    });

    // 6. Cute Animated 3D Butterflies (Circling the flowers)
    const butterflies: THREE.Group[] = [];
    for (let i = 0; i < 2; i++) {
      const bFly = new THREE.Group();
      const wingGeo = new THREE.PlaneGeometry(0.18, 0.14);
      const wingMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0xff9ff3 : 0x54a0ff,
        side: THREE.DoubleSide,
        roughness: 0.3,
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.x = -0.09;
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.x = 0.09;

      bFly.add(leftWing);
      bFly.add(rightWing);
      bFly.position.set(i === 0 ? -2.2 : 2.0, 1.2 + i * 0.4, i === 0 ? 1.0 : -1.0);
      scene.add(bFly);
      butterflies.push(bFly);
    }

    // --- 3D PARTICLE SYSTEM (Stardust & Floating Fireflies) ---
    const starCount = 45;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 8;
      starPositions[i + 1] = Math.random() * 4.5 + 0.3;
      starPositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xfffa65,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);

    // --- PROCEDURAL 3D PET RIG SETUP ---
    const petRig = new THREE.Group();
    scene.add(petRig);

    // Get color themes for pet
    const getPetTheme = (element: string) => {
      switch (element) {
        case 'nature':
          return {
            primary: 0x48dbfb,
            bodyGrad1: '#55efc4',
            bodyGrad2: '#00b894',
            accent: 0x2ed573,
            belly: 0xffffff,
            cheek: 0xff6b81,
            eyeColor: 0x1e272e,
          };
        case 'fire':
          return {
            primary: 0xff6b6b,
            bodyGrad1: '#ff7675',
            bodyGrad2: '#d63031',
            accent: 0xfeca57,
            belly: 0xffeaa7,
            cheek: 0xd63031,
            eyeColor: 0x2d3436,
          };
        case 'water':
          return {
            primary: 0x54a0ff,
            bodyGrad1: '#74b9ff',
            bodyGrad2: '#0984e3',
            accent: 0x48dbfb,
            belly: 0xffffff,
            cheek: 0xff7675,
            eyeColor: 0x1e272e,
          };
        case 'starlight':
          return {
            primary: 0xa29bfe,
            bodyGrad1: '#a29bfe',
            bodyGrad2: '#6c5ce7',
            accent: 0xfffa65,
            belly: 0xf8a5c2,
            cheek: 0xfd79a8,
            eyeColor: 0x2f3542,
          };
        default:
          return {
            primary: 0x55efc4,
            bodyGrad1: '#55efc4',
            bodyGrad2: '#00b894',
            accent: 0x2ed573,
            belly: 0xffffff,
            cheek: 0xff7675,
            eyeColor: 0x1e272e,
          };
      }
    };

    const theme = getPetTheme(pet.element);

    // Materials
    const bodyTexture = createGradientTexture(theme.bodyGrad1, theme.bodyGrad2);
    const bodyMat = new THREE.MeshStandardMaterial({
      map: bodyTexture,
      roughness: 0.35,
      metalness: 0.05,
    });

    const bellyMat = new THREE.MeshStandardMaterial({
      color: theme.belly,
      roughness: 0.4,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: theme.accent,
      roughness: 0.3,
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
    });

    const pupilMat = new THREE.MeshStandardMaterial({
      color: theme.eyeColor,
      roughness: 0.1,
    });

    const cheekMat = new THREE.MeshStandardMaterial({
      color: theme.cheek,
      roughness: 0.6,
      transparent: true,
      opacity: 0.8,
    });

    // 1. Squash & Stretch Root
    const bodyRoot = new THREE.Group();
    petRig.add(bodyRoot);

    // 2. Chibi Round Body (Pixar egg shape)
    const bodyGeo = new THREE.SphereGeometry(0.72, 32, 28);
    bodyGeo.scale(1, 1.16, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.86;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyRoot.add(bodyMesh);

    // 3. Cute Soft Belly Patch
    const bellyGeo = new THREE.SphereGeometry(0.52, 24, 24);
    bellyGeo.scale(0.85, 0.95, 0.45);
    const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
    bellyMesh.position.set(0, 0.74, 0.48);
    bodyRoot.add(bellyMesh);

    // 4. Big Sparkling Kawaii Eyes with Interactive Pupil Tracking
    const eyeGroupLeft = new THREE.Group();
    eyeGroupLeft.position.set(-0.25, 0.98, 0.58);
    bodyRoot.add(eyeGroupLeft);

    const eyeGroupRight = new THREE.Group();
    eyeGroupRight.position.set(0.25, 0.98, 0.58);
    bodyRoot.add(eyeGroupRight);

    // Eye Whites
    const eyeWhiteGeo = new THREE.SphereGeometry(0.14, 20, 20);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeGroupLeft.add(leftEyeWhite);
    eyeGroupRight.add(rightEyeWhite);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.088, 16, 16);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.z = 0.08;
    eyeGroupLeft.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.z = 0.08;
    eyeGroupRight.add(rightPupil);

    // Double Catchlight Highlights (Gives anime/Pixar shine)
    const catch1Geo = new THREE.SphereGeometry(0.032, 10, 10);
    const leftCatch1 = new THREE.Mesh(catch1Geo, eyeWhiteMat);
    leftCatch1.position.set(0.04, 0.04, 0.12);
    eyeGroupLeft.add(leftCatch1);

    const rightCatch1 = new THREE.Mesh(catch1Geo, eyeWhiteMat);
    rightCatch1.position.set(0.04, 0.04, 0.12);
    eyeGroupRight.add(rightCatch1);

    const catch2Geo = new THREE.SphereGeometry(0.016, 8, 8);
    const leftCatch2 = new THREE.Mesh(catch2Geo, eyeWhiteMat);
    leftCatch2.position.set(-0.03, -0.03, 0.12);
    eyeGroupLeft.add(leftCatch2);

    const rightCatch2 = new THREE.Mesh(catch2Geo, eyeWhiteMat);
    rightCatch2.position.set(-0.03, -0.03, 0.12);
    eyeGroupRight.add(rightCatch2);

    // 5. Blushing Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.12, 16, 16);
    cheekGeo.scale(1.2, 0.7, 0.3);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.42, 0.82, 0.5);
    bodyRoot.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.42, 0.82, 0.5);
    bodyRoot.add(rightCheek);

    // 6. Cute Smile Mouth (Opens when happy / eating)
    const mouthGeo = new THREE.TorusGeometry(0.075, 0.02, 12, 16, Math.PI);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x2d3436 });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.rotation.x = Math.PI;
    mouthMesh.position.set(0, 0.8, 0.65);
    bodyRoot.add(mouthMesh);

    // 7. SPECIES HEAD APPAREL & EARS
    const leftEarGroup = new THREE.Group();
    leftEarGroup.position.set(-0.35, 1.46, 0.05);
    bodyRoot.add(leftEarGroup);

    const rightEarGroup = new THREE.Group();
    rightEarGroup.position.set(0.35, 1.46, 0.05);
    bodyRoot.add(rightEarGroup);

    if (pet.element === 'nature') {
      // Leaf Ears
      const leafGeo = new THREE.SphereGeometry(0.28, 16, 16);
      leafGeo.scale(0.35, 1.25, 0.1);
      const leftLeaf = new THREE.Mesh(leafGeo, accentMat);
      leftLeaf.rotation.z = -0.55;
      leftLeaf.rotation.x = -0.15;
      leftEarGroup.add(leftLeaf);

      const rightLeaf = new THREE.Mesh(leafGeo, accentMat);
      rightLeaf.rotation.z = 0.55;
      rightLeaf.rotation.x = -0.15;
      rightEarGroup.add(rightLeaf);

      // Central Seedling Sprout
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.32, 10);
      const stem = new THREE.Mesh(stemGeo, accentMat);
      stem.position.set(0, 1.54, 0);
      bodyRoot.add(stem);

      const budGeo = new THREE.SphereGeometry(0.12, 12, 12);
      budGeo.scale(1, 0.6, 1);
      const bud = new THREE.Mesh(budGeo, accentMat);
      bud.position.set(0, 1.7, 0);
      bodyRoot.add(bud);
    } else if (pet.element === 'fire') {
      // Fox/Flame Horns
      const hornGeo = new THREE.ConeGeometry(0.22, 0.52, 16);
      const leftHorn = new THREE.Mesh(hornGeo, accentMat);
      leftHorn.rotation.z = -0.38;
      leftEarGroup.add(leftHorn);

      const rightHorn = new THREE.Mesh(hornGeo, accentMat);
      rightHorn.rotation.z = 0.38;
      rightEarGroup.add(rightHorn);
    } else {
      // Round Bear / Bunny Ears
      const earGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const leftEar = new THREE.Mesh(earGeo, accentMat);
      leftEarGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeo, accentMat);
      rightEarGroup.add(rightEar);
    }

    // 8. Articulated Paws (Left & Right Foot)
    const footGeo = new THREE.SphereGeometry(0.19, 16, 14);
    footGeo.scale(0.9, 0.6, 1.3);

    const leftFoot = new THREE.Mesh(footGeo, bodyMat);
    leftFoot.position.set(-0.28, 0.15, 0.15);
    leftFoot.castShadow = true;
    petRig.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, bodyMat);
    rightFoot.position.set(0.28, 0.15, 0.15);
    rightFoot.castShadow = true;
    petRig.add(rightFoot);

    // 9. Animated Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.45, -0.6);
    bodyRoot.add(tailGroup);

    const tailGeo = new THREE.SphereGeometry(0.2, 16, 16);
    tailGeo.scale(0.8, 1.4, 0.8);
    const tailMesh = new THREE.Mesh(tailGeo, accentMat);
    tailMesh.rotation.x = -0.65;
    tailGroup.add(tailMesh);

    // 10. Soft Ambient Shadow Under Pet
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = 0.02;
    petRig.add(groundShadow);

    // 11. Equipped Item: Sun Hat
    if (pet.equippedItems.includes('sun_hat')) {
      const hatGroup = new THREE.Group();
      const hatBrimGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.04, 32);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xf5cd79, roughness: 0.6 });
      const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
      hatBrim.position.set(0, 1.56, 0);

      const hatTopGeo = new THREE.CylinderGeometry(0.5, 0.54, 0.36, 32);
      const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
      hatTop.position.set(0, 1.74, 0);

      const ribbonGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32);
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xe17055 });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.set(0, 1.62, 0);

      hatGroup.add(hatBrim);
      hatGroup.add(hatTop);
      hatGroup.add(ribbon);
      bodyRoot.add(hatGroup);
    }

    // --- 3D PARTNER PET (Wanders along if married) ---
    const partnerRig = new THREE.Group();
    scene.add(partnerRig);
    partnerRig.position.set(-1.8, 0, 0.8);
    partnerRig.visible = !!marriage?.isMarried;

    if (marriage?.isMarried) {
      const partnerBodyGeo = new THREE.SphereGeometry(0.55, 24, 20);
      const partnerBodyMat = new THREE.MeshStandardMaterial({ color: 0xff9ff3, roughness: 0.4 });
      const partnerBody = new THREE.Mesh(partnerBodyGeo, partnerBodyMat);
      partnerBody.position.y = 0.65;
      partnerBody.castShadow = true;
      partnerRig.add(partnerBody);

      // Wedding Ring Halo
      const ringGeo = new THREE.TorusGeometry(0.18, 0.03, 10, 20);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, 1.35, 0);
      partnerRig.add(ringMesh);
    }

    // --- 3D INTERACTIVE TOY BALL ---
    const ballGroup = new THREE.Group();
    const ballGeo = new THREE.SphereGeometry(0.34, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.2, metalness: 0.1 });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.castShadow = true;
    ballGroup.add(ballMesh);

    const stripeGeo = new THREE.TorusGeometry(0.34, 0.025, 12, 32);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
    const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe2.rotation.y = Math.PI / 2;
    ballGroup.add(stripe1);
    ballGroup.add(stripe2);

    ballGroup.position.set(0, -5, 0);
    scene.add(ballGroup);

    // --- 3D INTERACTIVE FOOD ITEM ---
    const foodGroup = new THREE.Group();
    const berryGeo = new THREE.DodecahedronGeometry(0.24);
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.3 });
    const berryMesh = new THREE.Mesh(berryGeo, berryMat);
    berryMesh.castShadow = true;
    foodGroup.add(berryMesh);
    foodGroup.position.set(0, -5, 0);
    scene.add(foodGroup);

    // --- MOUSE & TOUCH ORBIT DRAG CONTROLS ---
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse2D = new THREE.Vector2();
    const target3D = new THREE.Vector3(0, 0.86, 5);

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const rect = container.getBoundingClientRect();
      mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse2D, camera);
      const intersects = raycaster.intersectObjects([bodyMesh, grassTop], true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.object === bodyMesh || hit.object.parent === bodyRoot) {
          if (onPetClick) onPetClick();
          if (stateRef.current.soundEnabled) sounds.playPurr();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      target3D.set(mouse2D.x * 4, mouse2D.y * 3 + 1, 4);

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        // Rotate Camera around Orbit
        cameraAngleY -= deltaX * 0.008;
        cameraAngleX = THREE.MathUtils.clamp(cameraAngleX + deltaY * 0.008, 0.1, 0.85);
        updateCameraPos();
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animTime = 0;
    let walkProgress = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    const currentPetPos = new THREE.Vector3(0, 0, 0);
    const targetPetPos = new THREE.Vector3(0, 0, 0);
    let petFacingAngle = 0;

    let reqId: number;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      animTime += delta;

      const action = stateRef.current.currentAction;
      const targetCoord = stateRef.current.targetPos;
      const ball = stateRef.current.ballPos;
      const food = stateRef.current.foodItem;

      // 1. Atmosphere adjustments based on weather
      if (stateRef.current.weatherTheme === 'night') {
        ambientLight.intensity = 0.55;
        sunLight.intensity = 0.7;
        sunLight.color.setHex(0x64a8fe);
        starParticles.material.color.setHex(0x93c5fd);
      } else if (stateRef.current.weatherTheme === 'rain') {
        ambientLight.intensity = 0.75;
        sunLight.intensity = 1.0;
        sunLight.color.setHex(0xdbeafe);
        starParticles.material.color.setHex(0x60a5fa);
      } else {
        ambientLight.intensity = 1.0;
        sunLight.intensity = 2.0;
        sunLight.color.setHex(0xfff5e6);
        starParticles.material.color.setHex(0xfffa65);
      }

      // Floating butterflies flutter
      butterflies.forEach((bFly, idx) => {
        const flap = Math.sin(animTime * 18);
        (bFly.children[0] as THREE.Mesh).rotation.y = flap * 0.8;
        (bFly.children[1] as THREE.Mesh).rotation.y = -flap * 0.8;

        const bAngle = animTime * 0.6 + idx * Math.PI;
        bFly.position.x = Math.cos(bAngle) * 2.6;
        bFly.position.z = Math.sin(bAngle) * 2.0;
        bFly.position.y = 1.2 + Math.sin(animTime * 2 + idx) * 0.3;
        bFly.rotation.y = -bAngle + Math.PI / 2;
      });

      // Stardust float
      const posAttr = starGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < starCount; i++) {
        let y = posAttr.getY(i) + delta * 0.4;
        if (y > 4.5) y = 0.3;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // 2. Smooth pupil lookAt tracking
      const lookOffset = target3D.clone().sub(petRig.position);
      leftPupil.position.x = THREE.MathUtils.clamp(lookOffset.x * 0.02, -0.04, 0.04);
      leftPupil.position.y = THREE.MathUtils.clamp(lookOffset.y * 0.02, -0.04, 0.04);
      rightPupil.position.x = THREE.MathUtils.clamp(lookOffset.x * 0.02, -0.04, 0.04);
      rightPupil.position.y = THREE.MathUtils.clamp(lookOffset.y * 0.02, -0.04, 0.04);

      // 3. Natural Blinking Loop
      blinkTimer += delta;
      if (blinkTimer > 3.4 && !isBlinking) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking) {
        eyeGroupLeft.scale.y = 0.1;
        eyeGroupRight.scale.y = 0.1;
        if (blinkTimer > 0.15) {
          eyeGroupLeft.scale.y = 1.0;
          eyeGroupRight.scale.y = 1.0;
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      // 4. Movement Logic (Walk / Run towards Target)
      if (targetCoord) {
        targetPetPos.set(targetCoord.x, 0, targetCoord.z);
        const dist = currentPetPos.distanceTo(targetPetPos);

        if (dist > 0.08) {
          const moveDir = targetPetPos.clone().sub(currentPetPos).normalize();
          const targetAngle = Math.atan2(moveDir.x, moveDir.z);
          petFacingAngle = THREE.MathUtils.lerp(petFacingAngle, targetAngle, delta * 10);
          petRig.rotation.y = petFacingAngle;

          const speed = action === 'run' ? 3.6 : 2.2;
          currentPetPos.add(moveDir.multiplyScalar(delta * speed));
          petRig.position.copy(currentPetPos);

          // Paws stepping
          walkProgress += delta * speed * 4.5;
          leftFoot.position.z = 0.15 + Math.sin(walkProgress) * 0.2;
          leftFoot.position.y = 0.15 + Math.max(0, Math.cos(walkProgress)) * 0.14;

          rightFoot.position.z = 0.15 - Math.sin(walkProgress) * 0.2;
          rightFoot.position.y = 0.15 + Math.max(0, -Math.cos(walkProgress)) * 0.14;

          // Body bobbing and forward tilt
          bodyRoot.position.y = Math.abs(Math.sin(walkProgress * 2)) * 0.12;
          bodyRoot.rotation.x = 0.15;
          bodyRoot.rotation.z = Math.sin(walkProgress) * 0.08;

          tailGroup.rotation.y = Math.sin(walkProgress * 2) * 0.6;
        } else {
          if (onPetArrived) onPetArrived();
        }
      }

      // 5. Toy Ball Physics & Pet Chase
      if (ball && ball.active) {
        ballGroup.position.set(ball.x, 0.34 + Math.abs(Math.sin(animTime * 6)) * 0.6, ball.z);
        ballGroup.rotation.x += delta * 5;
        ballGroup.rotation.z += delta * 3;

        if (currentPetPos.distanceTo(new THREE.Vector3(ball.x, 0, ball.z)) < 0.85) {
          if (onBallCaught) onBallCaught();
        }
      } else {
        ballGroup.position.set(0, -5, 0);
      }

      // 6. Food Drop & Chewing
      if (food && food.active) {
        foodGroup.position.set(food.x, 0.3 + Math.abs(Math.sin(animTime * 4)) * 0.2, food.z);
        foodGroup.rotation.y += delta * 3;

        if (currentPetPos.distanceTo(new THREE.Vector3(food.x, 0, food.z)) < 0.85) {
          if (onFoodEaten) onFoodEaten();
        }
      } else {
        foodGroup.position.set(0, -5, 0);
      }

      // 7. Expressive State Animations
      if (action === 'idle' && !targetCoord) {
        const breath = Math.sin(animTime * 2.5);
        bodyRoot.scale.set(1 + breath * 0.03, 1 + breath * 0.05, 1 + breath * 0.03);
        bodyRoot.position.y = (breath + 1) * 0.04;
        bodyRoot.rotation.x = 0;
        bodyRoot.rotation.z = 0;

        leftEarGroup.rotation.z = Math.sin(animTime * 3) * 0.1;
        rightEarGroup.rotation.z = -Math.sin(animTime * 3) * 0.1;

        tailGroup.rotation.y = Math.sin(animTime * 1.8) * 0.3;
        leftFoot.position.set(-0.28, 0.15, 0.15);
        rightFoot.position.set(0.28, 0.15, 0.15);
      } else if (action === 'happy' || action === 'jump') {
        const hop = Math.abs(Math.sin(animTime * 8));
        bodyRoot.position.y = hop * 0.85;
        bodyRoot.scale.set(1 - hop * 0.15, 1 + hop * 0.32, 1 - hop * 0.15);
        tailGroup.rotation.y = Math.sin(animTime * 16) * 0.8;
        mouthMesh.scale.set(1.4, 1.4, 1.4);
      } else if (action === 'pet') {
        bodyRoot.scale.set(1.22, 0.76, 1.22);
        bodyRoot.position.y = -0.15;
        eyeGroupLeft.scale.y = 0.2;
        eyeGroupRight.scale.y = 0.2;
        leftCheek.scale.set(1.5, 1.3, 1.3);
        rightCheek.scale.set(1.5, 1.3, 1.3);
      } else if (action === 'eat') {
        const chew = Math.sin(animTime * 12);
        mouthMesh.position.y = 0.8 + chew * 0.06;
        bodyRoot.scale.set(1 + chew * 0.06, 1 - chew * 0.06, 1 + chew * 0.06);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(reqId);
      ro.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [pet.id, pet.element]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[340px] sm:min-h-[420px] relative touch-none select-none cursor-grab active:cursor-grabbing"
    />
  );
};
