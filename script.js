 
let scene, camera, renderer, particles, stars, raycaster, mouse, clock;
let composer, bloomPass, glitchPass, orbs = [];
let mainScene, mainCamera, sceneRenderer;
let projectModels = {};
let currentSection = 0;
let isAnimating = false;
let currentProject = 0;
let isScrollEnabled = true;  

function initThree() {
    try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
            alpha: true,
            antialias: true
        });
        
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.z = 30;

         
        const ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x00ff9d, 2);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

         
        if (typeof EffectComposer !== 'undefined') {
            composer = new EffectComposer(renderer);
            const renderPass = new RenderPass(scene, camera);
            composer.addPass(renderPass);

            if (typeof UnrealBloomPass !== 'undefined') {
                const bloomPass = new UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    0.5,
                    0.4,
                    0.85
                );
                composer.addPass(bloomPass);
            }

            if (typeof GlitchPass !== 'undefined') {
                glitchPass = new GlitchPass();
                glitchPass.enabled = false;
                composer.addPass(glitchPass);
            }
        }
        
         
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCnt = 5000;  
        const posArray = new Float32Array(particlesCnt * 3);
        
        for(let i = 0; i < particlesCnt * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.01,
            color: '#00ff9d',
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

         
        stars = createStars();
        scene.add(stars);
        
         
        for (let i = 0; i < 15; i++) {
            createEnhancedOrb();
        }

         
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        
         
        clock = new THREE.Clock();

        console.log("Three.js initialized successfully");
    } catch (error) {
        console.warn('Three.js initialization error:', error);
        handleThreeJSError();
    }
}

function createEnhancedOrb() {
    const geometry = new THREE.SphereGeometry(Math.random() * 0.7 + 0.2, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(`hsl(${Math.random() * 60 + 120}, 100%, 60%)`),
        emissive: new THREE.Color(`hsl(${Math.random() * 60 + 120}, 100%, 40%)`),
        transparent: true,
        opacity: 0.9,
        shininess: 200
    });
    
    const orb = new THREE.Mesh(geometry, material);
    orb.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
    );
    
    orb.userData = {
        speed: Math.random() * 0.07 + 0.02,
        rotSpeed: Math.random() * 0.03 + 0.01,
        targetScale: 1,
        originalScale: 1,
        pulseSpeed: Math.random() * 0.5 + 0.5
    };
    
    scene.add(orb);
    orbs.push(orb);
}

function createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        vertices.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: Math.random(),
        blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
}

function initMainScene() {
     
    mainScene = new THREE.Scene();
    mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
     
    sceneRenderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('scene-container'),
        alpha: true,
        antialias: true
    });
    
    sceneRenderer.setPixelRatio(window.devicePixelRatio);
    sceneRenderer.setSize(window.innerWidth, window.innerHeight);
    sceneRenderer.setClearColor(0x000000, 0);
    sceneRenderer.outputEncoding = THREE.sRGBEncoding;
    
     
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    mainScene.add(ambLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 1, 1);
    mainScene.add(dirLight);
    
     
    initProjectModels();
}

