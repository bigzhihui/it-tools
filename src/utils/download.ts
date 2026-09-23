// Downloads a file made in the page. A blob URL rather than a base64 data URL:
// files can be large, and base64 would inflate them by a third and hold two
// copies in memory.
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  // Revoke on the next tick, once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
