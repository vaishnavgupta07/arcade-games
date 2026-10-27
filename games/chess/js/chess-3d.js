/**
 * Royal Kingdom Chess - 3D Multi-Environment Cinematic Viewport
 * Powered by Three.js. Supports 6 Living 3D Realms, Realistic Materials, Procedural Pieces & Dynamic Particles.
 */

class Chess3D {
    static REALMS = {
        royal: {
            id: 'royal',
            name: 'Royal Kingdom',
            bgColor: 0x0a0c16,
            fogColor: 0x0a0c16,
            fogDensity: 0.035,
            ambientColor: 0x28183c,
            ambientIntensity: 1.2,
            sunColor: 0xffdfb0,
            sunIntensity: 1.8,
            sunPos: [12, 24, 14],
            rimColor: 0x4060aa,
            rimIntensity: 1.1,
            centerColor: 0xffa500,
            centerIntensity: 0.8,
            particleColor: 0xffd700,
            particleSize: 0.12,
            particleVelocityY: 0.015,
            pedestalColor: 0x14101c,
            frameColor: 0x1e1208,
            trimColor: 0xd4af37,
            lightSqColor: 0xedebe4,
            darkSqColor: 0x1c1e28,
            pieceWhiteColor: 0xf4f2ea,
            pieceBlackColor: 0x181822
        },
        forest: {
            id: 'forest',
            name: 'Enchanted Forest',
            bgColor: 0x06140b,
            fogColor: 0x06140b,
            fogDensity: 0.038,
            ambientColor: 0x1a3820,
            ambientIntensity: 1.3,
            sunColor: 0xfff0aa,
            sunIntensity: 1.9,
            sunPos: [10, 26, 12],
            rimColor: 0x208848,
            rimIntensity: 1.0,
            centerColor: 0x77dd55,
            centerIntensity: 0.7,
            particleColor: 0x88ee66,
            particleSize: 0.14,
            particleVelocityY: -0.012, // gently drifting leaves
            pedestalColor: 0x121c14,
            frameColor: 0x24180e,
            trimColor: 0xb59445,
            lightSqColor: 0xdfd3b8,
            darkSqColor: 0x223222,
            pieceWhiteColor: 0xf0ede0,
            pieceBlackColor: 0x1a261a
        },
        frozen: {
            id: 'frozen',
            name: 'Frozen Kingdom',
            bgColor: 0x070f1e,
            fogColor: 0x070f1e,
            fogDensity: 0.036,
            ambientColor: 0x142440,
            ambientIntensity: 1.4,
            sunColor: 0xd0e8ff,
            sunIntensity: 1.7,
            sunPos: [-12, 24, 15],
            rimColor: 0x70b8ff,
            rimIntensity: 1.3,
            centerColor: 0xa0d8ef,
            centerIntensity: 0.6,
            particleColor: 0xffffff,
            particleSize: 0.13,
            particleVelocityY: -0.02, // falling snow
            pedestalColor: 0x141e2e,
            frameColor: 0x1c2434,
            trimColor: 0x90b8e0,
            lightSqColor: 0xe5f0ff,
            darkSqColor: 0x162438,
            pieceWhiteColor: 0xf4f8ff,
            pieceBlackColor: 0x141d2a
        },
        dragon: {
            id: 'dragon',
            name: 'Dragon Realm',
            bgColor: 0x140606,
            fogColor: 0x140606,
            fogDensity: 0.04,
            ambientColor: 0x3d0d0d,
            ambientIntensity: 1.3,
            sunColor: 0xff7733,
            sunIntensity: 1.9,
            sunPos: [14, 22, -10],
            rimColor: 0xff2200,
            rimIntensity: 1.4,
            centerColor: 0xff4400,
            centerIntensity: 0.9,
            particleColor: 0xff5511,
            particleSize: 0.15,
            particleVelocityY: 0.025, // rising embers
            pedestalColor: 0x180c0c,
            frameColor: 0x1c1010,
            trimColor: 0xdd4411,
            lightSqColor: 0xd2c0b0,
            darkSqColor: 0x1e1214,
            pieceWhiteColor: 0xf0e6dc,
            pieceBlackColor: 0x221416
        },
        celestial: {
            id: 'celestial',
            name: 'Celestial Realm',
            bgColor: 0x080616,
            fogColor: 0x080616,
            fogDensity: 0.032,
            ambientColor: 0x24103c,
            ambientIntensity: 1.4,
            sunColor: 0xc899ff,
            sunIntensity: 1.7,
            sunPos: [0, 26, 12],
            rimColor: 0x00e5ff,
            rimIntensity: 1.2,
            centerColor: 0x9955ff,
            centerIntensity: 0.8,
            particleColor: 0xaa88ff,
            particleSize: 0.13,
            particleVelocityY: 0.008,
            pedestalColor: 0x120e24,
            frameColor: 0x141028,
            trimColor: 0xffd700,
            lightSqColor: 0xeee6ff,
            darkSqColor: 0x181432,
            pieceWhiteColor: 0xf6f0ff,
            pieceBlackColor: 0x16122c
        },
        temple: {
            id: 'temple',
            name: 'Ancient Temple',
            bgColor: 0x120c06,
            fogColor: 0x120c06,
            fogDensity: 0.034,
            ambientColor: 0x321c10,
            ambientIntensity: 1.3,
            sunColor: 0xffc580,
            sunIntensity: 1.8,
            sunPos: [15, 22, 12],
            rimColor: 0xffaa44,
            rimIntensity: 1.0,
            centerColor: 0xff9922,
            centerIntensity: 0.8,
            particleColor: 0xddaa55,
            particleSize: 0.12,
            particleVelocityY: 0.012,
            pedestalColor: 0x20160e,
            frameColor: 0x2c1e12,
            trimColor: 0xcc9933,
            lightSqColor: 0xe8dfce,
            darkSqColor: 0x2c2622,
            pieceWhiteColor: 0xf4ede2,
            pieceBlackColor: 0x221c18
        }
    };