function initProjectModels() {
     
     
     
    
     
    const lytextGroup = new THREE.Group();
    
     
    const docGeometry = new THREE.BoxGeometry(4, 5, 0.2);
    const docMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });
    const document = new THREE.Mesh(docGeometry, docMaterial);
    lytextGroup.add(document);
    
     
    const lineGeometry = new THREE.BoxGeometry(3, 0.2, 0.1);
    const lineMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff9d });
    
    for (let i = 0; i < 5; i++) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.y = 1.5 - i * 0.6;
        line.position.z = 0.2;
        
         
        line.scale.x = 0.5 + Math.random() * 0.5;
        lytextGroup.add(line);
    }
    
     
    lytextGroup.position.set(0, 0, -5);
    lytextGroup.rotation.set(-0.2, 0.3, 0);
    mainScene.add(lytextGroup);
    projectModels.lytext = lytextGroup;
    
     
    const calculatorGroup = new THREE.Group();
    
     
    const calcGeometry = new THREE.BoxGeometry(4, 6, 0.5);
    const calcMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.9
    });
    const calcBase = new THREE.Mesh(calcGeometry, calcMaterial);
    calculatorGroup.add(calcBase);
    
     
    const screenGeometry = new THREE.BoxGeometry(3.5, 1.5, 0.1);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff9d,
        emissive: 0x00ff9d,
        emissiveIntensity: 0.5
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 2, 0.3);
    calculatorGroup.add(screen);
    
     
    const buttonGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    
    const buttonLayout = [
        ['I', 'V', 'X'],
        ['L', 'C', 'D'],
        ['+', '-', 'x'],
        ['÷', '=', 'M']
    ];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(j * 1.1 - 1.1, 0.8 - i * 1.1, 0.3);
            calculatorGroup.add(button);
        }
    }
    
     
    calculatorGroup.position.set(0, 0, -5);
    calculatorGroup.rotation.set(-0.2, -0.3, 0);
    calculatorGroup.visible = false;
    mainScene.add(calculatorGroup);
    projectModels.calculator = calculatorGroup;
    
     
    const asciiGroup = new THREE.Group();
    
     
    const terminalGeometry = new THREE.BoxGeometry(5, 3.5, 0.2);
    const terminalMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x111111
    });
    const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
    asciiGroup.add(terminal);
    
     
    const asciiScreenGeometry = new THREE.PlaneGeometry(4.5, 3);
    const asciiScreenMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000
    });
    const asciiScreen = new THREE.Mesh(asciiScreenGeometry, asciiScreenMaterial);
    asciiScreen.position.z = 0.11;
    asciiGroup.add(asciiScreen);
    
     
    const dotGeometry = new THREE.CircleGeometry(0.05, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff9d });
    
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 25; j++) {
            if (Math.random() > 0.5) {  
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.set(j * 0.18 - 2.2, i * 0.18 - 1.3, 0.12);
                asciiGroup.add(dot);
            }
        }
    }
    
     
    asciiGroup.position.set(0, 0, -5);
    asciiGroup.rotation.set(0, 0.2, 0);
    asciiGroup.visible = false;
    mainScene.add(asciiGroup);
    projectModels.ascii = asciiGroup;
    
     
    const pompodGroup = new THREE.Group();
    
     
    const podGeometry = new THREE.SphereGeometry(2, 32, 32);
    const podMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff6b6b,
        shininess: 100
    });
    const pod = new THREE.Mesh(podGeometry, podMaterial);
    pompodGroup.add(pod);
    
     
    const podScreenGeometry = new THREE.CircleGeometry(1, 32);
    const podScreenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222,
        emissive: 0x111111
    });
    const podScreen = new THREE.Mesh(podScreenGeometry, podScreenMaterial);
    podScreen.position.z = 1.9;
    pompodGroup.add(podScreen);
    
     
    const wheelGeometry = new THREE.RingGeometry(0.8, 1.2, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xdddddd,
        side: THREE.DoubleSide
    });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.z = 2;
    pompodGroup.add(wheel);
    
     
    pompodGroup.position.set(0, 0, -5);
    pompodGroup.rotation.set(0, 0, 0);
    pompodGroup.visible = false;
    mainScene.add(pompodGroup);
    projectModels.pompod = pompodGroup;
    
     
    const consoleGroup = new THREE.Group();
    
     
    const consoleBaseGeometry = new THREE.BoxGeometry(5, 3, 1);
    const consoleBaseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333
    });
    const consoleBase = new THREE.Mesh(consoleBaseGeometry, consoleBaseMaterial);
    consoleGroup.add(consoleBase);
    
     
    const consoleScreenGeometry = new THREE.PlaneGeometry(4, 2.2);
    const consoleScreenMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000
    });
    const consoleScreen = new THREE.Mesh(consoleScreenGeometry, consoleScreenMaterial);
    consoleScreen.position.z = 0.51;
    consoleGroup.add(consoleScreen);
    
     
    const buttonColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    
    for (let i = 0; i < 4; i++) {
        const controlBtnGeometry = new THREE.CircleGeometry(0.2, 16);
        const controlBtnMaterial = new THREE.MeshPhongMaterial({ 
            color: buttonColors[i],
            emissive: buttonColors[i],
            emissiveIntensity: 0.3
        });
        const controlBtn = new THREE.Mesh(controlBtnGeometry, controlBtnMaterial);
        
         
        controlBtn.position.set(i * 0.6 - 0.9, -1, 0.51);
        consoleGroup.add(controlBtn);
    }
    
     
    consoleGroup.position.set(0, 0, -5);
    consoleGroup.rotation.set(-0.3, 0.1, 0);
    consoleGroup.visible = false;
    mainScene.add(consoleGroup);
    projectModels.console = consoleGroup;
}

function animate() {
    requestAnimationFrame(animate);
    
    try {
        if (!clock || !particles || document.visibilityState !== 'visible') return;
        
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
         
        if (particles) {
            particles.rotation.x += 0.0001;
            particles.rotation.y += 0.0001;
        }
        
         
        if (stars) {
            stars.rotation.x += 0.0002;
            stars.rotation.y += 0.0003;
        }
        
         
        if (orbs) {
            orbs.forEach(orb => {
                if (orb && orb.position && orb.userData) {
                    orb.rotation.x += orb.userData.rotSpeed || 0.01;
                    orb.rotation.y += (orb.userData.rotSpeed || 0.01) * 1.3;
                    
                     
                    orb.position.y += Math.sin(elapsedTime * (orb.userData.speed || 0.5)) * 0.02;
                    orb.position.x += Math.cos(elapsedTime * (orb.userData.speed || 0.5) * 0.7) * 0.02;
                    orb.position.z += Math.sin(elapsedTime * (orb.userData.speed || 0.5) * 0.3) * 0.01;
                    
                     
                    const pulseScale = 1 + 0.2 * Math.sin(elapsedTime * (orb.userData.pulseSpeed || 1));
                    orb.scale.set(pulseScale, pulseScale, pulseScale);
                    
                     
                    if (orb.material && Math.random() > 0.99) {
                        const hue = (120 + 60 * Math.sin(elapsedTime * 0.1)) % 360;
                        orb.material.emissive = new THREE.Color(`hsl(${hue}, 100%, 40%)`);
                    }
                }
            });
        }
        
         
        if (composer) {
            composer.render();
        }
        
        if (sceneRenderer && mainScene && mainCamera) {
            sceneRenderer.render(mainScene, mainCamera);
        }
        
    } catch (error) {
        console.error("Error in animate:", error);
        handleThreeJSError();
    }
}

