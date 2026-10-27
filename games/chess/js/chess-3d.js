/**
 * Royal Kingdom Chess - 3D Cinematic Castle Viewport
 * Powered by Three.js. Realistic materials, 3D procedural chess pieces, dynamic lighting & animations.
 */

class Chess3D {
    constructor(containerElement, onMoveAttempt) {
        this.container = containerElement;
        this.onMoveAttempt = onMoveAttempt;
        this.orientation = 'w'; // 'w' or 'b'
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.inCheckSquare = null;
        this.isTopDown = false;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.animatingPieces = []; // { mesh, startPos, endPos, progress, onComplete }

        this.squareMeshes = {}; // squareName -> Mesh
        this.pieceMeshes = {};  // squareName -> Group/Mesh
        this.markerMeshes = []; // legal move indicator discs
        this.particles = null;

        this.initThree();
        this.setupCastleEnvironment();
        this.createBoard();
        this.animate = this.animate.bind(this);
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    initThree() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0c16);
        this.scene.fog = new THREE.FogExp2(0x0a0c16, 0.035);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.updateCameraPosition(false);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        this.container.appendChild(this.renderer.domElement);

        // Click / Pointer event
        this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));

        // ResizeObserver
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
            // Smooth lerp in animate loop
            this.targetCameraPos = new THREE.Vector3(targetX, targetY, targetZ);
        }
    }

    setupCastleEnvironment() {
        // Ambient Light: Deep royal purple and warm candlelight
        const ambientLight = new THREE.AmbientLight(0x28183c, 1.2);
        this.scene.add(ambientLight);

        // Primary Directional Torchlight with Soft Shadows
        const torchLight = new THREE.DirectionalLight(0xffdfb0, 1.8);
        torchLight.position.set(12, 24, 14);
        torchLight.castShadow = true;
        torchLight.shadow.mapSize.width = 1024;
        torchLight.shadow.mapSize.height = 1024;
        torchLight.shadow.camera.near = 0.5;
        torchLight.shadow.camera.far = 60;
        torchLight.shadow.camera.left = -12;
        torchLight.shadow.camera.right = 12;
        torchLight.shadow.camera.top = 12;
        torchLight.shadow.camera.bottom = -12;
        torchLight.shadow.bias = -0.0005;
        this.scene.add(torchLight);

        // Secondary Cool Rim Light from Cathedral Window
        const rimLight = new THREE.DirectionalLight(0x4060aa, 1.1);
        rimLight.position.set(-15, 18, -14);
        this.scene.add(rimLight);

        // Warm Golden Center Pointlight
        const centerLight = new THREE.PointLight(0xffa500, 0.8, 25);
        centerLight.position.set(0, 8, 0);
        this.scene.add(centerLight);

        // Table / Pedestal under the chessboard
        const tableGeo = new THREE.CylinderGeometry(11, 12, 1.2, 48);
        const tableMat = new THREE.MeshStandardMaterial({
            color: 0x14101c,
            roughness: 0.65,
            metalness: 0.2
        });
        const tableMesh = new THREE.Mesh(tableGeo, tableMat);
        tableMesh.position.y = -0.65;
        tableMesh.receiveShadow = true;
        this.scene.add(tableMesh);

        // Castle Wall Arch in the background
        const wallGeo = new THREE.PlaneGeometry(80, 50);
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x080a14,
            roughness: 0.9,
            metalness: 0.1
        });
        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        wallMesh.position.set(0, 15, -28);
        this.scene.add(wallMesh);

        // Floating Dust & Embers Magic Particles
        const particleCount = 140;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 28;
            positions[i + 1] = Math.random() * 16;
            positions[i + 2] = (Math.random() - 0.5) * 28;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: 0xffd700,
            size: 0.12,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });
        this.particles = new THREE.Points(particleGeo, particleMat);
        this.scene.add(this.particles);
    }

    createBoard() {
        const boardGroup = new THREE.Group();

        // Mahogany & Brushed Gold Frame
        const frameGeo = new THREE.BoxGeometry(9.6, 0.4, 9.6);
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x1e1208, // Dark walnut mahogany
            roughness: 0.4,
            metalness: 0.25
        });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.y = -0.21;
        frameMesh.receiveShadow = true;
        boardGroup.add(frameMesh);

        // Gold Bevel Inlay Trim
        const trimGeo = new THREE.BoxGeometry(8.9, 0.08, 8.9);
        const trimMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37, // Royal Gold
            metalness: 0.85,
            roughness: 0.2
        });
        const trimMesh = new THREE.Mesh(trimGeo, trimMat);
        trimMesh.position.y = -0.02;
        boardGroup.add(trimMesh);

        // 64 Chessboard Squares
        const squareSize = 1.05;
        const halfBoard = (8 * squareSize) / 2;

        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xedebe4, // Marble Alabaster White
            roughness: 0.25,
            metalness: 0.1
        });

        const darkMat = new THREE.MeshStandardMaterial({
            color: 0x1c1e28, // Obsidian Dark Slate
            roughness: 0.35,
            metalness: 0.25
        });

        const squareGeo = new THREE.BoxGeometry(squareSize * 0.98, 0.1, squareSize * 0.98);

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const squareName = ChessEngine.coordsToSquare(c, r);
                const isLight = (r + c) % 2 === 0;

                const sqMesh = new THREE.Mesh(squareGeo, isLight ? lightMat.clone() : darkMat.clone());
                sqMesh.receiveShadow = true;

                const posX = (c * squareSize) - halfBoard + (squareSize / 2);
                const posZ = (r * squareSize) - halfBoard + (squareSize / 2);

                sqMesh.position.set(posX, 0, posZ);
                sqMesh.userData = { square: squareName, baseColor: sqMesh.material.color.clone() };

                boardGroup.add(sqMesh);
                this.squareMeshes[squareName] = sqMesh;
            }
        }

        this.scene.add(boardGroup);
        this.boardGroup = boardGroup;
    }

    // Material Definitions for White (Pearl Marble & Gold) and Black (Obsidian & Ruby Sheen)
    createPieceMaterial(color) {
        if (color === 'w') {
            return new THREE.MeshStandardMaterial({
                color: 0xf4f2ea,
                roughness: 0.22,
                metalness: 0.3,
                clearcoat: 0.4,
                clearcoatRoughness: 0.2
            });
        } else {
            return new THREE.MeshStandardMaterial({
                color: 0x181822,
                roughness: 0.3,
                metalness: 0.45,
                clearcoat: 0.3,
                clearcoatRoughness: 0.3
            });
        }
    }

    // Procedural Regal Geometric Pieces
    createPieceMesh(type, color) {
        const group = new THREE.Group();
        const mat = this.createPieceMaterial(color);

        // Gold Trim Collar Accent
        const goldTrimMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.2
        });

        // Universal Carved Base
        const baseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.18, 24);
        const baseMesh = new THREE.Mesh(baseGeo, mat);
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        baseMesh.position.y = 0.09;
        group.add(baseMesh);

        // Base Ring Accent
        const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.025, 8, 24), goldTrimMat);
        baseRing.rotation.x = Math.PI / 2;
        baseRing.position.y = 0.12;
        group.add(baseRing);

        // Fluted Stem
        const stemGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.5, 20);
        const stemMesh = new THREE.Mesh(stemGeo, mat);
        stemMesh.position.y = 0.42;
        stemMesh.castShadow = true;
        group.add(stemMesh);

        switch (type) {
            case 'p': { // PAWN
                const collar = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 20), goldTrimMat);
                collar.rotation.x = Math.PI / 2;
                collar.position.y = 0.68;
                group.add(collar);

                const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), mat);
                head.position.y = 0.92;
                head.castShadow = true;
                group.add(head);
                break;
            }

            case 'r': { // ROOK (Castle Tower with crenellations)
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.6, 20), mat);
                body.position.y = 0.85;
                body.castShadow = true;
                group.add(body);

                const topWall = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 0.25, 24), mat);
                topWall.position.y = 1.2;
                topWall.castShadow = true;
                group.add(topWall);

                // 4 Crenellation battlements
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    const cren = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), mat);
                    cren.position.set(Math.cos(angle) * 0.28, 1.38, Math.sin(angle) * 0.28);
                    cren.castShadow = true;
                    group.add(cren);
                }
                break;
            }

            case 'n': { // KNIGHT (Carved Horse Head & Mane)
                const chest = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 16), mat);
                chest.position.y = 0.82;
                chest.castShadow = true;
                group.add(chest);

                const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.45), mat);
                head.position.set(0, 1.15, 0.12);
                head.rotation.x = Math.PI / 6;
                head.castShadow = true;
                group.add(head);

                const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.28), mat);
                muzzle.position.set(0, 0.98, 0.32);
                muzzle.castShadow = true;
                group.add(muzzle);

                // Ears
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

            case 'b': { // BISHOP (Tall Mitre Crown with Golden Finial)
                const upperBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.6, 20), mat);
                upperBody.position.y = 0.88;
                upperBody.castShadow = true;
                group.add(upperBody);

                const mitre = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 18), mat);
                mitre.scale.set(1, 1.4, 0.85);
                mitre.position.y = 1.32;
                mitre.castShadow = true;
                group.add(mitre);

                const finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldTrimMat);
                finial.position.y = 1.76;
                group.add(finial);
                break;
            }

            case 'q': { // QUEEN (Coronet with Golden Orb)
                const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.8, 24), mat);
                upper.position.y = 0.95;
                upper.castShadow = true;
                group.add(upper);

                const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 8, 24), goldTrimMat);
                crownRing.rotation.x = Math.PI / 2;
                crownRing.position.y = 1.38;
                group.add(crownRing);

                // 8 Crown points
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    const pt = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), mat);
                    pt.position.set(Math.cos(angle) * 0.32, 1.5, Math.sin(angle) * 0.32);
                    group.add(pt);
                }

                const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), goldTrimMat);
                orb.position.y = 1.58;
                group.add(orb);
                break;
            }

            case 'k': { // KING (Majestic Tall Crown with Royal Cross)
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.28, 0.9, 24), mat);
                body.position.y = 1.0;
                body.castShadow = true;
                group.add(body);

                const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 24), goldTrimMat);
                crownRing.rotation.x = Math.PI / 2;
                crownRing.position.y = 1.48;
                group.add(crownRing);

                const dome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), mat);
                dome.scale.set(1, 0.9, 1);
                dome.position.y = 1.62;
                dome.castShadow = true;
                group.add(dome);

                // Royal Cross
                const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), goldTrimMat);
                crossVert.position.y = 1.96;
                group.add(crossVert);

                const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), goldTrimMat);
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

    // Update board state, pieces, and high-visual feedback markers
    render(engine, highlights = {}) {
        this.selectedSquare = highlights.selected || null;
        this.legalMoves = highlights.legalMoves || [];
        this.lastMove = highlights.lastMove || null;
        this.inCheckSquare = highlights.checkSquare || null;

        // 1. Reset square highlights
        Object.keys(this.squareMeshes).forEach(sq => {
            const sqMesh = this.squareMeshes[sq];
            sqMesh.material.color.copy(sqMesh.userData.baseColor);
            sqMesh.material.emissive.setHex(0x000000);
        });

        // 2. Clear old legal move marker discs
        this.markerMeshes.forEach(m => this.scene.remove(m));
        this.markerMeshes = [];

        // 3. Highlight Last Move (Soft Cyan Glow)
        if (this.lastMove) {
            [this.lastMove.from, this.lastMove.to].forEach(sq => {
                const sqMesh = this.squareMeshes[sq];
                if (sqMesh) {
                    sqMesh.material.emissive.setHex(0x004060);
                }
            });
        }

        // 4. Highlight Selected Square (Golden Amber Glow)
        if (this.selectedSquare && this.squareMeshes[this.selectedSquare]) {
            this.squareMeshes[this.selectedSquare].material.emissive.setHex(0x664400);
        }

        // 5. Highlight King in Check (Pulsing Crimson Glow)
        if (this.inCheckSquare && this.squareMeshes[this.inCheckSquare]) {
            this.squareMeshes[this.inCheckSquare].material.emissive.setHex(0x881111);
        }

        // 6. Draw Legal Move Discs on Board
        const markerMatMove = new THREE.MeshBasicMaterial({
            color: 0xd4af37,
            transparent: true,
            opacity: 0.55
        });
        const markerMatCapture = new THREE.MeshBasicMaterial({
            color: 0xff3355,
            transparent: true,
            opacity: 0.65
        });

        this.legalMoves.forEach(m => {
            const targetSq = this.squareMeshes[m.to];
            if (!targetSq) return;

            let markerMesh;
            if (m.captured) {
                // Outer ring for captures
                markerMesh = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 24), markerMatCapture);
            } else {
                // Disc for standard moves
                markerMesh = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), markerMatMove);
            }

            markerMesh.rotation.x = -Math.PI / 2;
            markerMesh.position.set(targetSq.position.x, 0.06, targetSq.position.z);
            this.scene.add(markerMesh);
            this.markerMeshes.push(markerMesh);
        });

        // 7. Update Piece Meshes on Board
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

        // Remove old piece meshes that changed or no longer exist
        Object.keys(this.pieceMeshes).forEach(sq => {
            const current = currentPiecesBySquare[sq];
            const existing = this.pieceMeshes[sq];
            if (!current || existing.userData.type !== current.type || existing.userData.color !== current.color) {
                this.scene.remove(existing);
                delete this.pieceMeshes[sq];
            }
        });

        // Create or reposition meshes
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
                // Snap directly unless animating
                if (!mesh.userData.isAnimating) {
                    mesh.position.set(targetSqMesh.position.x, 0.05, targetSqMesh.position.z);
                }
            }
        });
    }

    // Smooth piece move parabolic arc animation
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
            duration: 0.28, // 280ms swift royal movement
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

        // Raycast against squares
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

        // Animate floating castle particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += 0.015;
                if (positions[i] > 16) {
                    positions[i] = 0;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate piece movement arcs
        if (this.animatingPieces.length > 0) {
            const dt = 0.016; // approximate delta time
            for (let i = this.animatingPieces.length - 1; i >= 0; i--) {
                const anim = this.animatingPieces[i];
                anim.progress += dt / anim.duration;

                if (anim.progress >= 1) {
                    anim.mesh.position.copy(anim.endPos);
                    this.animatingPieces.splice(i, 1);
                    anim.onComplete();
                } else {
                    const t = anim.progress;
                    // Horizontal linear lerp
                    anim.mesh.position.x = THREE.MathUtils.lerp(anim.startPos.x, anim.endPos.x, t);
                    anim.mesh.position.z = THREE.MathUtils.lerp(anim.startPos.z, anim.endPos.z, t);
                    // Parabolic arc height
                    const arcHeight = 1.1;
                    anim.mesh.position.y = 0.05 + Math.sin(t * Math.PI) * arcHeight;
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
