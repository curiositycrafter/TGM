/* ==========================================================================
   THE GYM MOMENTS (TGM) — MAIN APPLICATION JAVASCRIPT
   Features: Three.js 3D Hero Particles, 360 Photosphere Viewer, Real-Time Hours Status,
   71+ Infinity Fit Catalog Fetch & Filter, Scroll Progress Rep Counter, Legal Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHoursStatus();
  initScrollRepProgress();
  initHeroThreeJS();
  initLottieAvatar();
  initEquipmentCatalog();
  initVirtualTourThreeJS();
  initLegalModals();
});

/* ==========================================================================
   1. REAL-TIME OPERATING HOURS STATUS CALCULATOR
   Mon – Sat: 5:00 AM – 10:00 PM (5:00 to 22:00)
   Sun: 5:00 PM – 10:00 PM (17:00 to 22:00)
   ========================================================================== */
function initLiveHoursStatus() {
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');

  if (!statusPill || !statusText) return;

  function checkStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Mon, ... 6 = Sat
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;

    let isOpen = false;

    if (day === 0) {
      // Sunday: 5:00 PM (17:00) to 10:00 PM (22:00) => 1020 mins to 1320 mins
      if (currentMinutes >= 17 * 60 && currentMinutes < 22 * 60) {
        isOpen = true;
      }
    } else {
      // Monday – Saturday: 5:00 AM (5:00) to 10:00 PM (22:00) => 300 mins to 1320 mins
      if (currentMinutes >= 5 * 60 && currentMinutes < 22 * 60) {
        isOpen = true;
      }
    }

    if (isOpen) {
      statusPill.classList.remove('closed');
      statusText.textContent = 'OPEN NOW • CLIMAX REPS';
    } else {
      statusPill.classList.add('closed');
      statusText.textContent = 'CLOSED NOW • OPENS 5 AM';
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000); // Check every minute
}

/* ==========================================================================
   2. SCROLL PROGRESS BAR & REP NOTCH TRACKER
   ========================================================================== */
function initScrollRepProgress() {
  const scrollFill = document.getElementById('scrollFill');
  const scrollPlate = document.getElementById('scrollPlate');
  const repCount = document.getElementById('repCount');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    if (scrollFill) scrollFill.style.width = `${scrollPercent}%`;
    if (scrollPlate) scrollPlate.style.left = `${scrollPercent}%`;

    // Rep Counter Notch logic (0 of 4 to 4 of 4)
    if (repCount) {
      let currentRep = 0;
      if (scrollPercent > 20) currentRep = 1;
      if (scrollPercent > 45) currentRep = 2;
      if (scrollPercent > 75) currentRep = 3;
      if (scrollPercent > 92) currentRep = 4;
      repCount.textContent = `${currentRep} / 4 REPS`;
    }
  });
}

/* ==========================================================================
   3. THREE.JS HERO BACKGROUND DUMBBELL & PARTICLE SCENE
   ========================================================================== */
function initHeroThreeJS() {
  const container = document.getElementById('heroCanvasContainer');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Gold Dumbbell Particles Group
  const group = new THREE.Group();
  scene.add(group);

  // Create Dumbbell Geometry out of particles / metallic meshes
  const barGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 16);
  const plateGeo = new THREE.CylinderGeometry(2, 2, 0.6, 24);
  const goldMaterial = new THREE.MeshPhongMaterial({
    color: 0xD4AF37,
    emissive: 0x0A2E1D,
    shininess: 100,
    wireframe: true
  });

  const bar = new THREE.Mesh(barGeo, goldMaterial);
  bar.rotation.z = Math.PI / 2;
  group.add(bar);

  const plateLeft = new THREE.Mesh(plateGeo, goldMaterial);
  plateLeft.position.x = -3.5;
  plateLeft.rotation.z = Math.PI / 2;
  group.add(plateLeft);

  const plateRight = new THREE.Mesh(plateGeo, goldMaterial);
  plateRight.position.x = 3.5;
  plateRight.rotation.z = Math.PI / 2;
  group.add(plateRight);

  // Background Particles
  const particleCount = 120;
  const particlesGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 40;
    positions[i + 1] = (Math.random() - 0.5) * 40;
    positions[i + 2] = (Math.random() - 0.5) * 40;
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xD4AF37,
    size: 0.15,
    transparent: true,
    opacity: 0.6
  });

  const particleSystem = new THREE.Points(particlesGeo, particleMat);
  scene.add(particleSystem);

  // Ambient & Directional Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xD4AF37, 1);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight);

  // Mouse Interaction
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    group.rotation.x += 0.005 + mouseY * 0.02;
    group.rotation.y += 0.01 + mouseX * 0.02;
    particleSystem.rotation.y -= 0.002;
    renderer.render(scene, camera);
  }

  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ==========================================================================
   4. DYNAMIC 71+ INFINITY FIT CATALOG LOADER & FILTER
   ========================================================================== */