function handleThreeJSError() {
     
    const canvas = document.querySelector('#bg');
    const sceneContainer = document.getElementById('scene-container');
    
    if (canvas) canvas.style.display = 'none';
    if (sceneContainer) sceneContainer.style.display = 'none';
    
    document.body.style.background = 'var(--background)';
    document.body.classList.add('fallback-mode');
}

 
function initSectionNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const progressIndicator = document.getElementById('progress-indicator');
    let isScrolling = false;
    let scrollTimeout;
    let lastScrollTime = Date.now();
    const scrollCooldown = 600;  
    
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (!isAnimating) {
                navigateToSection(index);
            }
        });
    });

     
    window.addEventListener('wheel', (e) => {
        e.preventDefault();  
        
        if (!isScrollEnabled) return;  
        
        const now = Date.now();
        if (isAnimating || now - lastScrollTime < scrollCooldown) return;
        
        lastScrollTime = now;
        isScrollEnabled = false;  

         
        if (e.deltaY > 0 && currentSection < sections.length - 1) {
            navigateToSection(currentSection + 1);
        } else if (e.deltaY < 0 && currentSection > 0) {
            navigateToSection(currentSection - 1);
        }
        
         
        setTimeout(() => {
            isScrollEnabled = true;
        }, scrollCooldown);
    }, { passive: false });

     
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (isAnimating || !isScrollEnabled) return;

        touchEndY = e.changedTouches[0].clientY;
        const touchDiff = touchStartY - touchEndY;
        
        if (Math.abs(touchDiff) > 50) {  
            isScrollEnabled = false;  
            
            if (touchDiff > 0 && currentSection < sections.length - 1) {
                navigateToSection(currentSection + 1);
            } else if (touchDiff < 0 && currentSection > 0) {
                navigateToSection(currentSection - 1);
            }
            
             
            setTimeout(() => {
                isScrollEnabled = true;
            }, scrollCooldown);
        }
    }, { passive: true });

     
    window.addEventListener('keydown', (e) => {
        if (!isAnimating) {
            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                case ' ':
                    if (currentSection < sections.length - 1) {
                        e.preventDefault();
                        navigateToSection(currentSection + 1);
                    }
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    if (currentSection > 0) {
                        e.preventDefault();
                        navigateToSection(currentSection - 1);
                    }
                    break;
            }
        }
    });
}

function navigateToSection(index) {
    if (isAnimating || index === currentSection) return;
    
    isAnimating = true;
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const progressIndicator = document.getElementById('progress-indicator');
    
     
    sections.forEach(section => {
        section.classList.remove('section-transition-out', 'section-transition-in');
    });
    
     
    sections[currentSection].classList.add('section-transition-out');
    sections[index].classList.add('section-transition-in');
    
     
    navItems.forEach(item => item.classList.remove('active'));
    navItems[index].classList.add('active');
    
     
    progressIndicator.style.width = `${(index / (sections.length - 1)) * 100}%`;
    
     
    triggerGlitch();
    
     
    setTimeout(() => {
        sections[currentSection].classList.remove('active');
        sections[index].classList.add('active');
        
         
        currentSection = index;
        
         
        sections.forEach(section => {
            section.classList.remove('section-transition-out', 'section-transition-in');
        });
        
         
        setTimeout(() => {
            isAnimating = false;
        }, 300); 
    }, 900);  
}

 
function initProjectNavigation() {
    const nextBtn = document.querySelector('.project-nav-button.next');
    const prevBtn = document.querySelector('.project-nav-button.prev');
    const indicators = document.querySelectorAll('.project-indicator');
    const projects = document.querySelectorAll('.project-item');
    const projectShowcase = document.querySelector('.project-showcases');
    
     
    let touchStartX = 0;
    let touchEndX = 0;
    
    projectShowcase.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    projectShowcase.addEventListener('touchend', (e) => {
        if (isAnimating) return;
        
        touchEndX = e.changedTouches[0].screenX;
        const touchDiff = touchStartX - touchEndX;
        
         
        if (Math.abs(touchDiff) < 50) return;
        
        if (touchDiff > 0) {
             
            const nextIndex = (currentProject + 1) % projects.length;
            navigateToProject(nextIndex);
        } else if (touchDiff < 0) {
             
            const prevIndex = (currentProject - 1 + projects.length) % projects.length;
            navigateToProject(prevIndex);
        }
    }, { passive: true });
    
     
    nextBtn.addEventListener('click', () => {
        if (isAnimating) return;
        
        const nextIndex = (currentProject + 1) % projects.length;
        navigateToProject(nextIndex);
    });
    
     
    prevBtn.addEventListener('click', () => {
        if (isAnimating) return;
        
        const prevIndex = (currentProject - 1 + projects.length) % projects.length;
        navigateToProject(prevIndex);
    });
    
     
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (currentProject !== index && !isAnimating) {
                navigateToProject(index);
            }
        });
    });
}

