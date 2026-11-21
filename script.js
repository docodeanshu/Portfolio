/**
 * ANSHU KUMAR SHAH — PORTFOLIO ENGINE
 * Three.js 3D Interactive WebGL, 3D Tilt Mechanics, Terminal Emulator, Smooth Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initThreeJsBackground();
    initCustomCursor();
    initTiltCards();
    initScrollCounters();
    initArsenalTabs();
    initTerminal();
    initClipboardCopy();
    initProjectModals();
    initNavigation();
    initFooterYear();
});

/* ===================================================================
   1. THREE.JS 3D PARTICLE CONSTELLATION & WIREFRAME GEOMETRY
   =================================================================== */
function initThreeJsBackground() {
    const container = document.getElementById('webgl-container');
    if (!container || typeof THREE === 'undefined') return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 35;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic 3D Particle Cloud
    const particleCount = window.innerWidth < 768 ? 400 : 900;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x6366f1); // Indigo
    const color2 = new THREE.Color(0x06b6d4); // Cyan
    const color3 = new THREE.Color(0xa855f7); // Purple

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 85;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 85;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

        const mixedColor = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
        size: 0.65,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // Floating 3D Wireframe Icosahedron (The "Kernel" Core)
    const icoGeo = new THREE.IcosahedronGeometry(7, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    const icoCore = new THREE.Mesh(icoGeo, icoMat);
    icoCore.position.set(18, 5, -5);
    scene.add(icoCore);

    // Outer Inner Ring
    const torusGeo = new THREE.TorusGeometry(10, 0.08, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.15
    });
    const torusRing = new THREE.Mesh(torusGeo, torusMat);
    torusRing.position.copy(icoCore.position);
    torusRing.rotation.x = Math.PI / 3;
    scene.add(torusRing);

    // Mouse Interaction Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - windowHalfX) * 0.0006;
        mouseY = (e.clientY - windowHalfY) * 0.0006;
    }, { passive: true });

    // Animation Loop
    let clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Parallax easing
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        camera.position.x = targetX * 18;
        camera.position.y = -targetY * 18;
        camera.lookAt(scene.position);

        // Continuous subtle rotation
        particles.rotation.y = elapsedTime * 0.03;
        particles.rotation.x = elapsedTime * 0.015;

        icoCore.rotation.x = elapsedTime * 0.15;
        icoCore.rotation.y = elapsedTime * 0.2;
        torusRing.rotation.z = -elapsedTime * 0.1;
        torusRing.rotation.y = elapsedTime * 0.08;

        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* ===================================================================
   2. CUSTOM FLUID CURSOR
   =================================================================== */
function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    if (!dot || !outline) return;

    let posX = window.innerWidth / 2;
    let posY = window.innerHeight / 2;
    let mouseX = posX;
    let mouseY = posY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }, { passive: true });

    function renderOutline() {
        posX += (mouseX - posX) * 0.18;
        posY += (mouseY - posY) * 0.18;
        outline.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%)`;
        requestAnimationFrame(renderOutline);
    }
    renderOutline();

    // Hover Scaling on Interactive Elements
    const interactables = document.querySelectorAll('a, button, input, textarea, .tilt-card, .quick-btn');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.width = '55px';
            outline.style.height = '55px';
            outline.style.borderColor = 'rgba(34, 211, 238, 0.9)';
            outline.style.backgroundColor = 'rgba(6, 182, 212, 0.08)';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.width = '36px';
            outline.style.height = '36px';
            outline.style.borderColor = 'rgba(6, 182, 212, 0.6)';
            outline.style.backgroundColor = 'transparent';
        });
    });
}

/* ===================================================================
   3. 3D TILT EFFECT ON CARDS
   =================================================================== */
function initTiltCards() {
    const tiltElements = document.querySelectorAll('.tilt-card');
    
    // Disable on small touch screens for performance
    if (window.innerWidth < 1024) return;

    tiltElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -7; // Max tilt 7deg
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
            card.style.transition = 'transform 0.5s ease-out';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}

/* ===================================================================
   4. STATS COUNTER ANIMATION (ON SCROLL)
   =================================================================== */
function initScrollCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                animateCounter(entry.target, target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));

    function animateCounter(element, target) {
        let current = 0;
        const duration = 1500;
        const stepTime = Math.max(Math.floor(duration / target), 30);

        const timer = setInterval(() => {
            current += 1;
            element.textContent = current;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, stepTime);
    }
}

/* ===================================================================
   5. ARSENAL FILTER TABS
   =================================================================== */
function initArsenalTabs() {
    const tabs = document.querySelectorAll('.arsenal-tab-btn');
    const cards = document.querySelectorAll('.skill-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            cards.forEach(card => {
                const categories = card.getAttribute('data-category');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 250);
                }
            });
        });
    });
}

/* ===================================================================
   6. INTERACTIVE TERMINAL EMULATOR
   =================================================================== */
function initTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const screen = document.getElementById('terminal-screen');
    const clearBtn = document.getElementById('terminal-clear-btn');
    const quickBtns = document.querySelectorAll('.quick-btn');

    if (!input || !output) return;

    const commandHistory = [];
    let historyIdx = -1;

    const commands = {
        help: `
