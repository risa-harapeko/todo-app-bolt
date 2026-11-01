import { useState } from 'react';

const inputClass =
  'w-full border-0 border-b border-line-strong bg-transparent px-1 py-3 text-lg text-ink placeholder:text-ink-muted/70 transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-0';

const labelClass = 'block text-xs font-medium tracking-widest text-ink-muted';

export default function TodoForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('タイトルを入力してください');
      return;
    }
    setTitleError('');
    setError('');
    setSubmitting(true);
    try {
      await onSave({ title: trimmedTitle, content: content.trim(), dueDate, done: initial?.done ?? false });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8 rounded-3xl border border-line bg-surface px-6 py-8 shadow-[0_1px_2px_rgba(47,52,55,0.04),0_18px_40px_-28px_rgba(47,52,55,0.3)] sm:px-8"
    >
      <div>
        <label htmlFor="todo-title" className={labelClass}>
          タイトル
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：歯医者の予約"
          maxLength={100}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? 'todo-title-error' : undefined}
          className={`mt-2 ${inputClass}`}
        />
        {titleError && (
          <p id="todo-title-error" className="mt-2 text-sm text-clay-deep">
            {titleError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="todo-content" className={labelClass}>
          内容
        </label>
        <textarea
          id="todo-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="例：午後の枠で"
          rows={3}
          className={`mt-2 resize-none leading-relaxed ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="todo-due" className={labelClass}>
          期日
        </label>
        <input
          id="todo-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`mt-2 ${inputClass}`}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-2xl border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay-deep">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-full px-5 py-2.5 text-sm text-ink-muted transition hover:text-ink disabled:opacity-50"
        >
          やめる
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-7 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-accent-deep hover:shadow-md disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {submitting ? '保存しています…' : '保存する'}
        </button>
      </div>
    </form>
  );
}