function navigateToProject(index) {
    if (isAnimating) return;
    isAnimating = true;
    
    const projects = document.querySelectorAll('.project-item');
    const indicators = document.querySelectorAll('.project-indicator');
    
     
    projects.forEach(project => {
        project.classList.remove('active');
        gsap.to(project, { opacity: 0, duration: 0.5 });
    });
    
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
     
    setTimeout(() => {
        projects[index].classList.add('active');
        gsap.to(projects[index], { 
            opacity: 1, 
            duration: 0.8,
            onComplete: () => {
                isAnimating = false;
            }
        });
        
         
        showProjectModel(index);
        
         
        currentProject = index;
        
         
        indicators[currentProject].classList.add('active');
    }, 500);
    
     
    triggerGlitch();
}

function showProjectModel(index) {
     
    for (const key in projectModels) {
        projectModels[key].visible = false;
    }
    
     
    const projectItems = document.querySelectorAll('.project-item');
    const projectKey = projectItems[index].getAttribute('data-project');
    
     
    if (projectModels[projectKey]) {
        projectModels[projectKey].visible = true;
        
         
        projectModels[projectKey].scale.set(0.1, 0.1, 0.1);
        gsap.to(projectModels[projectKey].scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "elastic.out(1, 0.5)"
        });
        
         
        gsap.to(projectModels[projectKey].rotation, {
            y: Math.PI * 2,
            duration: 1.5,
            ease: "power2.out"
        });
    }
}

 
function typeWriter(text, element, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

 
function initCursorEffects() {
    document.addEventListener('mousemove', (e) => {
         
        const cursor3D = new THREE.Vector3(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        
        cursor3D.unproject(camera);
        const dir = cursor3D.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        
         
        const cursorLight = new THREE.PointLight(0x00ff9d, 1, 5);
        cursorLight.position.copy(pos);
        scene.add(cursorLight);
        
         
        setTimeout(() => {
            scene.remove(cursorLight);
        }, 500);
    });
}

 
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    document.body.appendChild(particle);
    
     
    const size = Math.random() * 15 + 5;
    const duration = Math.random() * 1 + 0.5;
    const color = Math.random() > 0.5 ? 'var(--primary)' : 'var(--secondary)';
    
     
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
     
    gsap.to(particle, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        opacity: 1,
        duration: 0.2,
        ease: "power1.out",
        onComplete: () => {
            gsap.to(particle, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                opacity: 0,
                duration: duration,
                ease: "power1.in",
                onComplete: () => {
                    document.body.removeChild(particle);
                }
            });
        }
    });
}

