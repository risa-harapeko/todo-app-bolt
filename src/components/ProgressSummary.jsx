import { useEffect, useRef, useState } from 'react';
import { getDaysLeft } from '@/utils/todoDates';

function AnimatedNumber({ value, duration = 500 }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display}</>;
}

function ProgressTrack({ done, total, label, sublabel }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-sage-deep"><AnimatedNumber value={done} /></span>
          /<AnimatedNumber value={total} />件完了
        </p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-sage transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {sublabel && <p className="mt-1.5 text-xs text-ink-muted">{sublabel}</p>}
    </div>
  );
}

export default function ProgressSummary({ todos }) {
  const todayTodos = todos.filter((t) => t.dueDate && getDaysLeft(t.dueDate) === 0);
  const todayDone = todayTodos.filter((t) => t.done).length;
  const totalDone = todos.filter((t) => t.done).length;
  const total = todos.length;

  return (
    <section className="animate-fade-up mt-10 rounded-3xl border border-line bg-surface px-6 py-6 shadow-[0_1px_2px_rgba(47,52,55,0.04),0_18px_40px_-28px_rgba(47,52,55,0.25)] sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        {todayTodos.length > 0 ? (
          <ProgressTrack
            done={todayDone}
            total={todayTodos.length}
            label="今日のやること"
          />
        ) : (
          <div>
            <p className="text-sm font-medium text-ink">今日のやること</p>
            <p className="mt-2 text-sm text-ink-muted">今日のやることはありません</p>
          </div>
        )}
        <div className="sm:w-px sm:self-stretch" />
        <ProgressTrack
          done={totalDone}
          total={total}
          label="全体の完了率"
          sublabel={total > 0 ? `${Math.round((totalDone / total) * 100)}% 完了` : undefined}
        />
      </div>
    </section>
  );
}
