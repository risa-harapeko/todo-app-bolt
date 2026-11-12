import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Calendar } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { fetchTodos, updateTodo } from '@/api/todos';
import TodoDateGroup from '@/components/TodoDateGroup';
import TodoCalendar from '@/components/TodoCalendar';
import ProgressSummary from '@/components/ProgressSummary';
import { groupTodosByDue } from '@/utils/todoDates';
import { useLocalStorage } from '@/utils/hooks';
import { markDragEnded } from '@/utils/dragState';

const DROP_ANIMATION = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.3' } },
  }),
};

const DRAG_THRESHOLD_PX = 8;
const LONG_PRESS_MS = 250;



export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [view, setView] = useLocalStorage('tasuku.view', 'list');
  const [activeTodo, setActiveTodo] = useState(null);

   const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: DRAG_THRESHOLD_PX } }),
    useSensor(TouchSensor, { activationConstraint: { delay: LONG_PRESS_MS, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

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

  function handleDragStart(event) {
    const todo = event.active.data.current?.todo;
    console.log('[DnD] onDragStart', { activeId: event.active.id, todoId: todo?.id, currentDueDate: todo?.dueDate });
    if (todo) setActiveTodo(todo);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    const activeId = active?.id;
    const overId = over?.id;
    const overDueDate = over?.data.current?.dueDate;
    console.log('[DnD] onDragOver', { activeId, overId, overDueDate });
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTodo(null);
    markDragEnded();

    const activeId = active?.id;
    const overId = over?.id;
    const todo = active.data.current?.todo;
    const targetDueDate = over?.data.current?.dueDate;
    console.log('[DnD] onDragEnd', {
      activeId,
      overId,
      todoId: todo?.id,
      currentDueDate: todo?.dueDate,
      targetDueDate,
    });

    if (!over) return;
    if (!todo) return;
    if (targetDueDate === undefined) return;
    if (targetDueDate === (todo.dueDate || '')) return;

    const updated = { ...todo, dueDate: targetDueDate };
    setActionError('');
    setBusyId(todo.id);
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    try {
      await updateTodo(updated);
    } catch (err) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function handleDragCancel() {
    setActiveTodo(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-12 sm:pt-16">
        <header className="animate-fade-up">
          <p className="text-sm font-medium text-accent">My Notes</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">やることノート</h1>
          <p className="mt-3 text-sm text-ink-muted">日々のタスクを、日付ごとに整理します</p>
        </header>

        {status === 'ready' && todos.length > 0 && (
          <>
            <ProgressSummary todos={todos} />

            <div className="mt-8 flex items-center justify-center">
              <div className="inline-flex rounded-full border border-line bg-surface p-1">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    view === 'list' ? 'bg-accent text-white shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <List size={15} aria-hidden="true" />
                  リスト
                </button>
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  aria-pressed={view === 'calendar'}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    view === 'calendar' ? 'bg-accent text-white shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Calendar size={15} aria-hidden="true" />
                  カレンダー
                </button>
              </div>
            </div>
          </>
        )}

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

        {status === 'ready' && groups.length > 0 && view === 'list' && (
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

        {status === 'ready' && todos.length > 0 && view === 'calendar' && (
          <TodoCalendar todos={todos} />
        )}
      </main>

      <DragOverlay dropAnimation={DROP_ANIMATION}>
        {activeTodo ? (
          <div className="pointer-events-none rounded-2xl border border-accent bg-surface px-4 py-3.5 shadow-xl">
            <p className={`text-base leading-snug ${activeTodo.done ? 'text-ink-muted line-through' : 'text-ink'}`}>
              {activeTodo.title}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