<span class="text-cyan font-bold">AVAILABLE COMMANDS:</span>
  • <span class="text-white font-bold">whoami</span>       : Executive summary of Anshu Kumar Shah
  • <span class="text-white font-bold">skills</span>       : Full technical stack &amp; capabilities
  • <span class="text-white font-bold">projects</span>     : Flagship architectures &amp; source links
  • <span class="text-white font-bold">dsa</span>          : Algorithmic problem solving &amp; LeetCode stats
  • <span class="text-white font-bold">hire</span>         : Direct coordinate transmission &amp; availability
  • <span class="text-white font-bold">github</span>       : Direct link to GitHub (@docodeanshu)
  • <span class="text-white font-bold">linkedin</span>     : Direct link to LinkedIn
  • <span class="text-white font-bold">matrix</span>       : Activate computational pulse
  • <span class="text-white font-bold">clear</span>        : Wipe terminal buffer
        `,
        whoami: `
<span class="text-emerald font-bold">[ENGINEER IDENTIFICATION]</span>
Name        : <strong class="text-white">Anshu Kumar Shah</strong>
Title       : Software Engineer &bull; Systems &bull; Creative Frontend Architect
Location    : Coimbatore, Tamil Nadu, India (Worldwide Open)
Core Focus  : High-throughput architectures, sub-millisecond algorithms, 3D WebGL synthesis
Status      : <span class="text-cyan font-bold">Available for High-Impact Roles</span>
        `,
        skills: `
<span class="text-cyan font-bold">[TECHNICAL ARSENAL]</span>
  • <strong class="text-white">Languages:</strong> C++, Java, Python, JavaScript (ES6+), SQL, Bash
  • <strong class="text-white">Core CS:</strong> Operating Systems, DBMS (ACID &amp; Indexing), Computer Networks, System Architecture
  • <strong class="text-white">Frontend &amp; 3D:</strong> Three.js, WebGL, Modern CSS3/Grid, Semantic HTML5, Canvas API
  • <strong class="text-white">Tools &amp; VCS:</strong> Git/GitHub, Linux CLI, Chrome DevTools, Vite, Postman
        `,
        projects: `
<span class="text-purple font-bold">[FLAGSHIP ARCHITECTURES]</span>
  1. <strong class="text-cyan">NexusOS</strong>       : Web-based kernel scheduling &amp; virtual memory engine
  2. <strong class="text-cyan">AlgoPulse</strong>     : High-performance graph traversal &amp; dynamic profiler
  3. <strong class="text-cyan">HyperStore</strong>    : In-browser B+ Tree relational database engine
  4. <strong class="text-cyan">Aether 3D</strong>     : Procedural WebGL shader particle ecosystem
Type <span class="text-yellow">cat &lt;project-name&gt;</span> or click cards in Section 03 for system diagrams.
        `,
        dsa: `
<span class="text-emerald font-bold">[ALGORITHMIC &amp; DSA METRICS]</span>
Platform    : <a href="https://leetcode.com/u/gochampanshu/" target="_blank" class="text-cyan underline">leetcode.com/u/gochampanshu/</a>
Problems    : <strong class="text-white">33+ Mastered</strong> (Continuous Daily Optimization Loop)
Specialties : Graph Theory (Dijkstra, Tarjan), Dynamic Programming, Tree Traversals, Two Pointers
Philosophy  : Optimal Big-O Space &amp; Time complexity on every sub-routine.
        `,
        hire: `
