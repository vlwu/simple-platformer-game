export async function loadAssets() {
  const images = {};
  const paths = {
    backgroundTile: 'assets/Background/Brown.png', // change to desired background tile
    block: 'assets/Terrain/Terrain.png',
    playerJump: 'assets/MainCharacters/PinkMan/jump.png',
    playerDoubleJump: 'assets/MainCharacters/PinkMan/double_jump.png',
    playerIdle: 'assets/MainCharacters/PinkMan/idle.png',
    playerRun: 'assets/MainCharacters/PinkMan/run.png',
    playerFall: 'assets/MainCharacters/PinkMan/fall.png',
    playerDash: 'assets/MainCharacters/PinkMan/dash.png',
    playerCling: 'assets/MainCharacters/PinkMan/wall_jump.png',

    // Fruit spritesheets (animated)
    fruit_apple: 'assets/Items/Fruits/Apple.png',
    fruit_bananas: 'assets/Items/Fruits/Bananas.png',
    fruit_cherries: 'assets/Items/Fruits/Cherries.png',
    fruit_kiwi: 'assets/Items/Fruits/Kiwi.png',
    fruit_melon: 'assets/Items/Fruits/Melon.png',
    fruit_orange: 'assets/Items/Fruits/Orange.png',
    fruit_pineapple: 'assets/Items/Fruits/Pineapple.png',
    fruit_strawberry: 'assets/Items/Fruits/Strawberry.png',
    fruit_collected: 'assets/Items/Fruits/Collected.png',  // Collected animation (applies to all fruits)

    // Menu items
    settings_button: 'assets/Menu/Buttons/Settings.png',
    close_button: 'assets/Menu/Buttons/Close.png',
    restart_button: 'assets/Menu/Buttons/Restart.png',

    // Level assets (other than fruits), all 64x64
    trophy: 'assets/Items/Checkpoints/End/End (Pressed).png',
    start: 'assets/Items/Checkpoints/Start/Start (Moving).png',
  };

  console.log('Starting asset loading...');
  
  // Track loading progress
  let loadedCount = 0;
  const totalCount = Object.keys(paths).length;
  
  const promises = Object.entries(paths).map(([key, src]) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        images[key] = img;
        loadedCount++;
        console.log(`Loaded ${key} (${loadedCount}/${totalCount})`);
        
        // Log image dimensions for debugging
        console.log(`  ${key}: ${img.width}x${img.height}`);
        resolve();
      };
      
      img.onerror = (error) => {
        console.error(`Failed to load image: ${src}`, error);
        
        // Create a fallback colored rectangle instead of failing completely
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 32;
        fallbackCanvas.height = 32;
        const fallbackCtx = fallbackCanvas.getContext('2d');
        
        // Different colors for different asset types
        if (key.includes('background')) {
          fallbackCtx.fillStyle = '#87CEEB'; // Sky blue
        } else if (key.includes('player')) {
          fallbackCtx.fillStyle = '#ff8c21ff'; // Orange
        } else if (key.includes('fruit')) {
          fallbackCtx.fillStyle = '#FF6B6B'; // Red
        } else {
          fallbackCtx.fillStyle = '#808080'; // Gray
        }
        
        fallbackCtx.fillRect(0, 0, 64, 64);
        
        // Add a simple pattern to distinguish it as a fallback
        fallbackCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        fallbackCtx.fillRect(0, 0, 32, 32);
        fallbackCtx.fillRect(32, 32, 32, 32);
        
        // Convert canvas to image
        const fallbackImg = new Image();
        fallbackImg.src = fallbackCanvas.toDataURL();
        images[key] = fallbackImg;
        
        console.warn(`Using fallback for ${key}`);
        resolve(); // Don't reject, use fallback instead
      };
      
      // Set crossOrigin before setting src to handle CORS if needed
      img.crossOrigin = 'anonymous';
      img.src = src;
      
      // Add timeout to prevent hanging on broken images
      setTimeout(() => {
        if (!images[key]) {
          img.onerror(new Error('Image loading timeout'));
        }
      }, 10000); // 10 second timeout
    });
  });

  try {
    await Promise.all(promises);
    console.log('All assets loaded successfully!');
    console.log('Available assets:', Object.keys(images));
    return images;
  } catch (error) {
    console.error('Asset loading failed:', error);
    throw error;
  }
}

// Utility function to check if an asset exists and is loaded
export function isAssetLoaded(assets, key) {
  return assets && assets[key] && assets[key].complete;
}

// Utility function to get asset dimensions
export function getAssetDimensions(assets, key) {
  if (!isAssetLoaded(assets, key)) {
    return { width: 0, height: 0 };
  }
  
  const asset = assets[key];
  return {
    width: asset.width,
    height: asset.height
  };
}

// Utility function to create a simple colored fallback image
export function createFallbackImage(width = 64, height = 64, color = '#808080') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Add a simple pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, 0, width/2, height/2);
  ctx.fillRect(width/2, height/2, width/2, height/2);
  
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}