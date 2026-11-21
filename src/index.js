import './styles.css';
import orbitLogo from './assets/orbit.svg';
import { PollingWidget } from './modules/polling.js';
import { PostsWidget } from './modules/posts.js';
import { DashboardWidget } from './modules/dashboard.js';
import { formatNow, icon } from './modules/utils.js';

const STORAGE_KEY = 'netology-rxjs-workspace-config';
const defaultConfig = { mode: __PRODUCTION__ ? 'demo' : 'api', base: '' };
let config;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  config = saved && ['demo', 'api'].includes(saved.mode) ? { ...defaultConfig, ...saved } : defaultConfig;
} catch { config = defaultConfig; }

const views = {
  polling: { eyebrow: '01 / POLLING', title: 'Входящие сообщения', description: 'Новые письма доставляются автоматически — и остаются в ленте.', tag: 'Polling' },
  posts: { eyebrow: '02 / POSTS WITH COMMENTS', title: 'Командные публикации', description: 'Подгружаем посты и последние комментарии в одном RxJS-потоке.', tag: 'Posts + comments' },
  dashboard: { eyebrow: '03 / STATE MANAGEMENT', title: 'Проекты и задачи', description: 'Отдельные виджеты. Один источник правды. Мгновенная синхронизация.', tag: 'Dashboard' },
};
const app = document.querySelector('#app');
app.innerHTML = `
<div class="app-layout">
 <aside class="sidebar">
  <div class="brand"><img src="${orbitLogo}" alt="Orbit Desk" width="44" height="44"><div><strong>orbit<span>desk</span></strong><small>RxJS WORKSPACE</small></div></div>
  <div class="sidebar-section-label">WORKSPACE</div>
  <nav class="main-nav" aria-label="Основная навигация">
   <button class="nav-item active" data-view="polling">${icon('inbox', 19)} <span>Сообщения</span><span class="nav-counter">01</span></button>
   <button class="nav-item" data-view="posts">${icon('users', 19)} <span>Публикации</span><span class="nav-counter">02</span></button>
   <button class="nav-item" data-view="dashboard">${icon('layout', 19)} <span>Проекты</span><span class="nav-counter">03</span></button>
  </nav>
  <div class="sidebar-section-label more-label">ИЗУЧАЕМ В ПРОЕКТЕ</div>
  <div class="sidebar-notes"><span>${icon('check', 16)} RxJS Observables</span><span>${icon('check', 16)} REST API + AJAX</span><span>${icon('check', 16)} State Management</span></div>
  <div class="sidebar-bottom"><div class="sidebar-course"><div class="course-icon">N</div><div><strong>Нетология</strong><small>Занятие № 11 · RxJS</small></div></div><p>Учебный проект · AHJ</p></div>
 </aside>
 <div class="main-area">
  <header class="topbar"><div class="topbar-location">Рабочая панель <span>/</span> <strong id="current-location">Сообщения</strong></div><div class="topbar-actions"><span class="today" id="today"></span><span id="source-mode" class="source-mode"></span><button id="open-settings" type="button" class="icon-button" aria-label="Настройки API" title="Настройки API">${icon('settings', 19)}</button></div></header>
  <main class="main-content">
   <section class="hero"><div class="hero-top"><div><span class="hero-eyebrow" id="hero-eyebrow">01 / POLLING</span><h1 id="hero-title">Входящие сообщения</h1><p id="hero-description">Новые письма доставляются автоматически — и остаются в ленте.</p></div><span class="hero-symbol">${icon('spark', 30)}</span></div><div class="hero-stats"><div><span class="stat-icon">${icon('layout', 18)}</span><div><strong>3 модуля</strong><small>один репозиторий</small></div></div><div><span class="stat-icon">${icon('clock', 18)}</span><div><strong>5 секунд</strong><small>интервал опроса</small></div></div><div><span class="stat-icon">${icon('signal', 18)}</span><div><strong>RxJS 7</strong><small>реактивная логика</small></div></div></div></section>
   <div class="content-kicker"><span class="content-kicker-dot"></span><span id="view-tag">Polling</span><span class="kicker-line"></span><span id="view-tag-right" class="kicker-right">АКТИВНЫЙ МОДУЛЬ</span></div>
   <div id="view-root"></div>
   <footer class="page-bottom"><span>© 2026 Orbit Desk · Учебный проект</span><span>Netology AHJ · Lesson 11</span></footer>
  </main>
 </div>
</div>
<div id="settings-overlay" class="settings-overlay" hidden>
 <div class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
  <div class="modal-header"><div class="modal-symbol">${icon('settings', 21)}</div><div><h2 id="settings-title">Источник данных</h2><p>Настройка локального сервера и демо-режима</p></div><button id="close-settings" type="button" class="icon-button" aria-label="Закрыть">${icon('x', 19)}</button></div>
  <form id="settings-form">
   <label class="mode-option"><input name="mode" type="radio" value="demo"><span class="mode-radio"></span><span><strong>Демо-режим</strong><small>Письма и посты генерируются в браузере. Работает на GitHub Pages.</small></span></label>
   <label class="mode-option"><input name="mode" type="radio" value="api"><span class="mode-radio"></span><span><strong>REST API</strong><small>Реальные HTTP-запросы к вашему backend.</small></span></label>
   <label for="api-base" class="input-label">Адрес backend (необязательно при локальном proxy)</label><input id="api-base" type="text" placeholder="https://example.vercel.app" autocomplete="off"><p class="input-hint">Для локальной разработки оставьте поле пустым: Webpack проксирует запросы на порт 7071. Для GitHub Pages укажите HTTPS-адрес.</p>
   <div class="modal-actions"><button class="button outline" id="cancel-settings" type="button">Отмена</button><button class="button primary" type="submit">${icon('check', 17)} Сохранить</button></div>
  </form>
 </div>
</div>`;

