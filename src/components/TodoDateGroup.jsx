import { getDueUrgency, formatDateParts, getGroupStatus } from '@/utils/todoDates';
import TodoRow from '@/components/TodoRow';

const pillTone = {
  overdue: 'bg-clay text-white',
  today: 'bg-ochre text-ink',
  tomorrow: 'bg-ochre text-ink',
  upcoming: 'bg-sage-soft text-sage-deep',
  someday: 'border border-dashed border-line-strong text-ink-muted',
};

const lineTone = {
  overdue: 'bg-clay',
  today: 'bg-ochre',
  tomorrow: 'bg-ochre',
  upcoming: 'bg-sage',
  someday: 'w-0 border-l-2 border-dashed border-line-strong',
};

export default function TodoDateGroup({ group, busyId, onToggle }) {
  const status = getGroupStatus(group.dueDate);
  const dateParts = group.dueDate ? formatDateParts(group.dueDate) : null;

  return (
    <section className="animate-fade-up grid gap-4 py-10 first:pt-0 sm:grid-cols-[10rem_1px_1fr] sm:gap-0">
      <header className="sm:pr-6">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wide ${pillTone[status.tone]}`}>
          {status.label}
        </span>
        {dateParts ? (
          <>
            <p className="mt-3 text-3xl font-bold leading-none tracking-tight text-ink">{dateParts.monthDay}</p>
            <p className="mt-2 text-sm text-ink-muted">{dateParts.weekday}</p>
          </>
        ) : (
          <p className="mt-3 text-3xl font-bold leading-none tracking-tight text-ink-muted">いつか</p>
        )}
      </header>

      <div aria-hidden="true" className={`hidden self-stretch sm:block ${lineTone[status.tone]}`} />

      <ul className="flex flex-col gap-3 sm:pl-6">
        {group.todos.map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            urgency={getDueUrgency(todo)}
            busy={busyId === todo.id}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </section>
  );
}