<span class="text-cyan font-bold">[RECRUITMENT DISPATCH]</span>
Status      : Actively interviewing for SWE, Systems &amp; Frontend roles.
Coordinates : <a href="mailto:theanshushah@gmail.com" class="text-white underline">theanshushah@gmail.com</a>
Location    : Coimbatore, India &bull; Open for Remote &amp; Worldwide Relocation
Action      : Dispatch email or click the 'Connect' button in navigation!
        `,
        github: `Redirecting to <a href="https://github.com/docodeanshu" target="_blank" class="text-cyan underline">github.com/docodeanshu</a>...`,
        linkedin: `Redirecting to <a href="https://www.linkedin.com/in/anshu-kumar-shah-6ba928410/" target="_blank" class="text-cyan underline">LinkedIn Profile</a>...`,
        matrix: `
<span class="text-emerald">01000001 01001110 01010011 01001000 01010101 // MATRIX RUNTIME ACTIVE</span>
<span class="text-cyan font-bold">[OK] High-throughput threads unlocked. Execution speed optimal.</span>
        `
    };

    function executeCommand(rawCmd) {
        const cmd = rawCmd.trim().toLowerCase();
        
        // Print command line
        const cmdLine = document.createElement('div');
        cmdLine.className = 'terminal-line';
        cmdLine.innerHTML = `<span class="terminal-prompt">anshu@root:~$</span> <span class="text-white font-bold">${escapeHtml(rawCmd)}</span>`;
        output.appendChild(cmdLine);

        if (!cmd) {
            screen.scrollTop = screen.scrollHeight;
            return;
        }

        commandHistory.push(rawCmd);
        historyIdx = commandHistory.length;

        const responseLine = document.createElement('div');
        responseLine.className = 'terminal-line';

        if (cmd === 'clear') {
            output.innerHTML = '';
            return;
        } else if (cmd === 'github') {
            responseLine.innerHTML = commands.github;
            window.open('https://github.com/docodeanshu', '_blank');
        } else if (cmd === 'linkedin') {
            responseLine.innerHTML = commands.linkedin;
            window.open('https://www.linkedin.com/in/anshu-kumar-shah-6ba928410/', '_blank');
        } else if (cmd.startsWith('sudo')) {
            responseLine.innerHTML = `<span class="text-red">Access granted: Anshu Kumar Shah already holds root authority across all modules.</span>`;
        } else if (commands[cmd]) {
            responseLine.innerHTML = commands[cmd];
        } else {
            responseLine.innerHTML = `<span class="text-red">Command not recognized: '${escapeHtml(cmd)}'</span>. Type <span class="text-cyan font-bold">help</span> to view available system routines.`;
        }

        output.appendChild(responseLine);
        screen.scrollTop = screen.scrollHeight;
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = input.value;
            input.value = '';
            executeCommand(val);
        } else if (e.key === 'ArrowUp') {
            if (historyIdx > 0) {
                historyIdx--;
                input.value = commandHistory[historyIdx] || '';
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIdx < commandHistory.length - 1) {
                historyIdx++;
                input.value = commandHistory[historyIdx] || '';
            } else {
                historyIdx = commandHistory.length;
                input.value = '';
            }
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            output.innerHTML = '';
        });
    }

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            executeCommand(cmd);
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ===================================================================
   7. CLIPBOARD COPY & TOAST NOTIFICATION
   =================================================================== */
function initClipboardCopy() {
    const copyBtn = document.getElementById('copy-email-btn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
        const email = 'theanshushah@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            showToast('Email copied to clipboard: ' + email);
        }).catch(() => {
            showToast('Email: ' + email);
        });
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

/* ===================================================================
   8. FORM TRANSMISSION DISPATCH
   =================================================================== */
window.handleFormSubmit = function(event) {
    event.preventDefault();
    const name = document.getElementById('sender-name').value;
    const email = document.getElementById('sender-email').value;
    const subject = document.getElementById('message-subject').value;
    const message = document.getElementById('sender-message').value;

    const mailtoUrl = `mailto:theanshushah@gmail.com?subject=${encodeURIComponent('[Portfolio Transmission] ' + subject)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;

    showToast('Secure transmission prepared! Launching your mail client...');
    
    setTimeout(() => {
        window.location.href = mailtoUrl;
    }, 700);
};

/* ===================================================================
   9. PROJECT MODAL DRAWER
   =================================================================== */
