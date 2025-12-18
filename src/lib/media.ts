// Shared media upload limits and helpers

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

export function formatBytesToMB(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  // Keep it simple and stable for UI copy
  return `${Math.round(mb)}MB`;
}

export function getUploadLimitForFile(file: File): number {
  return file.type?.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}
