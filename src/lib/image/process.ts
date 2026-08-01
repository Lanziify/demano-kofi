import sharp from "sharp";

export async function processProfileImage(buffer: Buffer) {
  return sharp(buffer)
    .resize(512, 512, {
      fit: "cover",
      position: "center",
    })
    .webp({
      quality: 85,
    })
    .toBuffer();
}