let activeView = 'polling';
let widget = null;
const viewRoot = document.querySelector('#view-root');
const overlay = document.querySelector('#settings-overlay');
const form = document.querySelector('#settings-form');
const baseInput = document.querySelector('#api-base');
function renderMode() {
  document.querySelector('#source-mode').innerHTML = `<span class="mode-dot"></span>${config.mode === 'demo' ? 'Демо-данные' : 'REST API'}`;
}
function selectView(view) {
  if (!views[view]) return;
  widget?.destroy?.();
  activeView = view;
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
    button.setAttribute('aria-current', button.dataset.view === view ? 'page' : 'false');
  });
  const meta = views[view];
  document.querySelector('#current-location').textContent = meta.tag;
  document.querySelector('#hero-eyebrow').textContent = meta.eyebrow;
  document.querySelector('#hero-title').textContent = meta.title;
  document.querySelector('#hero-description').textContent = meta.description;
  document.querySelector('#view-tag').textContent = meta.tag;
  document.title = `${meta.title} · Orbit Desk`;
  viewRoot.innerHTML = '';
  if (view === 'polling') widget = new PollingWidget(viewRoot, config);
  if (view === 'posts') widget = new PostsWidget(viewRoot, config);
  if (view === 'dashboard') widget = new DashboardWidget(viewRoot);
}

document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => selectView(button.dataset.view)));
document.querySelector('#today').textContent = formatNow();
renderMode();
selectView('polling');
function closeSettings() { overlay.hidden = true; }
function openSettings() {
  form.querySelector(`input[name="mode"][value="${config.mode}"]`).checked = true;
  baseInput.value = config.base || '';
  baseInput.disabled = config.mode === 'demo';
  overlay.hidden = false;
}
document.querySelector('#open-settings').addEventListener('click', openSettings);
document.querySelector('#close-settings').addEventListener('click', closeSettings);
document.querySelector('#cancel-settings').addEventListener('click', closeSettings);
overlay.addEventListener('click', (event) => { if (event.target === overlay) closeSettings(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.hidden) closeSettings(); });
form.querySelectorAll('input[name="mode"]').forEach((radio) => radio.addEventListener('change', () => {
  baseInput.disabled = form.elements.mode.value === 'demo';
}));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  config = { mode: form.elements.mode.value, base: baseInput.value.trim() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* режим приватности */ }
  renderMode();
  closeSettings();
  selectView(activeView);
});
