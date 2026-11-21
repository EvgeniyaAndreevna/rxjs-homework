import { escapeHTML, icon } from './utils.js';
import { dashboardStore } from './store.js';

const pending = (project) => project.tasks.filter(task => !task.done).length;
const completed = (project) => project.tasks.filter(task => task.done).length;

// Виджеты не знают друг о друге: оба подписаны исключительно на Store.
class StatsWidget {
  constructor(root, store) {
    this.root = root;
    this.store = store;
    this.root.innerHTML = '<div class="stats-widget"></div>';
    this.subscription = this.store.state$.subscribe(s => this.render(s));
    this.root.addEventListener('click', this.onClick = (event) => {
      const button = event.target.closest('button[data-project-id]');
      if (button) this.store.selectProject(Number(button.dataset.projectId));
    });
  }
  render(state) {
    const open = state.projects.reduce((sum, project) => sum + pending(project), 0);
    const total = state.projects.reduce((sum, project) => sum + project.tasks.length, 0);
    this.root.querySelector('.stats-widget').innerHTML = `<div class="panel-heading"><div class="eyebrow">ЗАДАЧИ ПО ПРОЕКТАМ</div><h2>Обзор проектов</h2><p>Выберите проект для просмотра задач</p></div><div class="total-open"><div><span>Открыто задач</span><strong>${open}</strong></div><div class="progress-ring" style="--pct:${total ? Math.round((total - open) / total * 100) : 0}%"><span>${total ? Math.round((total - open) / total * 100) : 0}%</span></div></div><div class="project-cards">${state.projects.map(project => {
      const o = pending(project); const totalCount = project.tasks.length;
      return `<button type="button" class="project-choice ${state.selectedId === project.id ? 'selected' : ''}" data-project-id="${project.id}"><span class="project-color" style="background:${project.color}"></span><span class="project-meta"><strong>${escapeHTML(project.name)}</strong><span>${o} открыто · ${totalCount} всего</span><span class="project-bar"><span style="width:${Math.round((totalCount - o) / totalCount * 100)}%;background:${project.color}"></span></span></span>${icon('chevron', 18)}</button>`;
    }).join('')}</div>`;
  }
  destroy() { this.subscription.unsubscribe(); this.root.removeEventListener('click', this.onClick); }
}
class TasksWidget {
  constructor(root, store) {
    this.root = root;
    this.store = store;
    this.root.innerHTML = '<div class="tasks-widget"></div>';
    this.subscription = this.store.state$.subscribe(s => this.render(s));
    this.root.addEventListener('change', this.onChange = (event) => {
      const checkbox = event.target.closest('input[data-task-id]');
      if (!checkbox) return;
      this.store.toggleTask(Number(checkbox.dataset.projectId), Number(checkbox.dataset.taskId));
    });
  }
  render(state) {
    const project = state.projects.find(p => p.id === state.selectedId) || state.projects[0];
    const done = completed(project);
    this.root.querySelector('.tasks-widget').innerHTML = `<div class="panel-heading"><div class="eyebrow">PROJECT TASKS</div><h2>${escapeHTML(project.name)}</h2><p>Отмечайте выполненные задачи. Статистика обновится автоматически.</p></div><div class="task-banner"><span>${icon('check', 21)}</span><div><strong>${done} из ${project.tasks.length} выполнено</strong><small>${pending(project)} задач осталось в работе</small></div></div><div class="task-list">${project.tasks.map(task => `<label class="task-row ${task.done ? 'task-done' : ''}"><input type="checkbox" data-project-id="${project.id}" data-task-id="${task.id}" ${task.done ? 'checked' : ''}><span class="styled-checkbox">${icon('check', 15)}</span><span class="task-name">${escapeHTML(task.name)}</span><span class="task-status ${task.done ? 'complete' : ''}">${task.done ? 'Готово' : 'В работе'}</span></label>`).join('')}</div><div class="task-explainer"><span>${icon('info', 19)}</span><p>Изменения проходят через единый <strong>BehaviorSubject Store</strong>, поэтому оба виджета синхронизируются без прямых обращений друг к другу.</p></div>`;
  }
  destroy() { this.subscription.unsubscribe(); this.root.removeEventListener('change', this.onChange); }
}
export class DashboardWidget {
  constructor(root) {
    this.root = root;
    this.root.innerHTML = `<div class="dashboard-intro"><div><h2>Управление проектами</h2><p>Общий стейт и независимые виджеты на RxJS</p></div><span class="source-tag">${icon('layout', 16)} State Management</span></div><div class="dashboard-grid"><section class="panel" id="stats-widget"></section><section class="panel" id="tasks-widget"></section></div>`;
    this.stats = new StatsWidget(this.root.querySelector('#stats-widget'), dashboardStore);
    this.tasks = new TasksWidget(this.root.querySelector('#tasks-widget'), dashboardStore);
  }
  destroy() { this.stats.destroy(); this.tasks.destroy(); }
}
