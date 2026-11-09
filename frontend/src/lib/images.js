export const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function checkImages(currentCount, picked) {
  if (currentCount + picked.length > MAX_FILES) {
    return `You can have up to ${MAX_FILES} images`;
  }
  if (picked.some((f) => !TYPES.includes(f.type))) {
    return 'Only JPG, PNG, WEBP or GIF images are allowed';
  }
  if (picked.some((f) => f.size > MAX_SIZE)) {
    return 'Each image must be 5MB or smaller';
  }
  return '';
}