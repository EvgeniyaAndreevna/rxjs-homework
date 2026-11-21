import { interval, of, defer, startWith, exhaustMap, catchError } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { apiPath, escapeHTML, shortSubject, formatTimestamp, initials, icon } from './utils.js';
import { demoUnread } from './demoData.js';

// Состояние сохраняется при переходе между вкладками, пока открыта страница.
const state = { messages: [], seen: new Set(), requests: 0, lastReceived: null, expanded: new Set() };

export class PollingWidget {
  constructor(root, config) {
    this.root = root;
    this.config = config;
    this.subscription = null;
    this.render();
    this.start();
  }
  getResponse$() {
    if (this.config.mode === 'demo') return defer(() => of(demoUnread()));
    return ajax.getJSON(apiPath(this.config, '/messages/unread')).pipe(
      // Недоступный сервер или не-200 обрабатываем как отсутствие новых сообщений.
      catchError(() => of({ status: 'ok', messages: [] })),
    );
  }
  start() {
    // interval обязателен по условию; startWith запускает первый запрос сразу.
    this.subscription = interval(5000).pipe(
      startWith(-1),
      exhaustMap(() => this.getResponse$()),
    ).subscribe((response) => {
      state.requests += 1;
      state.lastReceived = Date.now();
      const incoming = Array.isArray(response?.messages) ? response.messages : [];
      for (const message of incoming) {
        if (!message?.id || state.seen.has(message.id)) continue;
        state.seen.add(message.id);
        // Новые сообщения ставим перед старыми.
        state.messages.unshift(message);
      }
      this.update();
    });
  }
  render() {
    this.root.innerHTML = `
      <div class="workspace-grid polling-grid">
        <section class="panel inbox-panel">
          <div class="panel-heading row-wrap">
            <div><div class="eyebrow">INBOX · LIVE</div><h2>Входящие сообщения</h2><p>Новые письма появляются вверху каждые 5 секунд</p></div>
            <div class="live-pill"><span class="live-dot"></span>${this.config.mode === 'demo' ? 'Демо-данные' : 'REST API'}</div>
          </div>
          <div class="inbox-toolbar"><div class="search-faux">${icon('search', 17)}<span>Список непрочитанных</span></div><span id="inbox-count" class="pill-count">0 писем</span></div>
          <div class="table-scroll"><table class="inbox-table"><thead><tr><th>Отправитель</th><th>Тема</th><th>Получено</th><th></th></tr></thead><tbody id="inbox-rows"></tbody></table></div>
          <div id="inbox-empty" class="empty-state" hidden><span class="empty-icon">${icon('inbox', 28)}</span><strong>Пока ничего нового</strong><p>Ожидаем свежие сообщения от сервера.</p></div>
          <div class="panel-footer"><span class="soft-dot"></span><span id="last-check">Ожидаем первое обновление…</span><span class="footer-right">RxJS · interval + ajax</span></div>
        </section>
        <aside class="side-column">
          <div class="panel status-card"><div class="small-label">Мониторинг</div><div class="status-circle">${icon('signal', 29)}</div><h3>Проверка почты</h3><p>Автоматический опрос REST endpoint <code>/messages/unread</code>.</p><div class="status-details"><div><span>Интервал</span><strong>5 сек.</strong></div><div><span>Запросов</span><strong id="requests-count">0</strong></div><div><span>Найдено писем</span><strong id="messages-count">0</strong></div></div></div>
          <div class="panel guide-card"><div class="guide-top">${icon('spark', 19)}<span>Как это работает</span></div><p>Используем <strong>interval</strong> для таймера, <strong>exhaustMap</strong> для запросов и <strong>catchError</strong>, чтобы ошибки не останавливали поток.</p><div class="code-line">interval(5000).pipe(…)</div></div>
        </aside>
      </div>`;
    this.root.querySelector('#inbox-rows').addEventListener('click', (event) => {
      const row = event.target.closest('tr[data-message-id]');
      if (!row) return;
      const id = row.dataset.messageId;
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);
      this.update();
    });
    this.update();
  }
  update() {
    const rows = this.root.querySelector('#inbox-rows');
    if (!rows) return;
    rows.innerHTML = state.messages.map((msg) => {
      const expanded = state.expanded.has(msg.id);
      return `<tr class="mail-row ${expanded ? 'expanded' : ''}" data-message-id="${escapeHTML(msg.id)}" tabindex="0" aria-expanded="${expanded}" title="Показать текст письма"><td><span class="mail-avatar">${escapeHTML(initials(msg.from))}</span><span class="from-label">${escapeHTML(msg.from)}</span></td><td><span class="mail-subject" title="${escapeHTML(msg.subject || '')}">${escapeHTML(shortSubject(msg.subject))}</span><span class="mail-description">${escapeHTML(expanded ? msg.body || 'Нет текста' : 'Нажмите, чтобы прочитать')}</span></td><td class="date-cell">${formatTimestamp(msg.received)}</td><td class="row-arrow">${icon('chevron', 16)}</td></tr>`;
    }).join('');
    this.root.querySelector('#inbox-count').textContent = `${state.messages.length} писем`;
    this.root.querySelector('#requests-count').textContent = String(state.requests);
    this.root.querySelector('#messages-count').textContent = String(state.messages.length);
    this.root.querySelector('#last-check').textContent = state.lastReceived
      ? `Последнее обновление ${new Date(state.lastReceived).toLocaleTimeString('ru-RU')}`
      : 'Ожидаем первое обновление…';
    this.root.querySelector('#inbox-empty').hidden = state.messages.length > 0;
    this.root.querySelector('.table-scroll').hidden = state.messages.length === 0;
  }
  destroy() { this.subscription?.unsubscribe(); this.subscription = null; }
}
