import { of, forkJoin, map, switchMap, catchError } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { apiPath, escapeHTML, formatTimestamp, initials, icon } from './utils.js';
import { demoPosts, demoComments } from './demoData.js';
import postPlanning from '../assets/post-planning.svg';
import postProduct from '../assets/post-product.svg';
import postReview from '../assets/post-review.svg';

const localImages = { 'post-1': postPlanning, 'post-2': postProduct, 'post-3': postReview };
const avatarClasses = ['mint', 'lilac', 'peach'];

export class PostsWidget {
  constructor(root, config) {
    this.root = root;
    this.config = config;
    this.subscription = null;
    this.render();
    this.load();
  }
  posts$() {
    return this.config.mode === 'demo' ? of(demoPosts()) : ajax.getJSON(apiPath(this.config, '/posts/latest'));
  }
  comments$(id) {
    return this.config.mode === 'demo' ? of(demoComments(id)) : ajax.getJSON(apiPath(this.config, `/posts/${encodeURIComponent(id)}/comments/latest`));
  }
  load() {
    this.subscription?.unsubscribe();
    this.root.querySelector('#posts-cards').innerHTML = '<div class="post-skeleton"><div></div><div></div><div></div></div>';
    this.root.querySelector('#posts-status').textContent = 'Загружаем посты и комментарии…';
    // subscribe получает уже дополненные комментариями посты (требование задания).
    this.subscription = this.posts$().pipe(
      map((response) => Array.isArray(response?.data) ? response.data.slice(0, 10) : []),
      switchMap((posts) => posts.length ? forkJoin(posts.map((post) =>
        this.comments$(post.id).pipe(map((response) => ({ ...post, comments: Array.isArray(response?.data) ? response.data.slice(0, 3) : [] })))
      )) : of([])),
      catchError(() => of(null)),
    ).subscribe((postsWithComments) => {
      if (postsWithComments === null) {
        this.root.querySelector('#posts-status').textContent = 'Не удалось получить данные от сервера. Переключитесь на демо-режим в настройках.';
        this.root.querySelector('#posts-cards').innerHTML = `<div class="empty-panel">${icon('info', 24)} <strong>Ошибка загрузки</strong><span>Проверьте адрес API или используйте демо-режим.</span></div>`;
        return;
      }
      this.root.querySelector('#posts-status').textContent = `Постов: ${postsWithComments.length} · комментарии загружены вместе с публикациями`;
      this.root.querySelector('#posts-cards').innerHTML = postsWithComments.length
        ? postsWithComments.map((post, i) => this.renderPost(post, i)).join('')
        : '<div class="empty-panel">Пока нет публикаций</div>';
    });
  }
  renderPost(post, index) {
    const src = localImages[post.id] || (typeof post.image === 'string' && /^https:\/\//.test(post.image) ? post.image : '');
    const comments = Array.isArray(post.comments) ? post.comments : [];
    return `<article class="panel social-post">
      <div class="post-head"><span class="profile-avatar ${avatarClasses[index % avatarClasses.length]}">${escapeHTML(initials(post.author))}</span><div class="post-author"><strong>${escapeHTML(post.author)}</strong><small>${formatTimestamp(post.created)} · Команда продукта</small></div><div class="more-badge">ПУБЛИКАЦИЯ</div></div>
      <h3>${escapeHTML(post.title)}</h3><p class="post-copy">${escapeHTML(post.text || '')}</p>
      ${src ? `<img class="post-art" src="${escapeHTML(src)}" alt="Иллюстрация к публикации" loading="lazy">` : ''}
      <div class="post-interactions"><span>${icon('heart', 17)} <span>Новая публикация</span></span><span>${icon('mail', 17)} <span>${comments.length} комментария</span></span></div>
      <div class="comments-heading">Последние комментарии <span>${comments.length}</span></div>
      <div class="comments-list">${comments.length ? comments.map((comment) => `<div class="comment-row"><span class="comment-avatar">${escapeHTML(initials(comment.author))}</span><div class="comment-body"><div><strong>${escapeHTML(comment.author)}</strong><small>${formatTimestamp(comment.created)}</small></div><p>${escapeHTML(comment.content)}</p></div></div>`).join('') : '<span class="muted">Комментариев пока нет.</span>'}</div>
    </article>`;
  }
  render() {
    this.root.innerHTML = `<div class="posts-heading"><div><h2>Лента команды</h2><p id="posts-status">Загружаем публикации…</p></div><button id="reload-posts" class="button outline">${icon('rotate', 17)} Обновить</button></div><div id="posts-cards" class="posts-list"></div><div class="posts-footnote">RxJS · switchMap + forkJoin · комментарии загружаются для каждого поста</div>`;
    this.root.querySelector('#reload-posts').addEventListener('click', () => this.load());
  }
  destroy() { this.subscription?.unsubscribe(); this.subscription = null; }
}
