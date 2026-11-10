export const THEME_PRESETS = [
  { id: 'light', label: 'Pastel', dark: false },
  { id: 'white', label: 'Pure White', dark: false, palette: { background: '#ffffff', surface: '#ffffff', subtle: '#f7f7f7', foreground: '#191919', muted: '#626262', line: '#dddddd', accent: '#3286e5', 'pastel-a': '#ffffff', 'pastel-b': '#ffffff', 'pastel-c': '#ffffff', 'pastel-d': '#ffffff' } },
  { id: 'black', label: 'AMOLED Black', dark: true, palette: { background: '#000000', surface: '#090909', subtle: '#151515', foreground: '#fafafa', muted: '#b5b5b5', line: '#303030', accent: '#9363d4', 'pastel-a': '#191919', 'pastel-b': '#191919', 'pastel-c': '#191919', 'pastel-d': '#191919' } },
  { id: 'nord', label: 'Nord', dark: true, palette: { background: '#2e3440', surface: '#3b4252', subtle: '#434c5e', foreground: '#eceff4', muted: '#d8dee9', line: '#4c566a', accent: '#5e81ac', 'pastel-a': '#434c5e', 'pastel-b': '#3b4252', 'pastel-c': '#3b4c52', 'pastel-d': '#4c4352' } },
  { id: 'dracula', label: 'Dracula', dark: true, palette: { background: '#282a36', surface: '#303341', subtle: '#44475a', foreground: '#f8f8f2', muted: '#bfc3d6', line: '#6272a4', accent: '#bd93f9', 'pastel-a': '#443950', 'pastel-b': '#494334', 'pastel-c': '#30463e', 'pastel-d': '#4c3549' } },
  { id: 'system', label: 'System', dark: false },
];
export function normalizeTheme(theme) {
  if (theme === 'dark') return 'black';
  return THEME_PRESETS.some(preset => preset.id === theme) ? theme : 'black';
}
export function applyAppearance(settings = {}) {
  const root = document.documentElement;
  const theme = normalizeTheme(settings.theme);
  const preset = THEME_PRESETS.find(item => item.id === theme);
  root.dataset.theme = (theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : preset.dark) ? 'dark' : 'light';
  root.dataset.themePreset = theme;
  root.dataset.accent = settings.accent || 'blue';
  root.dataset.motion = settings.motion || 'normal';
  root.dataset.cardStyle = ['classic', 'inbox', 'image'].includes(settings.cardStyle) ? settings.cardStyle : 'classic';
  for (const key of ['background','surface','subtle','foreground','muted','line','field','accent','pastel-a','pastel-b','pastel-c','pastel-d','workspace-radius','workspace-font']) root.style.removeProperty('--' + key);
  if (preset.palette) {
    for (const [key, value] of Object.entries(preset.palette)) root.style.setProperty('--' + key, value);
    root.style.setProperty('--field', preset.palette.line);
  }
}
