const STORAGE_KEY = 'best-freeelec-todos';
let tasks = loadTasks();

const form = document.getElementById('taskForm');
const input = document.getElementById('taskInput');
const list = document.getElementById('taskList');
const count = document.getElementById('taskCount');
const empty = document.getElementById('emptyState');
const clearCompleted = document.getElementById('clearCompleted');

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task${task.completed ? ' completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Complete ${task.text}`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const del = document.createElement('button');
    del.className = 'delete';
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      render();
    });

    li.append(checkbox, text, del);
    list.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.completed).length;
  count.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} remaining`;
  empty.hidden = tasks.length !== 0;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), text, completed: false });
  saveTasks();
  input.value = '';
  input.focus();
  render();
});

clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

render();
