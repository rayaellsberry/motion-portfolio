document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const menuBtn = document.getElementById('menu-btn');
  const menuOverlay = document.getElementById('menu-panel');
  const menuLinks = document.querySelectorAll('.nav-links a');
  
  const detailsTitle = document.getElementById('details-project-name');
  const detailsCategory = document.getElementById('details-project-category');
  const detailsDate = document.getElementById('details-project-date');
  const detailsImg = document.getElementById('details-gallery-img');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const detailsDesc = document.getElementById('details-project-desc');
  const detailsPrevBtn = document.getElementById('gallery-prev');
  const detailsNextBtn = document.getElementById('gallery-next');
  const detailsNextProjectBtn = document.getElementById('next-project-btn');

  // --- Parse URL Query Parameters ---
  const urlParams = new URLSearchParams(window.location.search);
  let projectId = parseInt(urlParams.get('id'));
  
  // Fallback check
  if (isNaN(projectId) || projectId < 0 || projectId >= projectsData.length) {
    projectId = 0;
  }

  let currentGalleryImgIndex = 0;

  // --- Fullscreen Menu Toggle ---
  function toggleMenu() {
    menuBtn.classList.toggle('active');
    menuOverlay.classList.toggle('open');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMenu);
  }

  // Handle menu link clicks (redirecting back to homepage hashes)
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Allow natural navigation back to home page sections
      if (menuOverlay.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // --- Load Project Details ---
  function loadProject() {
    const project = projectsData[projectId];
    if (!project) return;

    // 1. Title & Description
    detailsTitle.textContent = project.title;
    detailsDesc.textContent = project.imageDescriptions[currentGalleryImgIndex];
    if (detailsCategory) detailsCategory.textContent = project.category;
    if (detailsDate) detailsDate.textContent = project.date;
    
    // Tab title
    document.title = `Raya Ellsberry | ${project.title}`;

    // 2. Main Media (Image or Video)
    const asset = project.images[currentGalleryImgIndex];
    updateMediaForAsset(asset);
    
    // 3. Update Gallery Arrows state
    updateGalleryControls(project);
  }

  function updateMediaForAsset(asset) {
    const isVideo = asset.endsWith('.mp4');
    const currentMedia = document.getElementById('details-gallery-img');

    if (isVideo) {
      if (currentMedia && currentMedia.tagName === 'VIDEO') {
        currentMedia.src = asset;
        setupPlayPause(currentMedia);
      } else {
        const video = document.createElement('video');
        video.id = 'details-gallery-img';
        video.className = 'details-display-img';
        video.src = asset;
        video.controls = false;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        if (currentMedia) {
          currentMedia.replaceWith(video);
        }
        setupPlayPause(video);
      }
    } else {
      if (currentMedia && currentMedia.tagName === 'VIDEO') {
        const img = document.createElement('img');
        img.id = 'details-gallery-img';
        img.className = 'details-display-img';
        img.alt = 'Selected Project Visual';
        img.src = asset;
        currentMedia.replaceWith(img);
      } else if (currentMedia) {
        currentMedia.src = asset;
      }
      playPauseBtn.style.display = 'none';
    }
  }

  function setupPlayPause(video) {
    playPauseBtn.style.display = 'flex';
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    playPauseBtn.onclick = () => {
      if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      } else {
        video.pause();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    };
  }

  function updateGalleryControls(project) {
    detailsPrevBtn.disabled = currentGalleryImgIndex === 0;
    detailsNextBtn.disabled = currentGalleryImgIndex === project.images.length - 1;
  }

  // --- Gallery Navigation Event Listeners ---
    detailsPrevBtn.addEventListener('click', () => {
      const project = projectsData[projectId];
      if (project && currentGalleryImgIndex > 0) {
        currentGalleryImgIndex--;
        // Update media display for new asset
        const asset = project.images[currentGalleryImgIndex];
        updateMediaForAsset(asset);
        updateGalleryControls(project);
      }
    });

    detailsNextBtn.addEventListener('click', () => {
      const project = projectsData[projectId];
      if (project && currentGalleryImgIndex < project.images.length - 1) {
        currentGalleryImgIndex++;
        const asset = project.images[currentGalleryImgIndex];
        updateMediaForAsset(asset);
        updateGalleryControls(project);
      }
    });

  // --- Next Project Navigation Redirection ---
  detailsNextProjectBtn.addEventListener('click', () => {
    const nextIndex = (projectId + 1) % projectsData.length;
    const detailPanel = document.querySelector('.project-details-layout');
    
    // Smooth transition fade before redirect
    detailPanel.style.opacity = '0';
    detailPanel.style.transform = 'translateY(15px)';
    
    setTimeout(() => {
      window.location.href = `project.html?id=${nextIndex}`;
    }, 350);
  });

    // Ensure play/pause button is hidden initially for image assets
    playPauseBtn.style.display = 'none';
    
  // Run initialization
  loadProject();
});
