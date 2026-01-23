import sharp from "sharp";
import path from "path";

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace(/(\.\w+)$/, "-resized$1");

if (!inputFile) {
  console.log("Usage: npx tsx scripts/resize-screenshot.ts <input> [output]");
  console.log("Example: npx tsx scripts/resize-screenshot.ts docs/screenshot.png docs/desktop-1.png");
  process.exit(1);
}

async function resizeToShopify(input: string, output: string) {
  const targetWidth = 1600;
  const targetHeight = 900;

  const image = sharp(input);
  const metadata = await image.metadata();

  console.log(`Input: ${input}`);
  console.log(`Original size: ${metadata.width}x${metadata.height}`);

  // Calculate aspect ratios
  const targetRatio = targetWidth / targetHeight; // 16:9
  const imageRatio = (metadata.width || 1) / (metadata.height || 1);

  let resizedImage;

  if (imageRatio > targetRatio) {
    // Image is wider than target - fit by height, then crop width
    resizedImage = image
      .resize({
        height: targetHeight,
        fit: "cover",
      })
      .extract({
        left: Math.floor(((metadata.width || 0) * (targetHeight / (metadata.height || 1)) - targetWidth) / 2),
        top: 0,
        width: targetWidth,
        height: targetHeight,
      });
  } else {
    // Image is taller than target - fit by width, then crop height
    resizedImage = image.resize({
      width: targetWidth,
      height: targetHeight,
      fit: "cover",
      position: "top", // Keep top of image (header/nav)
    });
  }

  await resizedImage.toFile(output);

  const outputMetadata = await sharp(output).metadata();
  console.log(`Output: ${output}`);
  console.log(`New size: ${outputMetadata.width}x${outputMetadata.height}`);
}

resizeToShopify(inputFile, outputFile).catch(console.error);
