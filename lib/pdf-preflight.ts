export const countPdfPagesFromBytes = (bytes: Uint8Array) => {
  let binary = "";
  const chunkSize = 32_768;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return Math.max(1, binary.match(/\/Type\s*\/Page\b/g)?.length ?? 0);
};

export const countPdfPages = async (blob: Blob) =>
  countPdfPagesFromBytes(new Uint8Array(await blob.arrayBuffer()));
