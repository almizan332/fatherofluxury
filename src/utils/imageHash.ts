// Compute 64-bit average hash (aHash) of an image in the browser using canvas.
// Returns the hash as an unsigned BigInt string (so it survives JSON).

export async function computeAHashFromFile(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return computeAHashFromDataUrl(dataUrl);
}

export async function computeAHashFromDataUrl(dataUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 8, 8);
  const { data } = ctx.getImageData(0, 0, 8, 8);

  const grays: number[] = [];
  let total = 0;
  for (let i = 0; i < 64; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const gray = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
    grays.push(gray);
    total += gray;
  }
  const avg = total / 64;
  let hash = 0n;
  for (let i = 0; i < 64; i++) {
    if (grays[i] >= avg) hash |= 1n << BigInt(63 - i);
  }
  return hash.toString();
}

// Convert an unsigned 64-bit BigInt string to a signed bigint string (Postgres bigint range).
export function unsignedToSignedBigIntString(unsigned: string): string {
  const u = BigInt(unsigned);
  const MAX = 1n << 63n;
  const signed = u >= MAX ? u - (1n << 64n) : u;
  return signed.toString();
}
