(() => {
  // Client-side interactions for the Todo app.
  const appRoot =
    document.querySelector('[data-todo-app]') ||
    document.querySelector('.todo-app') ||
    document.body;
  const listEl =
    document.querySelector('[data-todo-list]') ||
    document.getElementById('todo-list') ||
    document.querySelector('.todo-list');
  const formEl =
    document.querySelector('[data-todo-form]') ||
    document.getElementById('todo-form') ||
    document.querySelector('form.todo-form');
  const titleInput =
    formEl?.querySelector('[data-todo-title]') ||
    document.getElementById('todo-title') ||
    formEl?.querySelector('[name="title"]');
  const descriptionInput =
    formEl?.querySelector('[data-todo-description]') ||
    document.getElementById('todo-description') ||
    formEl?.querySelector('[name="description"]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const filterSelect =
    document.querySelector('[data-filter-select]') ||
    document.getElementById('filter-select') ||
    document.querySelector('select[name="filter"]');
  const statusEl =
    document.querySelector('[data-status]') ||
    document.getElementById('status-message') ||
    document.querySelector('.status-message');

  const state = {
    todos: [],
    filter: 'all',
    editingId: null,
    requestId: 0,
  };

  const FILTER_ALIASES = {
    all: 'all',
    active: 'active',
    pending: 'active',
    open: 'active',
    todo: 'active',
    incomplete: 'active',
    uncompleted: 'active',
    completed: 'completed',
    complete: 'completed',
    done: 'completed',
    finished: 'completed',
    0: 'active',
    1: 'completed',
  };

  function init() {
    bindForm();
    bindFilters();
    bindList();

    state.filter = getInitialFilter();
    updateFilterControls();

    if (listEl) {
      loadTodos();
    }
  }

  function bindForm() {
    if (!formEl) {
      return;
    }

    formEl.addEventListener('submit', handleAddSubmit);
  }

  function bindFilters() {
    filterButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        setFilter(button.dataset.filter || button.value || button.id);
      });
    });

    if (filterSelect) {
      filterSelect.addEventListener('change', (event) => {
        setFilter(event.target.value);
      });
    }
  }

  function bindList() {
    if (!listEl) {
      return;
    }

    listEl.addEventListener('change', (event) => {
      const target = event.target;
      if (!target.matches('.todo-toggle')) {
        return;
      }

      const item = target.closest('[data-id]');
      const todoId = Number(item?.dataset.id);
      if (!todoId) {
        return;
      }

      handleToggle(todoId, target.checked, target);
    });

    listEl.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-action]');
      if (!actionButton) {
        return;
      }

      const action = actionButton.dataset.action;
      const item = actionButton.closest('[data-id]');
      const todoId = Number(item?.dataset.id);
      if (!todoId) {
        return;
      }

      if (action === 'edit') {
        startEditing(todoId);
        return;
      }

      if (action === 'delete') {
        handleDelete(todoId, actionButton);
      }
    });
  }

  function getInitialFilter() {
    const activeButton = filterButtons.find(
      (button) =>
        button.classList.contains('is-active') ||
        button.getAttribute('aria-pressed') === 'true'
    );

    if (activeButton) {
      return normalizeFilter(
        activeButton.dataset.filter || activeButton.value || activeButton.id
      );
    }

    if (filterSelect?.value) {
      return normalizeFilter(filterSelect.value);
    }

    return 'all';
  }

  function normalizeFilter(value) {
    if (!value && value !== 0) {
      return 'all';
    }

    const key = String(value).toLowerCase();
    return FILTER_ALIASES[key] || 'all';
  }

  function filterToCompletedParam(filter) {
    if (filter === 'active') {
      return 0;
    }
    if (filter === 'completed') {
      return 1;
    }
    return null;
  }

  function setFilter(filter) {
    const normalized = normalizeFilter(filter);
    if (normalized === state.filter) {
      return;
    }

    state.filter = normalized;
    state.editingId = null;
    updateFilterControls();
    loadTodos();
  }

  function updateFilterControls() {
    filterButtons.forEach((button) => {
      const buttonFilter = normalizeFilter(
        button.dataset.filter || button.value || button.id
      );
      const isActive = buttonFilter === state.filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (filterSelect) {
      filterSelect.value = state.filter;
    }
  }

  // Fetch todos from the API using the active filter.
  async function loadTodos() {
    if (!listEl) {
      return;
    }

    const requestId = ++state.requestId;
    setAppBusy(true);
    setStatus('');

    try {
      const data = await apiListTodos(state.filter);
      if (requestId !== state.requestId) {
        return;
      }

      state.todos = Array.isArray(data) ? data.map(normalizeTodo) : [];
      renderTodos();
    } catch (error) {
      if (requestId !== state.requestId) {
        return;
      }
      setStatus(error.message || 'Failed to load todos.', 'error');
    } finally {
      if (requestId === state.requestId) {
        setAppBusy(false);
      }
    }
  }

  function normalizeTodo(todo) {
    return {
      ...todo,
      description: typeof todo?.description === 'string' ? todo.description : '',
      completed: Number(todo?.completed) ? 1 : 0,
    };
  }

  function renderTodos() {
    if (!listEl) {
      return;
    }

    listEl.innerHTML = '';

    if (!state.todos.length) {
      listEl.appendChild(createEmptyState());
      return;
    }

    const fragment = document.createDocumentFragment();
    state.todos.forEach((todo) => {
      const item =
        state.editingId === todo.id
          ? createEditItem(todo)
          : createViewItem(todo);
      fragment.appendChild(item);
    });

    listEl.appendChild(fragment);
  }

  function createEmptyState() {
    const message =
      state.filter === 'completed'
        ? 'No completed todos yet.'
        : state.filter === 'active'
          ? 'No active todos yet.'
          : 'No todos yet. Add one to get started.';

    const item = createListItemElement();
    item.className = 'todo-empty';
    item.textContent = message;
    return item;
  }

  function createListItemElement() {
    const tagName = listEl && ['UL', 'OL'].includes(listEl.tagName) ? 'li' : 'div';
    return document.createElement(tagName);
  }

  function createViewItem(todo) {
    const item = createListItemElement();
    item.className = 'todo-item';
    item.dataset.id = String(todo.id);
    if (todo.completed) {
      item.classList.add('is-completed');
    }

    const content = document.createElement('div');
    content.className = 'todo-content';

    const label = document.createElement('label');
    label.className = 'todo-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-toggle';
    checkbox.checked = Boolean(todo.completed);
    checkbox.setAttribute('aria-label', 'Toggle todo completion');

    const title = document.createElement('span');
    title.className = 'todo-title';
    title.textContent = todo.title;

    label.appendChild(checkbox);
    label.appendChild(title);
    content.appendChild(label);

    if (todo.description) {
      const description = document.createElement('p');
      description.className = 'todo-description';
      description.textContent = todo.description;
      content.appendChild(description);
    }

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'todo-edit';
    editButton.dataset.action = 'edit';
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'todo-delete';
    deleteButton.dataset.action = 'delete';
    deleteButton.textContent = 'Delete';

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(content);
    item.appendChild(actions);

    return item;
  }

  function createEditItem(todo) {
    const item = createListItemElement();
    item.className = 'todo-item is-editing';
    item.dataset.id = String(todo.id);

    const form = document.createElement('form');
    form.className = 'todo-edit-form';

    const fields = document.createElement('div');
    fields.className = 'todo-edit-fields';

    const titleField = document.createElement('input');
    titleField.type = 'text';
    titleField.name = 'title';
    titleField.required = true;
    titleField.value = todo.title;

    const descriptionField = document.createElement('textarea');
    descriptionField.name = 'description';
    descriptionField.rows = 3;
    descriptionField.value = todo.description || '';

    fields.appendChild(titleField);
    fields.appendChild(descriptionField);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'todo-save';
    saveButton.textContent = 'Save';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'todo-cancel';
    cancelButton.textContent = 'Cancel';

    actions.appendChild(saveButton);
    actions.appendChild(cancelButton);

    form.appendChild(fields);
    form.appendChild(actions);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handleEditSubmit(todo, titleField.value, descriptionField.value, form);
    });

    cancelButton.addEventListener('click', (event) => {
      event.preventDefault();
      state.editingId = null;
      renderTodos();
    });

    form.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        state.editingId = null;
        renderTodos();
      }
    });

    item.appendChild(form);

    return item;
  }

  function startEditing(todoId) {
    state.editingId = todoId;
    renderTodos();

    requestAnimationFrame(() => {
      const activeForm = listEl?.querySelector('.todo-edit-form');
      const firstField = activeForm?.querySelector('input, textarea');
      if (firstField) {
        firstField.focus();
        if (typeof firstField.select === 'function') {
          firstField.select();
        }
      }
    });
  }

  async function handleAddSubmit(event) {
    event.preventDefault();

    const titleValue =
      titleInput?.value ?? formEl?.querySelector('[name="title"]')?.value ?? '';
    const descriptionValue =
      descriptionInput?.value ??
      formEl?.querySelector('[name="description"]')?.value ??
      '';

    const title = String(titleValue).trim();
    if (!title) {
      setStatus('Title is required.', 'error');
      titleInput?.focus();
      return;
    }

    const description = String(descriptionValue).trim();
    setStatus('');
    setFormBusy(formEl, true);

    try {
      await apiCreateTodo({ title, description });
      state.editingId = null;
      formEl?.reset();
      await loadTodos();
    } catch (error) {
      setStatus(error.message || 'Failed to create todo.', 'error');
    } finally {
      setFormBusy(formEl, false);
    }
  }

  async function handleToggle(todoId, completed, checkbox) {
    setStatus('');

    if (checkbox) {
      checkbox.disabled = true;
    }

    try {
      await apiUpdateTodo(todoId, { completed: completed ? 1 : 0 });
      state.editingId = null;
      await loadTodos();
    } catch (error) {
      if (checkbox) {
        checkbox.checked = !completed;
      }
      setStatus(error.message || 'Failed to update todo.', 'error');
    } finally {
      if (checkbox) {
        checkbox.disabled = false;
      }
    }
  }

  async function handleEditSubmit(todo, titleValue, descriptionValue, form) {
    const title = String(titleValue ?? '').trim();
    if (!title) {
      setStatus('Title is required.', 'error');
      form?.querySelector('input')?.focus();
      return;
    }

    const description = String(descriptionValue ?? '').trim();

    setStatus('');
    setFormBusy(form, true);

    try {
      await apiUpdateTodo(todo.id, { title, description });
      state.editingId = null;
      await loadTodos();
    } catch (error) {
      setStatus(error.message || 'Failed to update todo.', 'error');
    } finally {
      setFormBusy(form, false);
    }
  }

  async function handleDelete(todoId, button) {
    const todo = state.todos.find((item) => item.id === todoId);
    const label = todo?.title ? ` "${todo.title}"` : '';
    if (!window.confirm(`Delete${label}?`)) {
      return;
    }

    setStatus('');
    if (button) {
      button.disabled = true;
    }

    try {
      await apiDeleteTodo(todoId);
      state.editingId = null;
      await loadTodos();
    } catch (error) {
      setStatus(error.message || 'Failed to delete todo.', 'error');
    } finally {
      if (button) {
        button.disabled = false;
      }
    }
  }

  function setFormBusy(form, isBusy) {
    if (!form) {
      return;
    }

    form.querySelectorAll('input, textarea, button').forEach((field) => {
      field.disabled = isBusy;
    });
    form.classList.toggle('is-busy', isBusy);
    form.setAttribute('aria-busy', String(isBusy));
  }

  function setAppBusy(isBusy) {
    if (appRoot) {
      appRoot.classList.toggle('is-loading', isBusy);
    }
    if (listEl) {
      listEl.setAttribute('aria-busy', String(isBusy));
    }
  }

  function setStatus(message, type = 'info') {
    if (!statusEl) {
      if (message && type === 'error') {
        console.error(message);
      }
      return;
    }

    statusEl.textContent = message || '';
    if (message) {
      statusEl.dataset.type = type;
    } else {
      statusEl.removeAttribute('data-type');
    }
  }

  // Centralized fetch helper enforcing the API response shape.
  async function apiRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(path, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok || !payload || payload.success !== true) {
      const message = payload?.error || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return payload.data;
  }

  function apiListTodos(filter) {
    const completed = filterToCompletedParam(filter);
    const params = new URLSearchParams();
    if (completed !== null) {
      params.set('completed', String(completed));
    }

    const url = params.toString()
      ? `/api/todos?${params.toString()}`
      : '/api/todos';
    return apiRequest(url);
  }

  function apiCreateTodo(payload) {
    return apiRequest('/api/todos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  function apiUpdateTodo(todoId, payload) {
    return apiRequest(`/api/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  function apiDeleteTodo(todoId) {
    return apiRequest(`/api/todos/${todoId}`, {
      method: 'DELETE',
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
