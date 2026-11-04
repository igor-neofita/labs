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
  const emptyMessage = document.getElementById('empty-message');
  const status = document.getElementById('status');

  let isEditing = false;
  let currentEditedElement = null;

  function updateCount() {
    const count = taskList.children.length;
    const lastTwo = count % 100;
    const last = count % 10;
    const word = lastTwo >= 11 && lastTwo <= 14 ? 'завдань' :
      last === 1 ? 'завдання' :
      last >= 2 && last <= 4 ? 'завдання' : 'завдань';
    taskCount.textContent = `${count} ${word}`;
    emptyMessage.hidden = count > 0;
  }

  function closeEditor() {
    taskForm.reset();
    editorPanel.hidden = true;
    isEditing = false;
    currentEditedElement = null;
  }

  addTaskButton.addEventListener('click', () => {
    closeEditor();
    editorTitle.textContent = 'Нове завдання';
    submitButton.textContent = 'Створити';
    editorPanel.hidden = false;
    taskForm.elements.namedItem('title').focus();
  });

  cancelButton.addEventListener('click', closeEditor);

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(taskForm);
    const taskData = {
      title: String(formData.get('title') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim()
    };

    if (!taskData.title || !taskData.description) {
      window.alert('Заповніть назву та опис завдання.');
      return;
    }

    if (isEditing && currentEditedElement) {
      // Завдання 3.6: оновити поточну картку з taskData за допомогою textContent.
      currentEditedElement.querySelector('.task-card__title').textContent = taskData.title;
      currentEditedElement.querySelector('.task-card__desc').textContent = taskData.description;
      status.textContent = 'Завдання оновлено.';
    } else {
      const fragment = taskTemplate.content.cloneNode(true);
      fragment.querySelector('.task-card__title').textContent = taskData.title;
      fragment.querySelector('.task-card__desc').textContent = taskData.description;
      taskList.append(fragment);
      status.textContent = 'Завдання додано.';
    }

    closeEditor();
    updateCount();
  });

  // Єдиний обробник на батьківському контейнері: делегування подій.
  taskList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton || !taskList.contains(actionButton)) return;

    const card = actionButton.closest('.task-card');
    if (!card) return;

    if (actionButton.dataset.action === 'edit') {
      isEditing = true;
      currentEditedElement = card;
      taskForm.elements.namedItem('title').value = card.querySelector('.task-card__title').textContent;
      taskForm.elements.namedItem('description').value = card.querySelector('.task-card__desc').textContent;
      editorTitle.textContent = 'Редагування завдання';
      submitButton.textContent = 'Зберегти зміни';
      editorPanel.hidden = false;
      taskForm.elements.namedItem('title').focus();
    }

    if (actionButton.dataset.action === 'delete') {
      if (!window.confirm('Видалити це завдання?')) return;
      if (currentEditedElement === card) closeEditor();
      card.remove();
      updateCount();
      status.textContent = 'Завдання видалено.';
    }
  });

  updateCount();
});