    constructor(containerElement, onMoveAttempt, initialEnv = 'royal') {
        this.container = containerElement;
        this.onMoveAttempt = onMoveAttempt;
        this.currentEnvId = initialEnv;
        this.currentRealm = Chess3D.REALMS[initialEnv] || Chess3D.REALMS.royal;
        this.orientation = 'w';
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.inCheckSquare = null;
        this.isTopDown = false;
        this.graphicsQuality = 'high'; // 'high' | 'medium' | 'low'

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.animatingPieces = [];

        this.squareMeshes = {};
        this.pieceMeshes = {};
        this.markerMeshes = [];
        this.envSceneryGroup = null;
        this.boardGroup = null;
        this.particles = null;

        this.initThree();
        this.setupEnvironment(this.currentEnvId);
        this.createBoard();

        this.animate = this.animate.bind(this);
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    initThree() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.currentRealm.bgColor);
        this.scene.fog = new THREE.FogExp2(this.currentRealm.fogColor, this.currentRealm.fogDensity);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.updateCameraPosition(false);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        this.container.appendChild(this.renderer.domElement);

        this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));

        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.container);
    }

    handleResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    setQuality(quality = 'high') {
        this.graphicsQuality = quality;
        if (!this.renderer) return;

        if (quality === 'low') {
            this.renderer.shadowMap.enabled = false;
            this.renderer.setPixelRatio(1);
        } else if (quality === 'medium') {
            this.renderer.shadowMap.enabled = true;
            this.renderer.setPixelRatio(1.2);
        } else {
            this.renderer.shadowMap.enabled = true;
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        this.setupEnvironment(this.currentEnvId);
    }

    updateCameraPosition(smooth = true) {
        let targetX = 0;
        let targetY = 16;
        let targetZ = this.orientation === 'w' ? 14 : -14;

        if (this.isTopDown) {
            targetX = 0;
            targetY = 22;
            targetZ = this.orientation === 'w' ? 0.01 : -0.01;
        }

        if (!smooth) {
            this.camera.position.set(targetX, targetY, targetZ);
            this.camera.lookAt(0, 0, 0);
        } else {
            this.targetCameraPos = new THREE.Vector3(targetX, targetY, targetZ);
        }
    }

    // =========================================================================
    // DYNAMIC 3D ENVIRONMENT SWITCHER (6 DISTINCT REALMS)
    // =========================================================================
    setEnvironment(envId) {
        if (!Chess3D.REALMS[envId]) return;
        this.currentEnvId = envId;
        this.currentRealm = Chess3D.REALMS[envId];

        // Update Scene Fog & Background
        this.scene.background.setHex(this.currentRealm.bgColor);
        this.scene.fog.color.setHex(this.currentRealm.fogColor);
        this.scene.fog.density = this.currentRealm.fogDensity;

        // Rebuild environment lighting & 3D scenery
        this.setupEnvironment(envId);

        // Rebuild Board Materials
        this.updateBoardMaterials();

        // Update piece materials to harmonize with new realm lighting
        this.updatePieceMaterials();
    }

    setupEnvironment(envId) {
        // Clear previous environment group & lights
        if (this.envSceneryGroup) {
            this.scene.remove(this.envSceneryGroup);
        }
        if (this.particles) {
            this.scene.remove(this.particles);
        }

        const envGroup = new THREE.Group();
        const r = this.currentRealm;

        // 1. Ambient Light
        const ambientLight = new THREE.AmbientLight(r.ambientColor, r.ambientIntensity);
        envGroup.add(ambientLight);

        // 2. Main Directional Sunlight / Torchlight
        const sun = new THREE.DirectionalLight(r.sunColor, r.sunIntensity);
        sun.position.set(r.sunPos[0], r.sunPos[1], r.sunPos[2]);
        if (this.graphicsQuality !== 'low') {
            sun.castShadow = true;
            sun.shadow.mapSize.width = this.graphicsQuality === 'high' ? 1024 : 512;
            sun.shadow.mapSize.height = this.graphicsQuality === 'high' ? 1024 : 512;
            sun.shadow.camera.near = 0.5;
            sun.shadow.camera.far = 60;
            sun.shadow.camera.left = -12;
            sun.shadow.camera.right = 12;
            sun.shadow.camera.top = 12;
            sun.shadow.camera.bottom = -12;
            sun.shadow.bias = -0.0005;
        }
        envGroup.add(sun);

        // 3. Rim Accent Light
        const rim = new THREE.DirectionalLight(r.rimColor, r.rimIntensity);
        rim.position.set(-r.sunPos[0], 18, -r.sunPos[2]);
        envGroup.add(rim);

        // 4. Center Table Glow
        const centerLight = new THREE.PointLight(r.centerColor, r.centerIntensity, 25);
        centerLight.position.set(0, 7.5, 0);
        envGroup.add(centerLight);

        // 5. Environmental Table Pedestal
        const tableGeo = new THREE.CylinderGeometry(11, 12, 1.2, 48);
        const tableMat = new THREE.MeshStandardMaterial({
            color: r.pedestalColor,
            roughness: 0.65,
            metalness: 0.25
        });
        const tableMesh = new THREE.Mesh(tableGeo, tableMat);
        tableMesh.position.y = -0.65;
        tableMesh.receiveShadow = (this.graphicsQuality !== 'low');
        envGroup.add(tableMesh);

        // 6. Distinct 3D Realm Scenery Geometry
        this.buildRealmScenery(envId, envGroup);

        // 7. Dynamic Particle System
        const count = this.graphicsQuality === 'high' ? 160 : (this.graphicsQuality === 'medium' ? 80 : 30);
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 30;
            positions[i + 1] = Math.random() * 18;
            positions[i + 2] = (Math.random() - 0.5) * 30;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: r.particleColor,
            size: r.particleSize,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending
        });
        this.particles = new THREE.Points(particleGeo, particleMat);
        this.scene.add(this.particles);

        this.scene.add(envGroup);
        this.envSceneryGroup = envGroup;
    }

    buildRealmScenery(envId, group) {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1a1e28, roughness: 0.85 });

        switch (envId) {
            case 'forest': {
                // 3D Pine Trees & Forest Rocks surrounding table
                const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
                const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1b4320, roughness: 0.7 });

                const treePositions = [
                    [-14, 0, -14], [14, 0, -14], [-16, 0, 8], [16, 0, 8], [0, 0, -22]
                ];
                treePositions.forEach(pos => {
                    const treeGroup = new THREE.Group();
                    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 5, 8), trunkMat);
                    trunk.position.y = 2.5;
                    treeGroup.add(trunk);

                    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(3.5, 5, 8), foliageMat);
                    cone1.position.y = 5.5;
                    treeGroup.add(cone1);

                    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4.5, 8), foliageMat);
                    cone2.position.y = 8;
                    treeGroup.add(cone2);

                    treeGroup.position.set(pos[0], -0.65, pos[2]);
                    group.add(treeGroup);
                });
                break;
            }

            case 'frozen': {
                // Frosted Ice Spires & Snow Castles
                const iceMat = new THREE.MeshStandardMaterial({
                    color: 0x88c0ee,
                    roughness: 0.15,
                    metalness: 0.2,
                    transparent: true,
                    opacity: 0.85
                });
                [[-14, 0, -14], [14, 0, -14], [-12, 0, 12], [12, 0, 12]].forEach(pos => {
                    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 6), iceMat);
                    spire.position.set(pos[0], 3.8, pos[2]);
                    group.add(spire);
                });
                break;
            }

            case 'dragon': {
                // Volcanic Basalt Crags & Lava Glow Plane
                const basaltMat = new THREE.MeshStandardMaterial({ color: 0x120a0a, roughness: 0.95 });
                [[-15, 0, -15], [15, 0, -15], [-16, 0, 6], [16, 0, 6], [0, 0, -24]].forEach(pos => {
                    const crag = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 2.5, 8, 5), basaltMat);
                    crag.position.set(pos[0], 3.3, pos[2]);
                    crag.rotation.z = (Math.random() - 0.5) * 0.2;
                    group.add(crag);
                });

                // Distant Lava Horizon
                const lavaGeo = new THREE.PlaneGeometry(60, 20);
                const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
                const lava = new THREE.Mesh(lavaGeo, lavaMat);
                lava.rotation.x = -Math.PI / 2;
                lava.position.set(0, -1.0, -20);
                group.add(lava);
                break;
            }

            case 'celestial': {
                // Floating Celestial Orbit Rings & Starfield Plane
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0x9955ff,
                    metalness: 0.9,
                    roughness: 0.15,
                    emissive: 0x4411aa
                });
                const orbitRing1 = new THREE.Mesh(new THREE.TorusGeometry(18, 0.12, 8, 48), ringMat);
                orbitRing1.rotation.x = Math.PI / 3;
                orbitRing1.position.set(0, 4, 0);
                group.add(orbitRing1);

                const orbitRing2 = new THREE.Mesh(new THREE.TorusGeometry(22, 0.08, 8, 48), ringMat);
                orbitRing2.rotation.x = -Math.PI / 4;
                orbitRing2.position.set(0, 6, 0);
                group.add(orbitRing2);
                break;
            }

            case 'temple': {
                // Ancient Stone Pillars
                const pillarMat = new THREE.MeshStandardMaterial({ color: 0x36281e, roughness: 0.8 });
                [[-13, 0, -12], [13, 0, -12], [-13, 0, 10], [13, 0, 10]].forEach(pos => {
                    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 10, 16), pillarMat);
                    pillar.position.set(pos[0], 4.3, pos[2]);
                    group.add(pillar);
                });
                break;
            }

            case 'royal':
            default: {
                // Castle Arch Wall in background
                const wallGeo = new THREE.PlaneGeometry(80, 50);
                const wallMat = new THREE.MeshStandardMaterial({ color: 0x080a14, roughness: 0.9 });
                const wallMesh = new THREE.Mesh(wallGeo, wallMat);
                wallMesh.position.set(0, 15, -28);
                group.add(wallMesh);
                break;
            }
        }
    }

    createBoard() {
        const boardGroup = new THREE.Group();
        const r = this.currentRealm;

        // Frame
        const frameGeo = new THREE.BoxGeometry(9.6, 0.4, 9.6);
        const frameMat = new THREE.MeshStandardMaterial({
            color: r.frameColor,
            roughness: 0.4,
            metalness: 0.25
        });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.y = -0.21;
        frameMesh.receiveShadow = (this.graphicsQuality !== 'low');
        boardGroup.add(frameMesh);
        this.frameMesh = frameMesh;

        // Trim
        const trimGeo = new THREE.BoxGeometry(8.9, 0.08, 8.9);
        const trimMat = new THREE.MeshStandardMaterial({
            color: r.trimColor,
            metalness: 0.85,
            roughness: 0.2
        });
        const trimMesh = new THREE.Mesh(trimGeo, trimMat);
        trimMesh.position.y = -0.02;
        boardGroup.add(trimMesh);
        this.trimMesh = trimMesh;

        // 64 Chessboard Squares
        const squareSize = 1.05;
        const halfBoard = (8 * squareSize) / 2;
        const squareGeo = new THREE.BoxGeometry(squareSize * 0.98, 0.1, squareSize * 0.98);

        for (let row = 0; row < 8; row++) {
            for (let c = 0; c < 8; c++) {
                const squareName = ChessEngine.coordsToSquare(c, row);
                const isLight = (row + c) % 2 === 0;

                const sqMat = new THREE.MeshStandardMaterial({
                    color: isLight ? r.lightSqColor : r.darkSqColor,
                    roughness: isLight ? 0.25 : 0.35,
                    metalness: isLight ? 0.1 : 0.25
                });

                const sqMesh = new THREE.Mesh(squareGeo, sqMat);
                sqMesh.receiveShadow = (this.graphicsQuality !== 'low');

                const posX = (c * squareSize) - halfBoard + (squareSize / 2);
                const posZ = (row * squareSize) - halfBoard + (squareSize / 2);

                sqMesh.position.set(posX, 0, posZ);
                sqMesh.userData = { square: squareName, baseColor: sqMesh.material.color.clone() };

                boardGroup.add(sqMesh);
                this.squareMeshes[squareName] = sqMesh;
            }
        }

        this.scene.add(boardGroup);
        this.boardGroup = boardGroup;
    }

    updateBoardMaterials() {
        const r = this.currentRealm;
        if (this.frameMesh) {
            this.frameMesh.material.color.setHex(r.frameColor);
        }
        if (this.trimMesh) {
            this.trimMesh.material.color.setHex(r.trimColor);
        }

        for (let row = 0; row < 8; row++) {
            for (let c = 0; c < 8; c++) {
                const squareName = ChessEngine.coordsToSquare(c, row);
                const isLight = (row + c) % 2 === 0;
                const sqMesh = this.squareMeshes[squareName];
                if (sqMesh) {
                    const col = isLight ? r.lightSqColor : r.darkSqColor;
                    sqMesh.material.color.setHex(col);
                    sqMesh.userData.baseColor.setHex(col);
                }
            }
        }
    }

    createPieceMaterial(color) {
        const r = this.currentRealm;
        if (color === 'w') {
            return new THREE.MeshPhysicalMaterial({
                color: r.pieceWhiteColor,
                roughness: 0.22,
                metalness: 0.25,
                clearcoat: 0.4,
                clearcoatRoughness: 0.2
            });
        } else {
            return new THREE.MeshPhysicalMaterial({
                color: r.pieceBlackColor,
                roughness: 0.28,
                metalness: 0.35,
                clearcoat: 0.35,
                clearcoatRoughness: 0.25
            });
        }
    }

    updatePieceMaterials() {
        Object.keys(this.pieceMeshes).forEach(sq => {
            const mesh = this.pieceMeshes[sq];
            if (mesh) {
                const newMat = this.createPieceMaterial(mesh.userData.color);
                mesh.traverse(child => {
                    if (child.isMesh && child.material && !child.userData.isAccent) {
                        child.material = newMat;
                    }
                });
            }
        });
    }

    // Procedural Regal Geometric Pieces
    createPieceMesh(type, color) {
        const group = new THREE.Group();
        const mat = this.createPieceMaterial(color);

        const goldTrimMat = new THREE.MeshStandardMaterial({
            color: this.currentRealm.trimColor,
            metalness: 0.9,
            roughness: 0.2
        });

        const shadowEnabled = (this.graphicsQuality !== 'low');

        // Base
        const baseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.18, 24);
        const baseMesh = new THREE.Mesh(baseGeo, mat);
        baseMesh.castShadow = shadowEnabled;
        baseMesh.receiveShadow = shadowEnabled;
        baseMesh.position.y = 0.09;
        group.add(baseMesh);

        // Collar ring
        const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.025, 8, 24), goldTrimMat);
        baseRing.userData.isAccent = true;
        baseRing.rotation.x = Math.PI / 2;
        baseRing.position.y = 0.12;
        group.add(baseRing);

        // Fluted Stem
        const stemGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.5, 20);
        const stemMesh = new THREE.Mesh(stemGeo, mat);
        stemMesh.position.y = 0.42;
        stemMesh.castShadow = shadowEnabled;
        group.add(stemMesh);

        switch (type) {
            case 'p': { // PAWN
                const collar = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 20), goldTrimMat);
                collar.userData.isAccent = true;
                collar.rotation.x = Math.PI / 2;
                collar.position.y = 0.68;
                group.add(collar);

                const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), mat);
                head.position.y = 0.92;
                head.castShadow = shadowEnabled;
                group.add(head);
                break;
            }

            case 'r': { // ROOK
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.6, 20), mat);
                body.position.y = 0.85;
                body.castShadow = shadowEnabled;
                group.add(body);

                const topWall = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 0.25, 24), mat);
                topWall.position.y = 1.2;
                topWall.castShadow = shadowEnabled;
                group.add(topWall);

                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    const cren = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), mat);
                    cren.position.set(Math.cos(angle) * 0.28, 1.38, Math.sin(angle) * 0.28);
                    cren.castShadow = shadowEnabled;
                    group.add(cren);
                }
                break;
            }

            case 'n': { // KNIGHT
                const chest = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 16), mat);
                chest.position.y = 0.82;
                chest.castShadow = shadowEnabled;
                group.add(chest);

                const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.45), mat);
                head.position.set(0, 1.15, 0.12);
                head.rotation.x = Math.PI / 6;
                head.castShadow = shadowEnabled;
                group.add(head);

                const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.28), mat);
                muzzle.position.set(0, 0.98, 0.32);
                muzzle.castShadow = shadowEnabled;
                group.add(muzzle);

                [-0.08, 0.08].forEach(x => {
                    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), mat);
                    ear.position.set(x, 1.42, 0.02);
                    ear.rotation.x = -Math.PI / 10;
                    group.add(ear);
                });

                if (color === 'b') {
                    group.rotation.y = Math.PI;
                }
                break;
            }

            case 'b': { // BISHOP
                const upperBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.6, 20), mat);
                upperBody.position.y = 0.88;
                upperBody.castShadow = shadowEnabled;
                group.add(upperBody);

                const mitre = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 18), mat);
                mitre.scale.set(1, 1.4, 0.85);
                mitre.position.y = 1.32;
                mitre.castShadow = shadowEnabled;
                group.add(mitre);

                const finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldTrimMat);
                finial.userData.isAccent = true;
                finial.position.y = 1.76;
                group.add(finial);
                break;
            }

            case 'q': { // QUEEN
                const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.8, 24), mat);
                upper.position.y = 0.95;
                upper.castShadow = shadowEnabled;
                group.add(upper);

                const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 8, 24), goldTrimMat);
                crownRing.userData.isAccent = true;
                crownRing.rotation.x = Math.PI / 2;
                crownRing.position.y = 1.38;
                group.add(crownRing);

                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    const pt = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), mat);
                    pt.position.set(Math.cos(angle) * 0.32, 1.5, Math.sin(angle) * 0.32);
                    group.add(pt);
                }

                const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), goldTrimMat);
                orb.userData.isAccent = true;
                orb.position.y = 1.58;
                group.add(orb);
                break;
            }

            case 'k': { // KING
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.28, 0.9, 24), mat);
                body.position.y = 1.0;
                body.castShadow = shadowEnabled;
                group.add(body);

                const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 24), goldTrimMat);
                crownRing.userData.isAccent = true;
                crownRing.rotation.x = Math.PI / 2;
                crownRing.position.y = 1.48;
                group.add(crownRing);

                const dome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), mat);
                dome.scale.set(1, 0.9, 1);
                dome.position.y = 1.62;
                dome.castShadow = shadowEnabled;
                group.add(dome);

                const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), goldTrimMat);
                crossVert.userData.isAccent = true;
                crossVert.position.y = 1.96;
                group.add(crossVert);

                const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), goldTrimMat);
                crossHoriz.userData.isAccent = true;
                crossHoriz.position.y = 2.02;
                group.add(crossHoriz);
                break;
            }
        }

        return group;
    }

    setOrientation(color) {
        this.orientation = color === 'b' ? 'b' : 'w';
        this.updateCameraPosition(true);
    }

    toggleTopDown() {
        this.isTopDown = !this.isTopDown;
        this.updateCameraPosition(true);
        return this.isTopDown;
    }

    render(engine, highlights = {}) {
        this.selectedSquare = highlights.selected || null;
        this.legalMoves = highlights.legalMoves || [];
        this.lastMove = highlights.lastMove || null;
        this.inCheckSquare = highlights.checkSquare || null;

        // Reset square highlights
        Object.keys(this.squareMeshes).forEach(sq => {
            const sqMesh = this.squareMeshes[sq];
            sqMesh.material.color.copy(sqMesh.userData.baseColor);
            sqMesh.material.emissive.setHex(0x000000);
        });

        // Clear old marker discs
        this.markerMeshes.forEach(m => this.scene.remove(m));
        this.markerMeshes = [];

        // Last move highlight
        if (this.lastMove) {
            [this.lastMove.from, this.lastMove.to].forEach(sq => {
                const sqMesh = this.squareMeshes[sq];
                if (sqMesh) {
                    sqMesh.material.emissive.setHex(0x004060);
                }
            });
        }

        // Selected square highlight
        if (this.selectedSquare && this.squareMeshes[this.selectedSquare]) {
            this.squareMeshes[this.selectedSquare].material.emissive.setHex(0x664400);
        }

        // King in check highlight
        if (this.inCheckSquare && this.squareMeshes[this.inCheckSquare]) {
            this.squareMeshes[this.inCheckSquare].material.emissive.setHex(0x881111);
        }

        // Tactical Hint Highlights (Glowing Beacon)
        if (highlights.hint) {
            const hintFromMesh = this.squareMeshes[highlights.hint.from];
            const hintToMesh = this.squareMeshes[highlights.hint.to];
            if (hintFromMesh) {
                hintFromMesh.material.emissive.setHex(0x997700); // Luminous gold beacon
            }
            if (hintToMesh) {
                hintToMesh.material.emissive.setHex(0x004466); // Luminous cyan beacon
                const hintBeaconMat = new THREE.MeshBasicMaterial({
                    color: 0x00f0ff,
                    transparent: true,
                    opacity: 0.85
                });
                const hintRing = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 32), hintBeaconMat);
                hintRing.rotation.x = -Math.PI / 2;
                hintRing.position.set(hintToMesh.position.x, 0.08, hintToMesh.position.z);
                this.scene.add(hintRing);
                this.markerMeshes.push(hintRing);
            }
        }

        // Draw Legal Move Markers
        const markerMatMove = new THREE.MeshBasicMaterial({
            color: this.currentRealm.trimColor,
            transparent: true,
            opacity: 0.6
        });
        const markerMatCapture = new THREE.MeshBasicMaterial({
            color: 0xff3355,
            transparent: true,
            opacity: 0.7
        });

        this.legalMoves.forEach(m => {
            const targetSq = this.squareMeshes[m.to];
            if (!targetSq) return;

            let markerMesh;
            if (m.captured) {
                markerMesh = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 24), markerMatCapture);
            } else {
                markerMesh = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), markerMatMove);
            }

            markerMesh.rotation.x = -Math.PI / 2;
            markerMesh.position.set(targetSq.position.x, 0.06, targetSq.position.z);
            this.scene.add(markerMesh);
            this.markerMeshes.push(markerMesh);
        });

        // Update Piece Meshes on Board
        const board = engine.getBoardMatrix();
        const currentPiecesBySquare = {};

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                const sqName = ChessEngine.coordsToSquare(c, r);
                if (piece) {
                    currentPiecesBySquare[sqName] = { type: piece.type, color: piece.color };
                }
            }
        }

        Object.keys(this.pieceMeshes).forEach(sq => {
            const current = currentPiecesBySquare[sq];
            const existing = this.pieceMeshes[sq];
            if (!current || existing.userData.type !== current.type || existing.userData.color !== current.color) {
                this.scene.remove(existing);
                delete this.pieceMeshes[sq];
            }
        });

        Object.keys(currentPiecesBySquare).forEach(sq => {
            const info = currentPiecesBySquare[sq];
            let mesh = this.pieceMeshes[sq];
            const targetSqMesh = this.squareMeshes[sq];

            if (!mesh) {
                mesh = this.createPieceMesh(info.type, info.color);
                mesh.userData = { square: sq, type: info.type, color: info.color };
                mesh.position.set(targetSqMesh.position.x, 0.05, targetSqMesh.position.z);
                this.scene.add(mesh);
                this.pieceMeshes[sq] = mesh;
            } else {
                if (!mesh.userData.isAnimating) {
                    mesh.position.set(targetSqMesh.position.x, 0.05, targetSqMesh.position.z);
                }
            }
        });
    }

    animateMove(fromSq, toSq, onComplete) {
        const pieceMesh = this.pieceMeshes[fromSq];
        const fromSqMesh = this.squareMeshes[fromSq];
        const toSqMesh = this.squareMeshes[toSq];

        if (!pieceMesh || !fromSqMesh || !toSqMesh) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        pieceMesh.userData.isAnimating = true;
        const startPos = new THREE.Vector3(fromSqMesh.position.x, 0.05, fromSqMesh.position.z);
        const endPos = new THREE.Vector3(toSqMesh.position.x, 0.05, toSqMesh.position.z);

        this.animatingPieces.push({
            mesh: pieceMesh,
            startPos,
            endPos,
            progress: 0,
            duration: 0.28,
            onComplete: () => {
                pieceMesh.userData.isAnimating = false;
                if (typeof onComplete === 'function') onComplete();
            }
        });
    }

    onPointerDown(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const squaresArray = Object.values(this.squareMeshes);
        const intersects = this.raycaster.intersectObjects(squaresArray, false);

        if (intersects.length > 0) {
            const hitSquare = intersects[0].object.userData.square;
            if (hitSquare && typeof this.onMoveAttempt === 'function') {
                this.onMoveAttempt(hitSquare);
            }
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);

        // Smooth camera lerp
        if (this.targetCameraPos) {
            this.camera.position.lerp(this.targetCameraPos, 0.08);
            this.camera.lookAt(0, 0, 0);
            if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
                this.camera.position.copy(this.targetCameraPos);
                this.targetCameraPos = null;
            }
        }

        // Animate particles based on current realm velocity
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const vy = this.currentRealm.particleVelocityY || 0.015;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += vy;
                if (vy > 0 && positions[i] > 18) {
                    positions[i] = 0;
                } else if (vy < 0 && positions[i] < 0) {
                    positions[i] = 18;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate piece movement arcs
        if (this.animatingPieces.length > 0) {
            const dt = 0.016;
            for (let i = this.animatingPieces.length - 1; i >= 0; i--) {
                const anim = this.animatingPieces[i];
                anim.progress += dt / anim.duration;

                if (anim.progress >= 1) {
                    anim.mesh.position.copy(anim.endPos);
                    this.animatingPieces.splice(i, 1);
                    anim.onComplete();
                } else {
                    const t = anim.progress;
                    anim.mesh.position.x = THREE.MathUtils.lerp(anim.startPos.x, anim.endPos.x, t);
                    anim.mesh.position.z = THREE.MathUtils.lerp(anim.startPos.z, anim.endPos.z, t);
                    anim.mesh.position.y = 0.05 + Math.sin(t * Math.PI) * 1.1;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }
}
