const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

let tasks = [];
let editingTaskId = null;

function loadTasks() {
  const stored = localStorage.getItem('todoTasks');
  tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-state';
    emptyMessage.textContent = 'No tasks yet. Add your first task above.';
    taskList.appendChild(emptyMessage);
    return;
  }

  tasks.forEach((task) => {
    const listItem = document.createElement('li');
    listItem.className = 'task-item';

    const textElement = document.createElement('p');
    textElement.className = 'task-text';
    textElement.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => startEditingTask(task.id));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    listItem.appendChild(textElement);
    listItem.appendChild(actions);
    taskList.appendChild(listItem);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === '') {
    taskInput.focus();
    return;
  }

  if (editingTaskId) {
    tasks = tasks.map((task) => (
      task.id === editingTaskId ? { ...task, text } : task
    ));
    editingTaskId = null;
    addTaskButton.textContent = 'Add Task';
  } else {
    tasks.push({
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    });
  }

  taskInput.value = '';
  taskInput.focus();
  saveTasks();
  renderTasks();
}

function startEditingTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  taskInput.value = task.text;
  addTaskButton.textContent = 'Save Changes';
  taskInput.focus();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  if (editingTaskId === taskId) {
    editingTaskId = null;
    addTaskButton.textContent = 'Add Task';
    taskInput.value = '';
  }
  saveTasks();
  renderTasks();
}

addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});

loadTasks();
renderTasks();