function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const modalTarget = document.getElementById('modal-content-target');
    const closeBtn = document.getElementById('modal-close-btn');
    const triggers = document.querySelectorAll('.project-preview-trigger');

    if (!modal || !modalTarget) return;

    const projectSpecs = {
        nexus: {
            title: "NexusOS — Web-Based Kernel & CPU Scheduler",
            tag: "SYSTEMS ARCHITECTURE &bull; OS THEORY",
            desc: "Designed to explore lower-level operating system mechanics inside a zero-latency client environment. Features real-time multi-level feedback queue scheduling, memory paging simulation with LRU/FIFO eviction models, and dynamic thread state visualizers.",
            architecture: [
                "CPU Scheduling: Round Robin (quantum-based), Shortest Job First, Priority",
                "Virtual Memory: Paging simulator, Page Table lookups, Page Fault traps",
                "Synchronization: Mutex lock simulation, Producer-Consumer buffer concurrency",
                "Rendering: 60 FPS HTML5 Canvas interpolation with zero DOM thrashing"
            ],
            github: "https://github.com/docodeanshu"
        },
        algopulse: {
            title: "AlgoPulse — High-Performance Graph & DSA Engine",
            tag: "ALGORITHMS &bull; COMPLEXITY ANALYSIS",
            desc: "Engineered for deep-dive algorithmic dissection. Provides sub-millisecond execution profiling for graph traversals and dynamic programming memoization trees.",
            architecture: [
                "Graph Algorithms: Dijkstra's, Bellman-Ford, A* Search, Kosaraju/Tarjan SCC",
                "DP Profiling: Real-time recursion call stack visualization with cache inspection",
                "Data Topologies: Weighted Directed/Undirected Graphs, Binary Heaps, Segment Trees",
                "Performance: Vector graphics canvas optimized for large-scale vertex sets"
            ],
            github: "https://github.com/docodeanshu"
        },
        hyperstore: {
            title: "HyperStore — B+ Tree Storage & DBMS Engine",
            tag: "DATABASE INTERNALS &bull; STORAGE",
            desc: "A pure JavaScript implementation of core database storage engine principles, simulating the disk-page architecture of relational databases.",
            architecture: [
                "Index Engine: B+ Tree with node splitting, merging, and range scan iteration",
                "Transaction Engine: ACID compliance simulation with Write-Ahead Logging (WAL)",
                "Query Processing: Recursive descent SQL parser supporting SELECT, WHERE, JOIN",
                "Integrity: Foreign key constraints, unique indexing, and multi-version concurrency concepts"
            ],
            github: "https://github.com/docodeanshu"
        },
        aether: {
            title: "Aether 3D — Spatial WebGL Shader Experience",
            tag: "GRAPHICS &bull; THREE.JS &bull; SHADER MATH",
            desc: "A futuristic 3D digital laboratory utilizing hardware-accelerated WebGL pipelines and procedural mathematical functions.",
            architecture: [
                "Shader Pipeline: GLSL Vertex & Fragment shader computations",
                "Particle Physics: Over 10,000 interactive particles reacting to pointer vector forces",
                "Scene Graph: Optimized Three.js hierarchy maintaining 60 FPS on high-DPI displays",
                "Spatial Audio / Reactivity: Dynamic camera orbital transforms based on mouse inertia"
            ],
            github: "https://github.com/docodeanshu"
        }
    };

    triggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const pKey = btn.getAttribute('data-project');
            const data = projectSpecs[pKey];
            if (!data) return;

            modalTarget.innerHTML = `
                <div class="modal-spec-header">
                    <span class="project-badge">${data.tag}</span>
                    <h2 class="project-title" style="margin-top: 0.5rem; font-size: 1.6rem;">${data.title}</h2>
                </div>
                <p style="margin: 1.25rem 0; color: #94a3b8; line-height: 1.7;">${data.desc}</p>
                <h4 style="font-size: 1rem; color: #ffffff; margin-bottom: 0.75rem;">ARCHITECTURAL HIGHLIGHTS:</h4>
                <ul class="project-features" style="margin-bottom: 1.75rem;">
                    ${data.architecture.map(item => `<li><i class="fa-solid fa-check text-cyan"></i> ${item}</li>`).join('')}
                </ul>
                <div style="display: flex; gap: 1rem;">
                    <a href="${data.github}" target="_blank" rel="noopener" class="btn btn-primary btn-glow">
                        <i class="fa-brands fa-github"></i>
                        <span>Inspect Source Repository</span>
                    </a>
                </div>
            `;

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

/* ===================================================================
   10. NAVIGATION SCROLL-SPY & MOBILE MENU
   =================================================================== */
function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const desktopLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Scroll-Spy for desktop navbar active links
    window.addEventListener('scroll', () => {
        let currentSection = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        desktopLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

/* ===================================================================
   11. FOOTER DYNAMIC YEAR
   =================================================================== */
function initFooterYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}