function initParticleEffects() {
     
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createParticle(e.clientX, e.clientY);
            }, i * 10);
        }
    });
    
     
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const rect = item.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createParticle(x, y);
                }, i * 100);
            }
        });
    });
}

 
function enhancedLoadingAnimation() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loader = document.querySelector('.loader');
    const loadingText = document.querySelector('.loading-text');
    
    gsap.to(loader, {
        rotation: 720,
        duration: 2,
        repeat: -1,
        ease: "power2.inOut"
    });
    
    gsap.to(loadingText, {
        opacity: 0.5,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });
    
     
    for (let i = 0; i < 20; i++) {  
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            loadingScreen.appendChild(particle);
            
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
            const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            gsap.to(particle, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                opacity: 1,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, i * 150);
    }
}

 
function initTerminalTyping() {
    const terminalLines = document.querySelectorAll('.terminal-line');
    const terminalTexts = document.querySelectorAll('.terminal-text');
    
     
    terminalTexts.forEach((text, index) => {
        setTimeout(() => {
            text.style.width = '100%';
        }, index * 1000);
    });
    
     
    const terminalBody = document.querySelector('.terminal-body');
    const commands = {
        'help': 'Available commands: help, about, skills, projects, contact, clear, social',
        'about': 'Just a Teen messing around with computers.',
        'skills': 'HTML, CSS, JavaScript, Python, React, Node.js, and more!',
        'projects': 'Check out my projects at  github.com/heyaryx',
        'contact': 'Reach me on Instagram @heyaryx or YouTube @heyaryx',
        'social': 'GitHub:  github.com/heyaryx\nWebsite: heyaryx.github.io/heyaryx\nInstagram: heyaryx\nYouTube: @heyaryx',
        'clear': 'CLEAR_TERMINAL'
    };
    
     
    function createNewInputLine() {
        const newLine = document.createElement('div');
        newLine.className = 'terminal-line';
        newLine.innerHTML = `$ <span class="terminal-input" contenteditable="true"></span><span class="terminal-cursor">█</span>`;
        terminalBody.appendChild(newLine);
        
        const newInput = newLine.querySelector('.terminal-input');
        newInput.focus();
        terminalBody.scrollTop = terminalBody.scrollHeight;
        
        return newInput;
    }
    
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('contact-section').classList.contains('active')) {
            const lastLine = terminalBody.lastElementChild;
            const input = lastLine.querySelector('.terminal-input');
            
            if (input) {
                 
                input.focus();
                
                if (e.key === 'Enter') {
                     
                    const command = input.textContent.trim().toLowerCase();
                    
                     
                    input.setAttribute('contenteditable', 'false');
                    input.style.display = 'inline-block';
                    
                     
                    if (command in commands) {
                        if (commands[command] === 'CLEAR_TERMINAL') {
                             
                            terminalBody.innerHTML = '';
                            
                             
                            const initialMessages = [
                                "Hey there! I'm Aryx.",
                                "Let's create something awesome together.",
                                "Type 'help' for available commands."
                            ];
                            
                            initialMessages.forEach(msg => {
                                const msgLine = document.createElement('div');
                                msgLine.className = 'terminal-line';
                                msgLine.innerHTML = `$ <span class="terminal-text">${msg}</span>`;
                                terminalBody.appendChild(msgLine);
                            });
                        } else {
                            const resultLine = document.createElement('div');
                            resultLine.className = 'terminal-line';
                            resultLine.innerHTML = `<span class="terminal-output">${commands[command].replace(/\n/g, '<br>')}</span>`;
                            
                            terminalBody.appendChild(resultLine);
                        }
                    } else if (command !== '') {
                         
                        const resultLine = document.createElement('div');
                        resultLine.className = 'terminal-line';
                        resultLine.innerHTML = `<span class="terminal-output">Command not found: ${command}. Type 'help' for available commands.</span>`;
                        
                        terminalBody.appendChild(resultLine);
                    }
                    
                     
                    setTimeout(() => {
                        createNewInputLine();
                        terminalBody.scrollTop = terminalBody.scrollHeight;
                    }, 50);
                }
            } else {
                 
                createNewInputLine();
            }
        }
    });
    
     
    document.getElementById('contact-section').addEventListener('transitionend', () => {
        if (document.getElementById('contact-section').classList.contains('active')) {
            const lastLine = terminalBody.lastElementChild;
            const input = lastLine.querySelector('.terminal-input');
            if (input) {
                setTimeout(() => input.focus(), 200);
            } else {
                setTimeout(() => createNewInputLine(), 200);
            }
        }
    });
}

function triggerGlitch() {
    if (glitchPass) {
        glitchPass.enabled = true;
        setTimeout(() => {
            glitchPass.enabled = false;
        }, 1000);
    }
    
     
    const glitchContainer = document.createElement('div');
    glitchContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 255, 157, 0.1);
        z-index: 999;
        pointer-events: none;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(glitchContainer);
    
     
    gsap.to(glitchContainer, {
        opacity: 0,
        duration: 0.2,
        ease: "steps(3)",
        repeat: 3,
        yoyo: true,
        onComplete: () => {
            document.body.removeChild(glitchContainer);
        }
    });
    
     
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const originalTransform = section.style.transform || '';
        gsap.to(section, {
            x: `${(Math.random() - 0.5) * 20}px`,
            y: `${(Math.random() - 0.5) * 20}px`,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: "steps(2)",
            onComplete: () => {
                section.style.transform = originalTransform;
            }
        });
    });
}

function initCodeEditor(preview) {
    const editorContent = preview.querySelector('.editor-content');
    if (!editorContent) return;
    
     
    function highlightSyntax() {
        let content = editorContent.innerText;
        
         
        content = content.replace(/\b(function|const|let|var|if|else|for|while|return)\b/g, '<span style="color: #569CD6;">$1</span>');
        
         
        content = content.replace(/"([^"]*)"/g, '<span style="color: #CE9178;">\"$1\"</span>');
        
         
        content = content.replace(/\b(\d+)\b/g, '<span style="color: #B5CEA8;">$1</span>');
        
         
        content = content.replace(/(\/\/.*)/g, '<span style="color: #6A9955;">$1</span>');
        
        editorContent.innerHTML = content;
    }
    
     
    highlightSyntax();
    
    let lastCursorPosition = 0;
    
     
    editorContent.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '\n');
            return false;
        }
    });
    
    editorContent.addEventListener('input', function() {
         
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        lastCursorPosition = range.startOffset;
        
         
        requestAnimationFrame(() => {
            const currentText = editorContent.innerText;
            highlightSyntax();
            
             
            try {
                const textNodes = [];
                const findTextNodes = (element) => {
                    if (element.nodeType === Node.TEXT_NODE) {
                        textNodes.push(element);
                    } else {
                        for (const child of element.childNodes) {
                            findTextNodes(child);
                        }
                    }
                };
                
                findTextNodes(editorContent);
                
                let currentLength = 0;
                let targetNode, targetOffset;
                
                for (const node of textNodes) {
                    if (currentLength + node.length >= lastCursorPosition) {
                        targetNode = node;
                        targetOffset = lastCursorPosition - currentLength;
                        break;
                    }
                    currentLength += node.length;
                }
                
                if (targetNode) {
                    const newRange = document.createRange();
                    newRange.setStart(targetNode, Math.min(targetOffset, targetNode.length));
                    newRange.collapse(true);
                    
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            } catch (e) {
                console.log("Error restoring cursor", e);
            }
        });
    });
}

