const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration
const SIZE = 1200;

// Colors
const NEURAL_BLUE = '#2563EB';
const APEX_PURPLE = '#7C3AED';
const WHITE = '#FFFFFF';

// Create canvas
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Create gradient background
const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
gradient.addColorStop(0, NEURAL_BLUE);
gradient.addColorStop(1, APEX_PURPLE);
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, SIZE, SIZE);

// Add subtle radial glow
const radialGradient = ctx.createRadialGradient(SIZE/2, SIZE/2 - 100, 0, SIZE/2, SIZE/2 - 100, SIZE/1.2);
radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
radialGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
ctx.fillStyle = radialGradient;
ctx.fillRect(0, 0, SIZE, SIZE);

// Draw large stylized "C" with circuit/AI pattern as the logo mark
const logoX = SIZE / 2;
const logoY = 350;

ctx.fillStyle = WHITE;
ctx.strokeStyle = WHITE;

// Large C shape
ctx.lineWidth = 60;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.arc(logoX, logoY, 180, Math.PI * 0.25, Math.PI * 1.75);
ctx.stroke();

// AI nodes on the C
const nodePositions = [
  { angle: Math.PI * 0.5, size: 35 },
  { angle: Math.PI * 1.0, size: 35 },
  { angle: Math.PI * 1.5, size: 35 },
];

nodePositions.forEach(node => {
  const x = logoX + 180 * Math.cos(node.angle);
  const y = logoY + 180 * Math.sin(node.angle);
  ctx.beginPath();
  ctx.arc(x, y, node.size, 0, Math.PI * 2);
  ctx.fill();
});

// Center AI node
ctx.beginPath();
ctx.arc(logoX, logoY, 50, 0, Math.PI * 2);
ctx.fill();

// Connection lines from center to nodes
ctx.lineWidth = 12;
ctx.globalAlpha = 0.5;
nodePositions.forEach(node => {
  const x = logoX + 180 * Math.cos(node.angle);
  const y = logoY + 180 * Math.sin(node.angle);
  ctx.beginPath();
  ctx.moveTo(logoX, logoY);
  ctx.lineTo(x, y);
  ctx.stroke();
});
ctx.globalAlpha = 1;

// Main text "ConversionAI" - Using extreme font size
ctx.fillStyle = WHITE;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Set explicit font with pixel size
ctx.font = 'bold 155px Arial, Helvetica, sans-serif';

// Draw main text
const mainTextY = 720;
ctx.fillText('ConversionAI', SIZE / 2, mainTextY);

// Subtitle
ctx.font = 'bold 70px Arial, Helvetica, sans-serif';
ctx.globalAlpha = 0.9;
ctx.fillText('by ApexMind', SIZE / 2, 870);
ctx.globalAlpha = 1;

// Tagline
ctx.font = '45px Arial, Helvetica, sans-serif';
ctx.globalAlpha = 0.7;
ctx.fillText('AI-Powered CRO', SIZE / 2, 1020);
ctx.globalAlpha = 1;

// Save the image
const outputDir = path.join(__dirname, '../submission-materials');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(outputDir, 'icon-1200x1200-v2.png');
fs.writeFileSync(outputPath, buffer);

console.log(`Icon generated successfully: ${outputPath}`);
console.log(`Size: ${SIZE}x${SIZE} pixels`);
console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
