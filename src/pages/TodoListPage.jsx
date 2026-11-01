import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTodos, updateTodo } from '@/api/todos';
import TodoDateGroup from '@/components/TodoDateGroup';
import { groupTodosByDue } from '@/utils/todoDates';

export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadTodos = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await fetchTodos();
      setTodos(list);
      setStatus('ready');
    } catch (err) {
      setLoadError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const groups = useMemo(() => groupTodosByDue(todos), [todos]);

  async function handleToggle(todo) {
    const next = { ...todo, done: !todo.done };
    setActionError('');
    setBusyId(todo.id);
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? next : t)));
    try {
      await updateTodo(next);
    } catch (err) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-12 sm:pt-16">
      <header className="animate-fade-up">
        <p className="text-sm font-medium text-accent">My Notes</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">やることノート</h1>
        <p className="mt-3 text-sm text-ink-muted">日々のタスクを、日付ごとに整理します</p>
      </header>

      {actionError && (
        <p role="alert" className="mt-8 rounded-2xl border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay-deep">
          {actionError}
        </p>
      )}

      {status === 'loading' && <p className="mt-16 text-center text-ink-muted">読み込み中です…</p>}

      {status === 'error' && (
        <div className="mt-16 text-center">
          <p role="alert" className="text-clay-deep">{loadError}</p>
          <button
            type="button"
            onClick={loadTodos}
            className="mt-4 rounded-full border border-line-strong px-5 py-2 text-sm transition hover:border-accent hover:text-accent"
          >
            もう一度読み込む
          </button>
        </div>
      )}

      {status === 'ready' && todos.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-ink-muted">まだ書き込みがありません</p>
          <Link to="/new" className="mt-4 inline-block text-accent underline underline-offset-4 hover:text-accent-deep">
            最初の予定を書き込む
          </Link>
        </div>
      )}

      {status === 'ready' && groups.length > 0 && (
        <div className="mt-12 divide-y divide-line">
          {groups.map((group) => (
            <TodoDateGroup
              key={group.dueDate || 'someday'}
              group={group}
              busyId={busyId}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
}
