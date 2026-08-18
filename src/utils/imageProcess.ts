/**
 * Helper utility to remove solid black or near-black background from an image.
 * It uses a BFS flood-fill starting from the image borders (outer perimeter)
 * to only make the background transparent, while preserving black text or shapes
 * inside the logo itself.
 */
export const removeBlackBackground = (logoUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!logoUrl) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(logoUrl);
          return;
        }
        
        // Draw the original image onto the canvas
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Threshold check for near-black pixels.
        // We check if RGB values are below 50, which includes solid black (0, 0, 0)
        // and dark compression artifacts/shadows.
        const isNearBlack = (r: number, g: number, b: number, a: number): boolean => {
          if (a < 10) return false; // Already mostly transparent
          return r < 50 && g < 50 && b < 50;
        };
        
        const visited = new Uint8Array(width * height);
        const queue: [number, number][] = [];
        
        const pushPixel = (x: number, y: number) => {
          const idx = y * width + x;
          if (!visited[idx]) {
            const pixelIdx = idx * 4;
            if (isNearBlack(data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2], data[pixelIdx + 3])) {
              visited[idx] = 1;
              queue.push([x, y]);
            }
          }
        };
        
        // Push all border pixels (top/bottom rows and left/right columns) as seeds for flood fill
        for (let x = 0; x < width; x++) {
          pushPixel(x, 0);
          pushPixel(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          pushPixel(0, y);
          pushPixel(width - 1, y);
        }
        
        // Run Breadth-First Search (BFS) to flood fill the background
        let head = 0;
        while (head < queue.length) {
          const [cx, cy] = queue[head++];
          const idx = (cy * width + cx) * 4;
          
          // Make this background pixel transparent
          data[idx + 3] = 0; 
          
          // Check 4-connected neighbors
          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1],
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (!visited[nidx]) {
                const pixelIdx = nidx * 4;
                if (isNearBlack(data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2], data[pixelIdx + 3])) {
                  visited[nidx] = 1;
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }
        
        // Write the transparent image data back to the canvas
        ctx.putImageData(imgData, 0, 0);
        
        // Convert to a transparent PNG Base64 string
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        console.warn('Failed to remove black background from logo:', error);
        resolve(logoUrl); // Fallback to original logo URL in case of CORS or canvas error
      }
    };
    
    img.onerror = () => {
      resolve(logoUrl);
    };
    
    img.src = logoUrl;
  });
};
