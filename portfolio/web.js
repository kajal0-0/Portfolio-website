let isDragging = false;
let currentWindow = null;
let offset = { x: 0, y: 0 };
let highestZIndex = 2000;

function openWindow(windowId, title) {
  const window = document.getElementById(windowId + '-window');
  
  // Bring window to front
  bringToFront(window);
  
  // Remove any existing closing class
  window.classList.remove('closing');
  
  // Add active class for animation
  window.classList.add('active');
  
  // Reset position to center
  window.style.top = '50%';
  window.style.left = '50%';
  window.style.transform = 'translate(-50%, -50%) scale(1)';
}

function closeWindow(windowId) {
  const window = document.getElementById(windowId);
  
  // Add closing animation
  window.classList.add('closing');
  
  // Remove active class and reset after animation
  setTimeout(() => {
    window.classList.remove('active', 'closing');
    window.style.transform = 'translate(-50%, -50%) scale(0)';
  }, 300);
}

function bringToFront(window) {
  highestZIndex += 1;
  window.style.zIndex = highestZIndex;
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('light-mode');
  
  // Save theme preference
  const isLightMode = body.classList.contains('light-mode');
  localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
});

// Add drag functionality
document.addEventListener('mousedown', function(e) {
  const header = e.target.closest('.draggable-window-header');
  if (header && !e.target.classList.contains('close-btn')) {
    isDragging = true;
    currentWindow = header.parentElement;
    
    // Bring window to front when clicked
    bringToFront(currentWindow);
    
    // Add dragging class
    currentWindow.classList.add('dragging');
    
    const rect = currentWindow.getBoundingClientRect();
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
    
    // Remove transform centering when dragging starts
    if (currentWindow.style.transform.includes('translate(-50%, -50%)')) {
      const computedStyle = window.getComputedStyle(currentWindow);
      const matrix = new DOMMatrix(computedStyle.transform);
      currentWindow.style.left = (currentWindow.offsetLeft) + 'px';
      currentWindow.style.top = (currentWindow.offsetTop) + 'px';
      currentWindow.style.transform = 'scale(1)';
    }
    
    e.preventDefault();
  }
});

document.addEventListener('mousemove', function(e) {
  if (isDragging && currentWindow) {
    const x = e.clientX - offset.x;
    const y = e.clientY - offset.y;
    
    // Get header height to ensure it stays visible
    const header = currentWindow.querySelector('.draggable-window-header');
    const headerHeight = header ? header.offsetHeight : 50;
    
    // Keep window within viewport bounds
    const maxX = window.innerWidth - currentWindow.offsetWidth;
    const maxY = window.innerHeight - headerHeight;
    const minY = -currentWindow.offsetHeight + headerHeight;
    
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(minY, Math.min(y, maxY));
    
    currentWindow.style.left = boundedX + 'px';
    currentWindow.style.top = boundedY + 'px';
  }
});

document.addEventListener('mouseup', function(e) {
  if (currentWindow) {
    currentWindow.classList.remove('dragging');
  }
  isDragging = false;
  currentWindow = null;
});

// Click on window body to bring to front
document.addEventListener('click', function(e) {
  const window = e.target.closest('.draggable-window');
  if (window && window.classList.contains('active')) {
    bringToFront(window);
  }
});

// Prevent text selection while dragging
document.addEventListener('selectstart', function(e) {
  if (isDragging) {
    e.preventDefault();
  }
});

// Handle window resize
window.addEventListener('resize', function() {
  const windows = document.querySelectorAll('.draggable-window.active');
  windows.forEach(window => {
    const rect = window.getBoundingClientRect();
    if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
      // Reposition window if it's outside viewport
      window.style.left = '50%';
      window.style.top = '50%';
      window.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });
});