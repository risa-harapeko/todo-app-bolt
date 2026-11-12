import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { consumeDragJustEnded } from '@/utils/dragState';

const badgeTone = {
  overdue: 'bg-clay-soft text-clay-deep',
  soon: 'bg-ochre-soft text-ochre-ink',
  neutral: 'bg-surface-muted text-ink-muted',
};

export default function TodoRow({ todo, urgency, busy, onToggle }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `todo-${todo.id}`,
    data: { todo },
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      className={`flex items-center gap-4 rounded-2xl border border-line px-4 py-3.5 transition-all duration-200 sm:px-5 ${
        isDragging ? 'opacity-30 shadow-lg' : ''
      } ${
        todo.done ? 'bg-surface-muted' : 'bg-surface hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-18px_rgba(47,52,55,0.45)]'
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.done}
        aria-label={`${todo.title} を${todo.done ? '未完了に戻す' : '完了にする'}`}
        disabled={busy}
        onClick={() => onToggle(todo)}
        onPointerDown={(e) => e.stopPropagation()}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition duration-200 active:scale-90 disabled:cursor-wait disabled:opacity-60 ${
          todo.done
            ? 'border-ink-muted bg-ink-muted text-white'
            : 'border-line-strong bg-surface hover:border-accent'
        }`}
      >
        {todo.done && <Check size={14} strokeWidth={3} aria-hidden="true" />}
      </button>

      <div {...listeners} className="min-w-0 flex-1 cursor-grab active:cursor-grabbing">
        <Link
          to={`/edit/${todo.id}`}
          onClick={(e) => {
            if (consumeDragJustEnded()) e.preventDefault();
          }}
          className="group"
        >
          <p
            className={`text-base leading-snug transition-colors group-hover:text-accent sm:text-lg ${
              todo.done ? 'text-ink-muted line-through decoration-ink-muted/60' : 'text-ink'
            }`}
          >
            {todo.title}
          </p>
          {todo.content && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{todo.content}</p>}
        </Link>
      </div>

      {todo.done ? (
        <span className="shrink-0 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
          完了
        </span>
      ) : (
        <span className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${badgeTone[urgency.tone]}`}>
          {urgency.label}
        </span>
      )}
    </li>
  );
}
