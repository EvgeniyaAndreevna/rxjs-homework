# Orbit Desk — домашнее задание № 11 «RxJS»

[![Deploy GitHub Pages](https://github.com/EvgeniyaAndreevna/rxjs-homework/actions/workflows/deploy.yml/badge.svg)](https://github.com/EvgeniyaAndreevna/rxjs-homework/actions/workflows/deploy.yml)

**GitHub Pages:** https://evgeniyaandreevna.github.io/rxjs-homework/

> Бейдж и ссылка рассчитаны на будущий публичный репозиторий `EvgeniyaAndreevna/rxjs-homework`. Пока репозиторий не создан и GitHub Pages не опубликован, ссылка нерабочая. Если назвать репозиторий иначе, замените обе ссылки.

Учебный проект из трёх независимых разделов. Главное обязательное задание — **Polling**. Два других раздела — решения задач со звёздочкой.

## Реализованные возможности

### 1. Polling (обязательная задача)

- Локальный REST-сервер Express отдаёт `GET /messages/unread` в требуемом формате: `status`, `timestamp`, `messages` с полями `id`, `from`, `subject`, `body`, `received`.
- Клиент делает запрос **сразу при открытии вкладки, затем каждые 5 секунд**.
- Реализовано с `interval(5000)`, `startWith`, `exhaustMap`, `ajax.getJSON`, `catchError` из RxJS.
- Новые сообщения появляются сверху; старые остаются. Дубликаты не добавляются (проверка уникального `id`).
- Тема письма отображается максимум в 15 символов, затем дополняется `…`.
- Timestamp (секунды) преобразуется в `ЧЧ:ММ ДД.ММ.ГГГГ` по местному часовому поясу браузера.
- Любая ошибка `ajax.getJSON` превращается в `{ status: 'ok', messages: [] }`: лента не очищается, polling продолжает работать.
- Нажмите на сообщение для показа полного текста письма.

### 2. Posts with comments (дополнительная задача)

- Сервер отдаёт `GET /posts/latest` (не более 10) и `GET /posts/:postId/comments/latest` (не более 3).
- `switchMap` + `forkJoin` + `map` загружают комментарии для каждого поста. В `subscribe` приходят **уже дополненные комментариями посты**.
- Используются SVG-иллюстрации, которые Webpack включает в финальную сборку.
- Кнопка «Обновить» загружает ленту повторно. `Load More` не требуется.

### 3. Project Management Dashboard (дополнительная задача)

- Два независимых виджета: **статистика проектов** и **список задач**.
- Оба получают один `Store` через конструктор и подписываются на `BehaviorSubject`.
- Выбор проекта в виджете статистики синхронизирует список задач.
- Отметка выполнения / снятие отметки немедленно меняет число открытых задач и прогресс во всех виджетах.
- Данные хранятся **только в памяти браузера** — backend не нужен.

## Требования

- Node.js **20+** (рекомендуется 22 LTS)
- npm
- VS Code или любой редактор

## Локальный запуск на Windows (PowerShell)

Распакуйте архив, откройте корень проекта `rxjs-homework` в VS Code.

1. Установите зависимости (один раз):

   ```powershell
   npm.cmd install
   ```

2. В первом терминале запустите сервер:

   ```powershell
   npm.cmd run server
   ```

   Backend: http://localhost:7071. Проверка: http://localhost:7071/messages/unread

3. Во **втором** терминале запустите Webpack:

   ```powershell
   npm.cmd start
   ```

   Frontend: http://localhost:8080

Сервер разработки Webpack отправляет `/messages/...` и `/posts/...` через proxy на `localhost:7071`, поэтому в режиме REST API отдельная настройка CORS не требуется. Если порт `7071` занят, задайте свой порт (`$env:PORT=7072; npm.cmd run server`) и поправьте `target` в `webpack.config.cjs`.

**Важно:** при запуске frontend без backend в режиме REST API писем не будет — по условиям задачи ошибки считаются пустым ответом. Можно перейти в **демо-режим** через шестерёнку справа наверху.

## Проверка сборки

```powershell
npm.cmd run check
npm.cmd run build
```

Собранные файлы появятся в `dist/`. Тесты не требуются по заданию.

## GitHub Pages + GitHub Actions

1. Создайте **пустой публичный** репозиторий `rxjs-homework` (без README, без .gitignore).
2. После установки зависимостей убедитесь, что `package-lock.json` находится в проекте; при `git add .` он будет включён. Не добавляйте `node_modules/` и `dist/`.
3. Выполните:

   ```powershell
   git init
   git add .
   git status
   git commit -m "Homework 11: RxJS Polling, Posts, Dashboard"
   git branch -M main
   git remote add origin https://github.com/EvgeniyaAndreevna/rxjs-homework.git
   git push -u origin main
   ```

4. Откройте репозиторий → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. Откройте вкладку **Actions**, дождитесь зелёной сборки `Deploy GitHub Pages`.
6. Посетите https://evgeniyaandreevna.github.io/rxjs-homework/ и проверьте три раздела.

Workflow: `.github/workflows/deploy.yml`. Сборка запускается на push в `main` и по кнопке `Run workflow`. В `dist` автоматически собираются JS, CSS, HTML и SVG.

## Режимы источника данных

Значок шестерёнки в верхней панели:

- **Демо-режим**: генератор писем и данных постов работает прямо в браузере. Используется **по умолчанию на GitHub Pages**, чтобы публичный frontend был доступен даже без backend.
- **REST API**: клиент получает данные реальными HTTP-запросами `ajax.getJSON`. Локально оставьте поле адреса пустым — Webpack proxy работает сам. Для GitHub Pages укажите публичный **HTTPS**-адрес backend.

Демо-режим не является заменой REST API: выполнение обязательной части проверяйте локально в режиме **REST API** с запущенным сервером. Демо нужно только для просмотра интерфейса на GitHub Pages без отдельного деплоя backend.

### Необязательная публикация backend на Vercel

Конфигурация `vercel.json` и серверный обработчик `api/index.js` подготовлены. При желании импортируйте этот репозиторий в Vercel, установите Root Directory = корень проекта и опубликуйте серверную функцию. Проверьте открытие `https://ВАШ_ДОМЕН.vercel.app/messages/unread`, затем в GitHub Pages откройте шестерёнку, включите REST API и укажите `https://ВАШ_ДОМЕН.vercel.app`.

> **Ограничение serverless:** состояние функции может сбрасываться между запросами; каждый ответ имеет новые случайные UUID. Для учебного демо это не критично. Vercel не обязателен по условиям задания.

## Структура

```text
rxjs-homework/
├── .github/workflows/deploy.yml  # GitHub Pages
├── api/index.js                   # опциональный Vercel backend
├── server/
│   ├── app.cjs                    # Express REST endpoints
│   ├── data.cjs                   # генератор сообщений и постов
│   └── index.cjs                  # локальный запуск на 7071
├── src/
│   ├── assets/                    # SVG-файлы, импортируемые Webpack
│   ├── modules/
│   │   ├── polling.js             # interval + ajax + catchError
│   │   ├── posts.js               # switchMap + forkJoin
│   │   ├── store.js               # BehaviorSubject Store
│   │   ├── dashboard.js           # независимые виджеты
│   │   ├── demoData.js            # браузерное демо
│   │   └── utils.js
│   ├── index.html
│   ├── index.js
│   └── styles.css
├── package.json
├── vercel.json
└── webpack.config.cjs
```

Все пользовательские данные в учебном приложении хранятся в оперативной памяти. При перезапуске backend или обновлении страницы состояние может сброситься.
