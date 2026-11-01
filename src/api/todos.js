const GAS_URL = import.meta.env.VITE_GAS_URL;

function getEndpoint() {
  if (!GAS_URL) {
    throw new Error('VITE_GAS_URL が設定されていません');
  }
  return GAS_URL;
}

function normalizeTodo(raw) {
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    content: String(raw.content ?? ''),
    dueDate: raw.dueDate ? String(raw.dueDate).slice(0, 10) : '',
    done: raw.done === true || raw.done === 'true',
  };
}

export async function fetchTodos() {
  const res = await fetch(getEndpoint());
  if (!res.ok) {
    throw new Error(`一覧の取得に失敗しました (${res.status})`);
  }
  const data = await res.json();
  if (!data.ok || !Array.isArray(data.todos)) {
    throw new Error(data.error || '一覧の取得に失敗しました');
  }
  return data.todos.map(normalizeTodo);
}

async function postAction(body) {
  const res = await fetch(getEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`保存に失敗しました (${res.status})`);
  }
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.error || '保存に失敗しました');
  }
  return data;
}

export function createTodo({ title, content, dueDate }) {
  return postAction({ action: 'create', title, content, dueDate });
}

export function updateTodo({ id, title, content, dueDate, done }) {
  return postAction({ action: 'update', id, title, content, dueDate, done });
}
