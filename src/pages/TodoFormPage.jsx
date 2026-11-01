import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createTodo, fetchTodos, updateTodo } from '@/api/todos';
import TodoForm from '@/components/TodoForm';

export default function TodoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initial, setInitial] = useState(null);
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    fetchTodos()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((todo) => todo.id === id);
        if (found) {
          setInitial(found);
          setStatus('ready');
        } else {
          setLoadError('この書き込みは見つかりませんでした');
          setStatus('error');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  async function handleSave(values) {
    if (isEdit) {
      await updateTodo({ ...initial, ...values });
    } else {
      await createTodo(values);
    }
    navigate('/');
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-14">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        ノートに戻る
      </Link>

      <header className="animate-fade-up mt-8 border-b border-line pb-6">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {isEdit ? '書き直す' : '書き込む'}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {isEdit ? '予定の内容や期日を直します' : '新しい予定を一行ずつ書き留めます'}
        </p>
      </header>

      <div className="animate-fade-up mt-8">
        {status === 'loading' && <p className="text-ink-muted">読み込み中です…</p>}

        {status === 'error' && (
          <p role="alert" className="text-clay-deep">
            {loadError}
          </p>
        )}

        {status === 'ready' && (
          <TodoForm key={id ?? 'new'} initial={initial} onSave={handleSave} onCancel={() => navigate('/')} />
        )}
      </div>
    </main>
  );
}
