/* ================================================
   THREE.JS 3D BACKGROUND
   Animated geometric shapes with blue glow
   ================================================ */

class ThreeBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.shapes = [];
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        
        this.init();
        this.createShapes();
        this.addLights();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('bg-canvas'),
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    createShapes() {
        // Material with blue glow effect
        const material = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            emissive: 0x1e40af,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.6,
            shininess: 100,
            side: THREE.DoubleSide
        });
        
        // Darker material for variety
        const darkMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e40af,
            emissive: 0x0f172a,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.4,
            shininess: 80,
            side: THREE.DoubleSide
        });
        
        // Wireframe material
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        
        // Geometries
        const geometries = [
            new THREE.IcosahedronGeometry(1.5, 0),
            new THREE.OctahedronGeometry(1.2, 0),
            new THREE.TorusGeometry(1, 0.4, 8, 24),
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            new THREE.TetrahedronGeometry(1.3, 0),
            new THREE.DodecahedronGeometry(1.2, 0)
        ];
        
        const materials = [material, darkMaterial, wireMaterial];
        
        // Create 12 scattered shapes
        for (let i = 0; i < 12; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = materials[Math.floor(Math.random() * materials.length)];
            
            const mesh = new THREE.Mesh(geometry, mat.clone());
            
            // Random position (scattered)
            mesh.position.x = (Math.random() - 0.5) * 50;
            mesh.position.y = (Math.random() - 0.5) * 40;
            mesh.position.z = (Math.random() - 0.5) * 20 - 10;
            
            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            
            // Random scale (larger shapes)
            const scale = 0.8 + Math.random() * 1.2;
            mesh.scale.set(scale, scale, scale);
            
            // Store rotation speeds
            mesh.userData = {
                rotationSpeedX: (Math.random() - 0.5) * 0.003,
                rotationSpeedY: (Math.random() - 0.5) * 0.003,
                rotationSpeedZ: (Math.random() - 0.5) * 0.002,
                floatSpeed: 0.0005 + Math.random() * 0.001,
                floatOffset: Math.random() * Math.PI * 2,
                originalY: mesh.position.y
            };
            
            this.shapes.push(mesh);
            this.scene.add(mesh);
        }
    }
    
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x1e3a5f, 0.5);
        this.scene.add(ambientLight);
        
        // Main blue point light
        const pointLight1 = new THREE.PointLight(0x3b82f6, 1, 100);
        pointLight1.position.set(10, 10, 20);
        this.scene.add(pointLight1);
        
        // Secondary darker blue light
        const pointLight2 = new THREE.PointLight(0x1e40af, 0.8, 100);
        pointLight2.position.set(-15, -10, 15);
        this.scene.add(pointLight2);
        
        // Subtle white highlight
        const pointLight3 = new THREE.PointLight(0xffffff, 0.3, 50);
        pointLight3.position.set(0, 20, 10);
        this.scene.add(pointLight3);
    }
    
    setupEventListeners() {
        // Mouse move
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Smooth mouse follow
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.02;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.02;
        
        // Animate shapes
        this.shapes.forEach((shape) => {
            // Continuous rotation
            shape.rotation.x += shape.userData.rotationSpeedX;
            shape.rotation.y += shape.userData.rotationSpeedY;
            shape.rotation.z += shape.userData.rotationSpeedZ;
            
            // Floating motion
            shape.position.y = shape.userData.originalY + 
                Math.sin(time * shape.userData.floatSpeed * 100 + shape.userData.floatOffset) * 0.5;
            
            // Subtle mouse influence
            shape.position.x += this.mouse.x * 0.01;
            shape.position.y += this.mouse.y * 0.01;
        });
        
        // Camera subtle movement
        this.camera.position.x = this.mouse.x * 2;
        this.camera.position.y = this.mouse.y * 1;
        this.camera.lookAt(this.scene.position);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ThreeBackground();
});