function initAsciiConverter(preview) {
    const output = preview.querySelector('.ascii-output');
    const convertBtn = preview.querySelector('.ascii-convert-btn');
    
    const asciiArts = [
        `
 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 ░░░░░░░  ARYX STUDIOS  ░░░░░░░
 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      ╔═══════════════╗
      ║ ASCII PREVIEW ║
      ╚═══════════════╝
        ▄▄▄▄▄▄▄▄▄▄
      ▄█████████████▄
     ████▄██████▄████
     ████████████████
     ████████████████
      ▀█████████████▀
        ▀▀▀▀▀▀▀▀▀▀

 Converting images to ASCII art...
 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
         
    ];
    
    let currentArt = 0;
    
    convertBtn.addEventListener('click', function() {
        output.innerHTML = "Processing...";
        
        setTimeout(() => {
            currentArt = (currentArt + 1) % asciiArts.length;
            output.innerHTML = asciiArts[currentArt].replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
            
             
            output.style.opacity = '0';
            setTimeout(() => {
                output.style.opacity = '1';
            }, 100);
        }, 800);
    });
}

function initMusicPlayer(preview) {
    const progressFill = preview.querySelector('.progress-fill');
    const timeDisplay = preview.querySelector('.time-display');
    const playBtn = preview.querySelector('.control-btn.play');
    const prevBtn = preview.querySelector('.control-btn.prev');
    const nextBtn = preview.querySelector('.control-btn.next');
    const trackTitle = preview.querySelector('.track-title');
    const trackArtist = preview.querySelector('.track-artist');
    
    if (!progressFill || !playBtn) return;
    
     
    const tracks = [
        { title: "Synthwave Nights", artist: "Aryx", duration: "3:45" },
        { title: "Neon Dreams", artist: "Aryx ft. Pixel", duration: "4:22" },
        { title: "Retrowave Runner", artist: "Aryx", duration: "3:18" }
    ];
    
    let isPlaying = false;
    let currentTrack = 0;
    let progressInterval;
    let audio = new Audio();
    
     
    function setupAudio() {
         
         
        audio.duration = convertToSeconds(tracks[currentTrack].duration);
        audio.currentTime = 0;
        audio.paused = true;
    }
    
    function convertToSeconds(timeString) {
        const parts = timeString.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    
     
    function updateTrackInfo() {
        trackTitle.textContent = tracks[currentTrack].title;
        trackArtist.textContent = tracks[currentTrack].artist;
        timeDisplay.textContent = `0:00 / ${tracks[currentTrack].duration}`;
        progressFill.style.width = "0%";
        setupAudio();
    }
    
     
    function updateProgress() {
        if (!isPlaying) return;
        
        const currentWidth = parseFloat(progressFill.style.width) || 0;
        if (currentWidth >= 100) {
            nextBtn.click();
            return;
        }
        
        progressFill.style.width = `${currentWidth + 0.1}%`;
        
         
        const duration = convertToSeconds(tracks[currentTrack].duration);
        const currentTime = (currentWidth / 100) * duration;
        const currentMinutes = Math.floor(currentTime / 60);
        const currentSeconds = Math.floor(currentTime % 60);
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${tracks[currentTrack].duration}`;
        
        requestAnimationFrame(updateProgress);
    }

    playBtn.addEventListener('click', function() {
        if (isPlaying) {
            playBtn.innerHTML = "▶";
            isPlaying = false;
        } else {
            playBtn.innerHTML = "⏸";
            isPlaying = true;
            requestAnimationFrame(updateProgress);
        }
    });
    
     
    prevBtn.addEventListener('click', function() {
        clearInterval(progressInterval);
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        updateTrackInfo();
        
        if (isPlaying) {
            playBtn.click();
        }
    });
    
     
    nextBtn.addEventListener('click', function() {
        clearInterval(progressInterval);
        currentTrack = (currentTrack + 1) % tracks.length;
        updateTrackInfo();
        
        if (isPlaying) {
            playBtn.click();
        }
    });
    
     
    updateTrackInfo();
}

