const { randomUUID } = require('node:crypto');
const NOW = () => Math.floor(Date.now() / 1000);

const mailTemplates = [
  ['anna@ivanova', 'Давайте обсудим новый проект', 'Привет! Есть несколько идей по ближайшему спринту.'],
  ['alex@petrov', 'Приглашение на встречу', 'Созвонимся сегодня в 16:00?'],
  ['manager@company', 'Отчёт за эту неделю готов', 'Прикрепляю сводку результатов команды.'],
  ['design@studio', 'Обновление дизайн-системы', 'Обрати внимание на новые компоненты и отступы.'],
  ['hr@company', 'Добро пожаловать в команду', 'Рады видеть тебя в нашем проекте!'],
  ['support@platform', 'Ваша заявка обработана', 'Заявка успешно закрыта.'],
  ['olga@market', 'Результаты пользовательского исследования', 'Собрали основные наблюдения и выводы.'],
  ['devops@company', 'План технических работ', 'В субботу будет короткое обслуживание.'],
];
let messageCounter = 0;
function unreadMessages() {
  const count = messageCounter === 0 ? 3 : Math.floor(Math.random() * 4);
  const messages = Array.from({ length: count }, () => {
    const sample = mailTemplates[messageCounter % mailTemplates.length];
    messageCounter += 1;
    return { id: randomUUID(), from: sample[0], subject: sample[1], body: sample[2], received: NOW() - Math.floor(Math.random() * 1800) };
  });
  return { status: 'ok', timestamp: NOW(), messages };
}

const posts = [
  { id: 'post-1', author_id: 'u1', title: 'Новая неделя — новые идеи', author: 'Анна Иванова', avatar: '', image: '/assets/post-planning.svg', created: NOW() - 3600, text: 'Сегодня распланировали следующий спринт и определили три главных направления. Делимся небольшим фрагментом рабочего процесса.' },
  { id: 'post-2', author_id: 'u2', title: 'Первый взгляд на обновлённый интерфейс', author: 'Михаил Смирнов', avatar: '', image: '/assets/post-product.svg', created: NOW() - 8700, text: 'Показываем черновые варианты карточек и новые принципы навигации. Что думаете?' },
  { id: 'post-3', author_id: 'u3', title: 'Немного цифр по итогам месяца', author: 'Мария Ким', avatar: '', image: '/assets/post-review.svg', created: NOW() - 19400, text: 'Собрали общие результаты, посмотрели на обратную связь и наметили цели на следующий месяц.' },
];
const commentsByPost = {
  'post-1': [
    ['Алексей Петров', 'Отличный план! Уже готов приступить.'],
    ['Ольга Соколова', 'Добавим ещё одну идею на обсуждение?'],
    ['Денис Орлов', 'Выглядит очень логично 👏'],
  ],
  'post-2': [
    ['Анна Иванова', 'Очень нравится новая палитра!'],
    ['Кирилл Волков', 'Навигация стала намного понятнее.'],
  ],
  'post-3': [
    ['Алексей Петров', 'Хорошая динамика!'],
    ['Мария Ким', 'Спасибо всем участникам команды.'],
    ['Ольга Соколова', 'Идём дальше 🚀'],
  ],
};
function latestPosts() { return { status: 'ok', data: posts.slice(0, 10).map(p => ({ ...p })) }; }
function latestComments(id) {
  return { status: 'ok', data: (commentsByPost[id] || []).slice(0, 3).map(([author, content], i) => ({
    id: `${id}-comment-${i + 1}`, post_id: id, author_id: `u${i + 4}`, author, avatar: '', content, created: NOW() - i * 480,
  })) };
}
module.exports = { unreadMessages, latestPosts, latestComments };
