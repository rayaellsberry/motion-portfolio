document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const menuBtn = document.querySelector('.menu-trigger-btn');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuLinks = document.querySelectorAll('.nav-links a');
  const appContainer = document.querySelector('.app-container');
  const sections = document.querySelectorAll('section');
  const sidebarIndicator = document.querySelector('.sidebar-indicator');

  // Portfolio Slider Elements
  const track = document.querySelector('.portfolio-track');
  const cards = document.querySelectorAll('.portfolio-card');
  const prevBtn = document.querySelector('.nav-arrow-btn.prev');
  const nextBtn = document.querySelector('.nav-arrow-btn.next');
  const counterSpan = document.querySelector('.pagination-counter');
  const projectTitle = document.querySelector('.project-title-name');
  const projectDate = document.querySelector('.project-date');
  const projectCategory = document.querySelector('.project-category');
  const viewProjectLink = document.getElementById('project-link');

  let currentSlideIndex = 0;

  // --- Fullscreen Menu Toggle ---
  function toggleMenu() {
    menuBtn.classList.toggle('active');
    menuOverlay.classList.toggle('open');
  }

  menuBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking navigation link and smooth scroll to section
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();

      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Intersection Observer for Active Section Sync ---
  const observerOptions = {
    root: appContainer,
    threshold: 0.6 // Section must take up at least 60% of viewport
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;

        // Remove active class from all sections
        sections.forEach(s => s.classList.remove('section-active'));
        // Add active class to current section
        entry.target.classList.add('section-active');

        // Update rotated sidebar indicator label
        let displayLabel = sectionId;
        if (sectionId === 'homepage') displayLabel = 'Homepage';
        if (sectionId === 'portfolio') displayLabel = 'Portfolio';
        if (sectionId === 'about') displayLabel = 'About';
        if (sectionId === 'end') displayLabel = 'End';

        sidebarIndicator.textContent = displayLabel;

        // Sync visual sidebar indicator transition effect
        sidebarIndicator.style.opacity = 0;
        setTimeout(() => {
          sidebarIndicator.style.opacity = 1;
        }, 150);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));


  // --- Portfolio Horizontal Slider Functionality ---
  function updateSlider() {
    // 1. Highlight active card visually
    cards.forEach((card, idx) => {
      if (idx === currentSlideIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // 2. Slide the track to position active card in focal viewport
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 30; // Matches CSS Gap

    const translateValue = -currentSlideIndex * (cardWidth + gap);
    track.style.transform = `translateX(${translateValue}px)`;

    // 3. Update active card project detail text
    const activeProject = projectsData[currentSlideIndex];
    if (activeProject) {
      projectTitle.textContent = activeProject.title;
      projectDate.textContent = activeProject.date;
      projectCategory.textContent = activeProject.category;
    }

    // 4. Update the "1 / 6" indicator
    counterSpan.textContent = `${currentSlideIndex + 1} / ${projectsData.length}`;

    // 5. Enable/Disable buttons
    prevBtn.disabled = currentSlideIndex === 0;
    nextBtn.disabled = currentSlideIndex === projectsData.length - 1;

    // 6. Update view project page link dynamically
    viewProjectLink.href = `project.html?id=${currentSlideIndex}`;
  }

  // Next Slide Click
  nextBtn.addEventListener('click', () => {
    if (currentSlideIndex < projectsData.length - 1) {
      currentSlideIndex++;
      updateSlider();
    }
  });

  // Prev Slide Click
  prevBtn.addEventListener('click', () => {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlider();
    }
  });
  // --- Drag / Swipe support for slider ---
  let isDragging = false;
  let startX = 0;
  let dragged = false;

  const onDragStart = (e) => {
    e.preventDefault(); // Prevent page scroll on touch start
    isDragging = true;
    dragged = false;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    track.style.cursor = 'grabbing';
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent page scrolling while dragging
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const diff = startX - x;
    const threshold = (cards[0].getBoundingClientRect().width + 30); // card width + gap
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentSlideIndex < projectsData.length - 1) {
        currentSlideIndex++;
      } else if (diff < 0 && currentSlideIndex > 0) {
        currentSlideIndex--;
      }
      updateSlider();
      startX = x; // reset start for continuous drag
      dragged = true;
    }
  };

  const onDragEnd = () => {
    isDragging = false;
    track.style.cursor = 'grab';
  };

  // Mouse, Wheel and Touch events
  track.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
  // Wheel scroll support for slider navigation (vertical scroll)
// Wheel scroll support for slider navigation (vertical scroll) with throttle to slow down scrolling
track.addEventListener('wheel', (e) => {
  e.preventDefault();
  // Throttle: ignore wheel events that occur within 300ms of the previous one
  if (track._wheelThrottle) return;
  track._wheelThrottle = true;
  setTimeout(() => { track._wheelThrottle = false; }, 300);

  if (e.deltaY > 0) {
    // Scroll down -> next slide
    if (currentSlideIndex < projectsData.length - 1) {
      currentSlideIndex++;
      updateSlider();
    }
  } else if (e.deltaY < 0) {
    // Scroll up -> previous slide
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlider();
    }
  }
}, { passive: false });

  // Touch events
  track.addEventListener('touchstart', onDragStart, { passive: true });
  track.addEventListener('touchmove', onDragMove, { passive: false });
  track.addEventListener('touchend', onDragEnd);

  // Direct card click: focus if not active, navigate if already active
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (index === currentSlideIndex) {
        // Navigate to project details page for this card
        window.location.href = `project.html?id=${index}`;
      } else {
        currentSlideIndex = index;
        updateSlider();
      }
    });
  });

  // --- Portfolio Card Hover Play/Pause (GIF Swap) ---
  cards.forEach(card => {
    const img = card.querySelector('img');
    if (img && img.dataset.hoverGif) {
      const staticSrc = img.dataset.staticSrc || img.src;
      const hoverGif = img.dataset.hoverGif;

      card.addEventListener('mouseenter', () => {
        img.src = hoverGif;
      });

      card.addEventListener('mouseleave', () => {
        img.src = staticSrc;
      });
    }
  });

  // Resize window handler to recalculate slide translation offset
  window.addEventListener('resize', () => {
    updateSlider();
  });


  // --- Initialization ---
  updateSlider();
});
