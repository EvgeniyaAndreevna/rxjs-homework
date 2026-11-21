export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
export function shortSubject(subject) {
  const value = String(subject || 'Без темы');
  return value.length > 15 ? `${value.slice(0, 15)}…` : value;
}
export function formatTimestamp(seconds) {
  const date = new Date(Number(seconds) * 1000);
  if (!Number.isFinite(date.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}
export function formatNow() {
  const date = new Date();
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}
export function initials(name = '') {
  const chunks = String(name).split(/[\s@._-]+/).filter(Boolean);
  return (chunks.length >= 2 ? chunks[0][0] + chunks[1][0] : chunks[0]?.slice(0, 2) || '?').toUpperCase();
}
export function apiPath(config, path) {
  if (config.mode === 'demo') return path;
  const base = (config.base || '').trim().replace(/\/+$/, '');
  return `${base}${path}`;
}
export function icon(name, size = 20) {
  const paths = {
    inbox: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 13h5l2 3h4l2-3h5"/>',
    layout: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 6a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5"/>',
    rotate: '<path d="M20 11a8 8 0 1 0-2.6 6"/><path d="M20 4v7h-7"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l-1.7 1.7a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6h-2.4a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4l-1.7-1.7a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.1v-2.4a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2L9.5 6.7a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.6H15a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l1.7 1.7a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1v2.4a1.8 1.8 0 0 0-1.6 1.1Z" transform="translate(-1.8 -1.5) scale(1.12)"/>',
    spark: '<path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2ZM20 17l.7 2.3L23 20l-2.3.7L20 23l-.7-2.3L18 20l1.3-.7L20 17Z"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 7 9 7 9-7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    signal: '<path d="M4 17v3M9 13v7M14 9v11M19 4v16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 5 5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    file: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 8h8M8 13h8M8 17h5"/>',
    heart: '<path d="M20.8 4.6a5.3 5.3 0 0 0-7.4 0L12 6l-1.4-1.4a5.3 5.3 0 0 0-7.4 7.4L12 21l8.8-9a5.3 5.3 0 0 0 0-7.4Z"/>',
    x: '<path d="M5 5l14 14M19 5 5 19"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;
}