function initEquipmentCatalog() {
  const grid = document.getElementById('equipmentGrid');
  const searchInput = document.getElementById('equipmentSearch');
  const categoryTabs = document.getElementById('categoryTabs');

  if (!grid) return;

  let allItems = [];

  // Fetch equipments.json
  fetch('equipments.json')
    .then(res => res.json())
    .then(data => {
      allItems = data;
      renderGrid(allItems);
    })
    .catch(err => {
      console.error('Failed to load equipments.json', err);
    });

  function renderGrid(items) {
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: var(--primary-gold); margin-bottom: 12px;"></i>
          <p>No equipment matching your search filter. Try another keyword!</p>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'eq-card';
      card.innerHTML = `
        <div class="eq-image-wrapper">
          <span class="eq-id-badge">#${String(item.id).padStart(2, '0')}</span>
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='${item.fallback_image}';">
        </div>
        <div class="eq-body">
          <span class="eq-category">${item.category.toUpperCase()}</span>
          <h3 class="eq-title">${item.name}</h3>
          <p class="eq-desc">${item.description}</p>
          <div class="eq-footer">
            <span><i class="fa-solid fa-shield-halved text-gold"></i> ${item.brand || 'Infinity Fit'}</span>
            <a href="https://wa.me/919500441505?text=Hi%20Coach%20Dinesh,%20I'm%20interested%20in%20using%20the%20${encodeURIComponent(item.name)}%20station." target="_blank" style="color: var(--primary-gold); font-weight: 600;">Inquire <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Filter & Search Logic
  let activeCategory = 'all';

  function filterItems() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allItems.filter(item => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesQuery = item.name.toLowerCase().includes(query) || 
                           item.description.toLowerCase().includes(query) ||
                           item.category.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });

    renderGrid(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
  }

  if (categoryTabs) {
    categoryTabs.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.cat;
        filterItems();
      }
    });
  }
}

/* ==========================================================================
   5. THREE.JS 360° PHOTOSPHERE VIRTUAL GYM TOUR VIEWER
   ========================================================================== */
function initVirtualTourThreeJS() {
  const container = document.getElementById('tourCanvasWrapper');
  const resetBtn = document.getElementById('tourResetBtn');

  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1100);
  camera.target = new THREE.Vector3(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 360 Sphere Geometry
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1); // Invert sphere face inside

  // Procedural 360 Gym Grid Texture (fallback until photosphere JPEG is uploaded)
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Draw 360 Dark Gym Floor Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#040806');
  grad.addColorStop(0.5, '#0B2E1D');
  grad.addColorStop(1, '#050A07');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Draw Gym Floor Grid Lines & Metallic Accents
  ctx.strokeStyle = '#D4AF37';
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 4;
  for (let x = 0; x <= 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Draw TGM Gym Logo in center
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE GYM MOMENTS — 360° FLOOR VIEW', 1024, 512);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Interaction Controls (Drag to rotate)
  let isUserInteracting = false,
      onPointerDownPointerX = 0, onPointerDownPointerY = 0,
      lon = 0, onPointerDownLon = 0,
      lat = 0, onPointerDownLat = 0,
      phi = 0, theta = 0;

  container.addEventListener('pointerdown', (e) => {
    isUserInteracting = true;
    onPointerDownPointerX = e.clientX;
    onPointerDownPointerY = e.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
  });

  document.addEventListener('pointermove', (e) => {
    if (isUserInteracting) {
      lon = (onPointerDownPointerX - e.clientX) * 0.1 + onPointerDownLon;
      lat = (e.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
    }
  });

  document.addEventListener('pointerup', () => {
    isUserInteracting = false;
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      lon = 0;
      lat = 0;
    });
  }

  function update360() {
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(camera.target);
    renderer.render(scene, camera);
    requestAnimationFrame(update360);
  }

  update360();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/* ==========================================================================
   6. LEGAL MODALS (PRIVACY POLICY & TERMS)
   ========================================================================== */
function initLegalModals() {
  const modal = document.getElementById('legalModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const openPrivacy = document.getElementById('openPrivacyModal');
  const openTerms = document.getElementById('openTermsModal');
  const closeModal = document.getElementById('closeModal');

  if (!modal) return;

  function showModal(title, content) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = content;
    modal.classList.add('open');
  }

  if (openPrivacy) {
    openPrivacy.addEventListener('click', () => {
      showModal('Privacy Policy', `
        <p><strong>The Gym Moments (TGM)</strong> values member privacy.</p>
        <br>
        <p>1. <strong>Personal Information:</strong> Contact information provided for enrollment (Name, Phone Number) is strictly used for membership management and direct communication by Coach Dinesh M.</p>
        <br>
        <p>2. <strong>Facility Security:</strong> CCTV monitoring is maintained on main workout floors for member safety and equipment security.</p>
        <br>
        <p>3. <strong>No Third-Party Sharing:</strong> Your data is never sold or shared with external third-party advertisers.</p>
      `);
    });
  }

  if (openTerms) {
    openTerms.addEventListener('click', () => {
      showModal('Terms & Conditions', `
        <p><strong>The Gym Moments (TGM) Gym Rules & Regulations:</strong></p>
        <br>
        <p>1. <strong>Lifting Etiquette:</strong> Always re-rack barbells, dumbbells, and plates after completing your sets.</p>
        <br>
        <p>2. <strong>Live Kitchen Guidelines:</strong> Clean up your kitchen station after cooking post-workout meals.</p>
        <br>
        <p>3. <strong>Footwear:</strong> Clean indoor workout shoes required at all times inside AC lifting zones.</p>
        <br>
        <p>4. <strong>Membership Transfers:</strong> All memberships (1, 3, 6, 12 Months) are non-refundable as stated during enrollment.</p>
      `);
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

/* ==========================================================================
   7. SCROLL-SCRUBBED ANIMATED EXERCISING AVATAR (LOTTIE & SVG VECTOR REPS)
   ========================================================================== */
function initLottieAvatar() {
  const container = document.getElementById('lottieAvatarContainer');
  const caption = document.getElementById('lottieCaption');

  if (!container) return;

  // Vector SVG Avatar representing exercise reps progression
  const avatarSvg = `
    <svg id="avatarSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <radialGradient id="glowReps" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#glowReps)"/>
      <circle cx="100" cy="100" r="85" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.3"/>
      
      <!-- Head -->
      <circle cx="100" cy="55" r="16" fill="#D4AF37"/>
      
      <!-- Torso -->
      <path d="M100 71 L100 120" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/>
      
      <!-- Arms & Weight Bar (Dynamic Translation) -->
      <g id="armGroup">
        <path id="leftArm" d="M100 80 L65 100 L45 80" stroke="#D4AF37" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path id="rightArm" d="M100 80 L135 100 L155 80" stroke="#D4AF37" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        
        <!-- Barbell Weights -->
        <g id="barbellGroup">
          <line x1="30" y1="75" x2="170" y2="75" stroke="#FFFFFF" stroke-width="4"/>
          <rect id="leftPlate1" x="35" y="55" width="10" height="40" rx="3" fill="#D4AF37"/>
          <rect id="leftPlate2" x="23" y="60" width="10" height="30" rx="3" fill="#134B30" stroke="#D4AF37" stroke-width="1"/>
          <rect id="rightPlate1" x="155" y="55" width="10" height="40" rx="3" fill="#D4AF37"/>
          <rect id="rightPlate2" x="167" y="60" width="10" height="30" rx="3" fill="#134B30" stroke="#D4AF37" stroke-width="1"/>
        </g>
      </g>

      <!-- Legs -->
      <path d="M100 120 L75 165" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>
      <path d="M100 120 L125 165" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>
    </svg>
  `;

  container.innerHTML = avatarSvg;

  const armGroup = document.getElementById('armGroup');
  const leftPlate2 = document.getElementById('leftPlate2');
  const rightPlate2 = document.getElementById('rightPlate2');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));

    // Calculate Rep Motion Y Shift (Sine wave oscillation for rep pumping)
    const repPhase = (scrollPercent * 0.25) % (Math.PI * 2);
    const translateY = Math.sin(scrollPercent * 0.15) * 20;

    if (armGroup) {
      armGroup.style.transform = `translateY(${translateY}px)`;
    }

    // Progression Stages
    if (caption) {
      if (scrollPercent < 25) {
        caption.textContent = "Stage 1: Light Warmup Curls";
        if (leftPlate2) leftPlate2.style.display = "none";
        if (rightPlate2) rightPlate2.style.display = "none";
      } else if (scrollPercent < 70) {
        caption.textContent = "Stage 2: Heavy Progressive Overload";
        if (leftPlate2) leftPlate2.style.display = "block";
        if (rightPlate2) rightPlate2.style.display = "block";
      } else {
        caption.textContent = "Stage 3: Completed Set! Drop Weights & Join!";
        if (leftPlate2) leftPlate2.style.display = "block";
        if (rightPlate2) rightPlate2.style.display = "block";
      }
    }
  });
}
