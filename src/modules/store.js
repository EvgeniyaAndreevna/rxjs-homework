import { BehaviorSubject } from 'rxjs';

const initialProjects = [
  { id: 1, name: 'Web Platform', color: '#6579f8', tasks: [
    { id: 11, name: 'Обновить главную страницу', done: false },
    { id: 12, name: 'Реализовать авторизацию', done: true },
    { id: 13, name: 'Настроить аналитические события', done: false },
    { id: 14, name: 'Добавить тёмную тему', done: false },
  ] },
  { id: 2, name: 'Mobile App', color: '#13b99b', tasks: [
    { id: 21, name: 'Настроить push-уведомления', done: false },
    { id: 22, name: 'Добавить экран профиля', done: true },
    { id: 23, name: 'Подготовить onboarding', done: false },
  ] },
  { id: 3, name: 'Design System', color: '#ec9a61', tasks: [
    { id: 31, name: 'Собрать библиотеку компонентов', done: true },
    { id: 32, name: 'Обновить типографику', done: false },
    { id: 33, name: 'Опубликовать документацию', done: false },
    { id: 34, name: 'Уточнить цвета состояний', done: true },
  ] },
  { id: 4, name: 'iOS App', color: '#ab7cf7', tasks: [
    { id: 25, name: 'Push Notifications', done: true },
    { id: 26, name: 'Apple Pay Support', done: false },
    { id: 27, name: 'Улучшить производительность', done: false },
  ] },
];

export class Store {
  constructor() {
    this.subject = new BehaviorSubject({ projects: initialProjects.map(p => ({ ...p, tasks: p.tasks.map(t => ({ ...t })) })), selectedId: 1 });
    this.state$ = this.subject.asObservable();
  }
  get value() { return this.subject.getValue(); }
  selectProject(projectId) {
    if (!this.value.projects.some(project => project.id === projectId)) return;
    this.subject.next({ ...this.value, selectedId: projectId });
  }
  toggleTask(projectId, taskId) {
    const { projects, selectedId } = this.value;
    const updated = projects.map(project => project.id === projectId
      ? { ...project, tasks: project.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task) }
      : project);
    this.subject.next({ projects: updated, selectedId });
  }
}

export const dashboardStore = new Store();