function initRetroGame(preview) {
    const gameScreen = preview.querySelector('.game-screen');
    const upBtn = preview.querySelector('.game-btn:nth-child(1)');
    const leftBtn = preview.querySelector('.game-btn:nth-child(2)');
    const rightBtn = preview.querySelector('.game-btn:nth-child(3)');
    const downBtn = preview.querySelector('.game-btn:nth-child(4)');
    
    if (!gameScreen) return;
    
     
    gameScreen.innerHTML = '';
    
     
    const bird = document.createElement('div');
    bird.style.cssText = `
        position: absolute;
        left: 50px;
        top: 100px;
        width: 30px;
        height: 30px;
        background-color: yellow;
        border-radius: 50% 50% 20% 20%;
        z-index: 10;
        transition: transform 0.1s;
    `;
    
     
    const eye = document.createElement('div');
    eye.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: black;
        border-radius: 50%;
        top: 8px;
        right: 5px;
    `;
    
    const beak = document.createElement('div');
    beak.style.cssText = `
        position: absolute;
        width: 15px;
        height: 10px;
        background-color: orange;
        top: 15px;
        right: -10px;
        clip-path: polygon(0 0, 100% 50%, 0 100%);
    `;
    
    bird.appendChild(eye);
    bird.appendChild(beak);
    gameScreen.appendChild(bird);
    
     
    let birdY = 100;
    let birdVelocity = 0;
    let gravity = 0.5;
    let gameRunning = false;
    let score = 0;
    let pipes = [];
    let animationId;
    
     
    const scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        color: white;
        font-size: 16px;
        z-index: 20;
    `;
    scoreDisplay.textContent = 'Score: 0';
    gameScreen.appendChild(scoreDisplay);
    
     
    const startMessage = document.createElement('div');
    startMessage.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 14px;
        text-align: center;
        z-index: 20;
    `;
    startMessage.textContent = 'Press UP to start';
    gameScreen.appendChild(startMessage);
    
     
    function createPipe() {
        const gap = 80;
        const pipeTop = document.createElement('div');
        const pipeBottom = document.createElement('div');
        
         
        const topHeight = Math.floor(Math.random() * 80) + 20;
        
        pipeTop.style.cssText = `
            position: absolute;
            width: 30px;
            height: ${topHeight}px;
            right: 0;
            top: 0;
            background-color: green;
            border: 2px solid white;
            border-bottom: none;
        `;
        
        pipeBottom.style.cssText = `
            position: absolute;
            width: 30px;
            right: 0;
            top: ${topHeight + gap}px;
            bottom: 0;
            background-color: green;
            border: 2px solid white;
            border-top: none;
        `;
        
        gameScreen.appendChild(pipeTop);
        gameScreen.appendChild(pipeBottom);
        
        pipes.push({
            top: pipeTop,
            bottom: pipeBottom,
            x: gameScreen.clientWidth,
            passed: false
        });
    }
    
     
    function gameLoop() {
        if (!gameRunning) return;
        
         
        birdVelocity += gravity;
        birdY += birdVelocity;
        
         
        if (birdY < 0) {
            birdY = 0;
            birdVelocity = 0;
        }
        
        if (birdY > gameScreen.clientHeight - 30) {
            birdY = gameScreen.clientHeight - 30;
            birdVelocity = 0;
            gameOver();
        }
        
         
        bird.style.top = `${birdY}px`;
        bird.style.transform = `rotate(${Math.min(birdVelocity * 5, 90)}deg)`;
        
         
        if (frameCount % 120 === 0) {
            createPipe();
        }
        
         
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            pipe.x -= 2;
            
            pipe.top.style.right = `${gameScreen.clientWidth - pipe.x}px`;
            pipe.bottom.style.right = `${gameScreen.clientWidth - pipe.x}px`;
            
             
            if (!pipe.passed && pipe.x < 50) {
                pipe.passed = true;
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
            }
            
             
            if (
                50 + 30 > pipe.x && 
                50 < pipe.x + 30 && 
                (birdY < pipe.top.clientHeight || 
                birdY + 30 > pipe.top.clientHeight + 80)
            ) {
                gameOver();
            }
            
             
            if (pipe.x + 30 < 0) {
                gameScreen.removeChild(pipe.top);
                gameScreen.removeChild(pipe.bottom);
                pipes.splice(i, 1);
                i--;
            }
        }
        
        frameCount++;
        animationId = requestAnimationFrame(gameLoop);
    }
    
     
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        
        const gameOverMessage = document.createElement('div');
        gameOverMessage.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 16px;
            text-align: center;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            z-index: 30;
        `;
        gameOverMessage.innerHTML = `Game Over<br>Score: ${score}<br>Press UP to restart`;
        gameScreen.appendChild(gameOverMessage);
    }
    
     
    upBtn.addEventListener('click', function() {
        if (!gameRunning) {
             
            gameRunning = true;
            score = 0;
            pipes = [];
            birdY = 100;
            birdVelocity = 0;
            frameCount = 0;
            
             
            Array.from(gameScreen.children).forEach(child => {
                if (child !== bird && child !== scoreDisplay) {
                    gameScreen.removeChild(child);
                }
            });
            
            scoreDisplay.textContent = 'Score: 0';
            startMessage.style.display = 'none';
            
            gameLoop();
        } else {
             
            birdVelocity = -8;
        }
    });
    
     
    preview.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            upBtn.click();
        }
    });
    
    let frameCount = 0;
    
     
    gameScreen.style.background = 'linear-gradient(to bottom, #4dc6ff 0%, #87ceeb 100%)';
    
     
    const ground = document.createElement('div');
    ground.style.cssText = `
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 20px;
        background-color: #8B4513;
        border-top: 3px solid #5D3A1A;
        z-index: 5;
    `;
    gameScreen.appendChild(ground);
    
    const gameControls = preview.querySelector('.game-controls');
    if (gameControls) {
        gameControls.innerHTML = `
            <button class="game-btn">↑</button>
            <button class="game-btn">←</button>
            <button class="game-btn">→</button>
            <button class="game-btn">↓</button>
        `;
    }
}

 
window.addEventListener('DOMContentLoaded', () => {
    enhancedLoadingAnimation();
    initSectionNavigation();
    initProjectNavigation();
    initParticleEffects();
    initTerminalTyping();
    
    setTimeout(() => {
        initThree();
        animate();
    }, 100);
});

 
window.addEventListener('resize', () => {
     
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    
     
    mainCamera.aspect = window.innerWidth / window.innerHeight;
    mainCamera.updateProjectionMatrix();
    sceneRenderer.setSize(window.innerWidth, window.innerHeight);
});

 
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    
     
    setTimeout(() => {
        if (document.querySelector('#bg').style.display === 'none') {
            document.body.classList.add('fallback-mode');
        }
        
        loadingScreen.style.opacity = 0;
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            
             
            const introTimeline = gsap.timeline();
            introTimeline.from('.glitch', { 
                opacity: 0, 
                y: -100, 
                duration: 1,
                ease: "power4.out" 
            });
            
            introTimeline.from('.subtitle', { 
                opacity: 0, 
                y: 50, 
                duration: 0.8,
                ease: "back.out(1.7)" 
            }, "-=0.4");
            
            introTimeline.from('.typing-text', { 
                opacity: 0, 
                scale: 0.8, 
                duration: 0.5,
                onComplete: () => {
                     
                    const introText = "Over 5 years of self-taught coding and hands-on project development. Creating digital experiences that push boundaries.";
                    typeWriter(introText, document.querySelector('.typing-text'));
                }
            }, "+=0.5");
            
             
            const navItems = document.querySelectorAll('.nav-item');
            navItems[0].classList.add('active');
            document.querySelectorAll('.section')[0].classList.add('active');
        }, 500);
    }, 2000);
});

 
function initBasicPreviews() {
    const toggleButtons = document.querySelectorAll('.toggle-preview');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
             
            const projectItem = this.closest('.project-item');
             
            const preview = projectItem.querySelector('.basic-preview');
            
            if (preview.classList.contains('active')) {
                preview.classList.remove('active');
                this.textContent = 'Try Basic Version';
            } else {
                preview.classList.add('active');
                this.textContent = 'Hide Basic Version';
                
                 
                const projectType = projectItem.getAttribute('data-project');
                initSpecificPreview(projectType, preview);
            }
        });
    });
}

