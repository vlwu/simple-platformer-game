import { Engine } from './core/engine.js';
import { loadAssets } from './core/assets.js';

// Get canvas element and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Check if canvas is available
if (!canvas || !ctx) {
  console.error('Canvas not found or context not available');
  document.body.innerHTML = '<h1>Error: Canvas not supported</h1>';
  throw new Error('Canvas not available');
}

// Desired base resolution
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

// Set canvas internal resolution
canvas.width = BASE_WIDTH;
canvas.height = BASE_HEIGHT;

console.log(`Canvas initialized: ${BASE_WIDTH}x${BASE_HEIGHT}`);

// Maintain 16:9 aspect ratio and center canvas
function resizeCanvas() {
  try {
    const aspectRatio = 16 / 9;
    const windowRatio = window.innerWidth / window.innerHeight;
    let width, height;

    if (windowRatio > aspectRatio) {
      // Window is wider than 16:9 - constrain by height
      height = window.innerHeight;
      width = height * aspectRatio;
    } else {
      // Window is taller than 16:9 - constrain by width
      width = window.innerWidth;
      height = width / aspectRatio;
    }

    // Apply calculated dimensions
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.position = 'absolute';
    canvas.style.left = `${(window.innerWidth - width) / 2}px`;
    canvas.style.top = `${(window.innerHeight - height) / 2}px`;

    console.log(`Canvas resized to: ${width}x${height} (display size)`);
  } catch (error) {
    console.error('Error resizing canvas:', error);
  }
}

// Set up resize listener
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Prevent context menu on right click for better game experience
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Add loading indicator
function showLoadingIndicator() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Loading Assets...', canvas.width / 2, canvas.height / 2);
  
  // Simple loading bar
  const barWidth = 300;
  const barHeight = 20;
  const barX = (canvas.width - barWidth) / 2;
  const barY = canvas.height / 2 + 30;
  
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(barX, barY, barWidth * 0.1, barHeight); // Will be updated with actual progress
}

// Show initial loading screen
showLoadingIndicator();

// --- Settings and Keybinds Logic ---
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeModalButton = document.getElementById('closeModalButton');
const keybindInputs = document.querySelectorAll('.keybind-item input');

// Default keybinds
let keybinds = {
  moveLeft: 'a',
  moveRight: 'd',
  jump: 'w',
  dash: ' ', // Spacebar
};

let activeKeybindInput = null; // To track which input is currently being rebound

// Function to update the displayed keybinds in the modal
function updateKeybindDisplay() {
  keybindInputs.forEach(input => {
    const action = input.dataset.action;
    input.value = keybinds[action] === ' ' ? 'Space' : keybinds[action].toUpperCase();
  });
}

// Function to toggle the settings modal visibility
function toggleSettingsModal() {
  settingsModal.classList.toggle('hidden');
  if (!settingsModal.classList.contains('hidden')) {
    // When modal opens, update display and disable game input
    updateKeybindDisplay();
    // Potentially pause the game engine here if it's running
    if (typeof engine !== 'undefined' && engine.isRunning) {
      engine.pause();
    }
  } else {
    // When modal closes, re-enable game input
    if (typeof engine !== 'undefined' && !engine.isRunning) {
      engine.resume();
    }
  }
}

// Event listener for settings button
settingsButton.addEventListener('click', toggleSettingsModal);

// Event listener for close modal button
closeModalButton.addEventListener('click', toggleSettingsModal);

// Event listeners for keybind inputs
keybindInputs.forEach(input => {
  input.addEventListener('click', () => {
    if (activeKeybindInput) {
      // If another input was active, reset its styling
      activeKeybindInput.classList.remove('active-rebind');
    }
    activeKeybindInput = input;
    input.value = 'Press a key...';
    input.classList.add('active-rebind');
  });
});

// Global keydown listener for remapping keybinds
window.addEventListener('keydown', (e) => {
  if (activeKeybindInput && !settingsModal.classList.contains('hidden')) {
    e.preventDefault(); // Prevent default browser action for the key
    const action = activeKeybindInput.dataset.action;
    const newKey = e.key.toLowerCase();

    // Basic validation: prevent empty or modifier keys alone
    if (newKey && newKey.length <= 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      keybinds[action] = newKey;
      updateKeybindDisplay();
      activeKeybindInput.classList.remove('active-rebind');
      activeKeybindInput = null;

      // Update the engine's keybinds immediately
      if (typeof engine !== 'undefined') {
        engine.updateKeybinds(keybinds);
      }
    } else {
      // If an invalid key was pressed, revert the input field
      activeKeybindInput.value = keybinds[action] === ' ' ? 'Space' : keybinds[action].toUpperCase();
      activeKeybindInput.classList.remove('active-rebind');
      activeKeybindInput = null;
    }
  }
});

// Load assets and start the game
let engine; // Declare engine in a scope accessible to modal functions
loadAssets().then((assets) => {
  console.log('Assets loaded successfully, starting game...');
  
  try {
    // Initialize and start the game engine, passing keybinds
    engine = new Engine(ctx, canvas, assets, keybinds);
    engine.start();
    
    console.log('Game started successfully!');
  } catch (error) {
    console.error('Failed to start game engine:', error);
    
    // Show error message on canvas
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'red';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Failed to Start', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    ctx.fillText('Check console for details', canvas.width / 2, canvas.height / 2 + 20);
  }
  
}).catch((error) => {
  console.error("Asset loading failed:", error);
  
  // Show error message on canvas
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'red';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Failed to Load Assets', canvas.width / 2, canvas.height / 2 - 20);
  
  ctx.fillStyle = 'white';
  ctx.font = '16px sans-serif';
  ctx.fillText('Check console for details', canvas.width / 2, canvas.height / 2 + 20);
});

// Add some basic error handling for the window
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add some debug info
console.log('Game initialization started');
console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
console.log('Device pixel ratio:', window.devicePixelRatio);
console.log('User agent:', navigator.userAgent);