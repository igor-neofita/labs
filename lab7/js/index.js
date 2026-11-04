// Лабораторна робота №7. Fetch API, номер у журналі — 21.
const API_URL = 'https://69b11abdadac80b427c3fff2.mockapi.io/api/v1/todoItem';
const USER_ID = 21;

// MockAPI може повертати deadline як ISO-рядок або Unix timestamp.
// Для поля type="date" і підпису показуємо YYYY-MM-DD, а не число.
function formatDeadline(value) {
  if (value === null || value === undefined || value === '') return '';
  const raw = String(value);
  // Перевіряємо календарну коректність, а не лише форму YYYY-MM-DD.
  if (/^\d{4}-\d{2}-\d{2}(?:T.+)?$/.test(raw)) {
    const isoDay = raw.slice(0, 10);
    const date = new Date(`${isoDay}T00:00:00.000Z`);
    const calendarValid = !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === isoDay;
    const timeValid = raw.length === 10 || !Number.isNaN(Date.parse(raw));
    return calendarValid && timeValid ? isoDay : '';
  }
  if (/^\d{10}$|^\d{13}$/.test(raw)) {
    const milliseconds = raw.length === 10 ? Number(raw) * 1000 : Number(raw);
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }
  return '';
}

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');
  const taskTemplate = document.getElementById('task-template');
  const editorPanel = document.getElementById('editor-panel');
  const editorTitle = document.getElementById('editor-title');
  const submitButton = document.getElementById('submit-button');
  const addTaskButton = document.getElementById('add-task-button');
  const cancelButton = document.getElementById('cancel-button');
  const taskCount = document.getElementById('task-count');
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error');
  const emptyMessage = document.getElementById('empty-message');
  const status = document.getElementById('status');

  let currentEditId = null;
  let todos = [];

  function resetFormState() {
    currentEditId = null;
    taskForm.reset();
    editorPanel.hidden = true;
    submitButton.textContent = 'Створити';
    editorTitle.textContent = 'Нове завдання';
  }

  function setError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = !message;
  }

  function updateCount() {
    const count = taskList.children.length;
    taskCount.textContent = `${count} завдань`;
    emptyMessage.hidden = count !== 0 || !loading.hidden || !errorMessage.hidden;
  }

  function renderTodos(items) {
    taskList.replaceChildren();
    items.forEach(item => {
      const fragment = taskTemplate.content.cloneNode(true);
      const card = fragment.querySelector('.task-card');
      card.dataset.id = String(item.id);
      card.querySelector('.task-card__title').textContent = item.title ?? '';
      card.querySelector('.task-card__desc').textContent = item.description ?? '';
      const details = [item.tag || 'без категорії', item.isDone ? 'виконано' : 'у роботі'];
      if (item.deadline) details.push(`термін: ${formatDeadline(item.deadline) || 'невідома дата'}`);
      card.querySelector('.task-card__meta').textContent = details.join(' · ');
      taskList.appendChild(fragment);
    });
    updateCount();
  }

  // GET: отримання записів із MockAPI, відображаємо лише USER_ID.
  async function fetchTodos() {
    loading.hidden = false;
    setError('');
    emptyMessage.hidden = true;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`GET: HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Сервер повернув не список завдань.');
      todos = data.filter(item => Number(item.userId) === USER_ID);
      renderTodos(todos);
    } catch (error) {
      console.error('Помилка завантаження:', error);
      setError(`Не вдалося отримати дані із сервера: ${error.message}`);
    } finally {
      loading.hidden = true;
      updateCount();
    }
  }

  addTaskButton.addEventListener('click', () => {
    resetFormState();
    editorPanel.hidden = false;
    taskForm.elements.namedItem('title').focus();
  });

  cancelButton.addEventListener('click', resetFormState);

  // POST: новий запис; PUT: збереження змін на сервері.
  taskForm.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(taskForm);
    const taskData = {
      userId: USER_ID,
      title: String(formData.get('title') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      tag: String(formData.get('tag') || '').trim(),
      isDone: formData.has('isDone')
    };
    const deadline = String(formData.get('deadline') || '');
    if (deadline) taskData.deadline = deadline;
    if (!taskData.title || !taskData.description || !taskData.tag) {
      setError('Заповніть назву, опис і категорію.');
      return;
    }

    const editing = currentEditId !== null;
    const url = editing ? `${API_URL}/${currentEditId}` : API_URL;
    submitButton.disabled = true;
    setError('');
    try {
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error(`${editing ? 'PUT' : 'POST'}: HTTP ${response.status}`);
      await fetchTodos();
      if (!errorMessage.hidden) return; // Не закриваємо форму, якщо GET завершився помилкою.
      resetFormState();
      status.textContent = editing ? 'Зміни збережено на сервері.' : 'Завдання додано на сервер.';
    } catch (error) {
      console.error('Помилка збереження:', error);
      setError(`Не вдалося зберегти завдання: ${error.message}`);
    } finally {
      submitButton.disabled = false;
    }
  });

  // Обробник подій контейнера карток: редагування та DELETE.
  taskList.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button || !taskList.contains(button)) return;
    const card = button.closest('.task-card');
    const taskId = card?.dataset.id;
    const todo = todos.find(item => String(item.id) === taskId);
    if (!todo || Number(todo.userId) !== USER_ID) return;

    if (button.dataset.action === 'edit') {
      currentEditId = taskId;
      taskForm.elements.namedItem('title').value = todo.title ?? '';
      taskForm.elements.namedItem('description').value = todo.description ?? '';
      taskForm.elements.namedItem('tag').value = todo.tag ?? '';
      taskForm.elements.namedItem('deadline').value = formatDeadline(todo.deadline);
      taskForm.elements.namedItem('isDone').checked = Boolean(todo.isDone);
      editorTitle.textContent = 'Редагування завдання';
      submitButton.textContent = 'Зберегти зміни';
      editorPanel.hidden = false;
      taskForm.elements.namedItem('title').focus();
    }

    if (button.dataset.action === 'delete') {
      if (!window.confirm('Видалити завдання із сервера?')) return;
      button.disabled = true;
      setError('');
      try {
        const response = await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`DELETE: HTTP ${response.status}`);
        card.remove(); // Прибираємо картку тільки після успішної відповіді DELETE.
        todos = todos.filter(item => String(item.id) !== taskId);
        if (currentEditId === taskId) resetFormState();
        updateCount();
        status.textContent = 'Завдання видалено із сервера.';
      } catch (error) {
        console.error('Помилка видалення:', error);
        setError(`Не вдалося видалити завдання: ${error.message}`);
      } finally {
        button.disabled = false;
      }
    }
  });

  fetchTodos();
});