function initSpecificPreview(type, previewElement) {
    switch(type) {
        case 'lytext':
            initCodeEditor(previewElement);
            break;
        case 'calculator':
            initRomanCalculator(previewElement);
            break;
        case 'ascii':
            initAsciiConverter(previewElement);
            break;
        case 'pompod':
            initMusicPlayer(previewElement);
            break;
        case 'console':
            initRetroGame(previewElement);
            break;
    }
}

function initCodeEditor(preview) {
    const editorContent = preview.querySelector('.editor-content');
    if (!editorContent) return;
    
     
    function highlightSyntax() {
        let content = editorContent.innerText;
        
         
        content = content.replace(/\b(function|const|let|var|if|else|for|while|return)\b/g, '<span style="color: #569CD6;">$1</span>');
        
         
        content = content.replace(/"([^"]*)"/g, '<span style="color: #CE9178;">\"$1\"</span>');
        
         
        content = content.replace(/\b(\d+)\b/g, '<span style="color: #B5CEA8;">$1</span>');
        
         
        content = content.replace(/(\/\/.*)/g, '<span style="color: #6A9955;">$1</span>');
        
        editorContent.innerHTML = content;
    }
    
     
    highlightSyntax();
    
    let lastCursorPosition = 0;
    
     
    editorContent.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '\n');
            return false;
        }
    });
    
    editorContent.addEventListener('input', function() {
         
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        lastCursorPosition = range.startOffset;
        
         
        requestAnimationFrame(() => {
            const currentText = editorContent.innerText;
            highlightSyntax();
            
             
            try {
                const textNodes = [];
                const findTextNodes = (element) => {
                    if (element.nodeType === Node.TEXT_NODE) {
                        textNodes.push(element);
                    } else {
                        for (const child of element.childNodes) {
                            findTextNodes(child);
                        }
                    }
                };
                
                findTextNodes(editorContent);
                
                let currentLength = 0;
                let targetNode, targetOffset;
                
                for (const node of textNodes) {
                    if (currentLength + node.length >= lastCursorPosition) {
                        targetNode = node;
                        targetOffset = lastCursorPosition - currentLength;
                        break;
                    }
                    currentLength += node.length;
                }
                
                if (targetNode) {
                    const newRange = document.createRange();
                    newRange.setStart(targetNode, Math.min(targetOffset, targetNode.length));
                    newRange.collapse(true);
                    
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            } catch (e) {
                console.log("Error restoring cursor", e);
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initBasicPreviews();
});
