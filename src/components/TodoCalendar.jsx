import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  WEEKDAYS,
  parseDate,
  partsToYmd,
  todayYMD,
  daysInMonth,
  weekdayOf,
  shiftMonth,
  monthLabel,
  addDays,
  getDaysLeft,
} from '@/utils/todoDates';
import { useMediaQuery } from '@/utils/hooks';

const MAX_VISIBLE = 3;

export default function TodoCalendar({ todos }) {
  const today = todayYMD();
  const [cursor, setCursor] = useState(() => {
    const { year, month } = parseDate(today);
    return partsToYmd(year, month, 1);
  });
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const todosByDate = useMemo(() => {
    const map = new Map();
    for (const todo of todos) {
      if (!todo.dueDate) continue;
      if (!map.has(todo.dueDate)) map.set(todo.dueDate, []);
      map.get(todo.dueDate).push(todo);
    }
    return map;
  }, [todos]);

  const noDueTodos = useMemo(() => todos.filter((t) => !t.dueDate), [todos]);

  const cells = useMemo(() => {
    if (isDesktop) {
      return buildMonthCells(cursor, today, todosByDate);
    }
    return buildWeekCells(cursor, today, todosByDate);
  }, [cursor, today, todosByDate, isDesktop]);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-bold tracking-tight text-ink">{monthLabel(cursor)}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor(shiftMonth(cursor, -1))}
            aria-label="前月へ"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              const { year, month } = parseDate(today);
              setCursor(partsToYmd(year, month, 1));
            }}
            className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-accent hover:text-accent"
          >
            今日
          </button>
          <button
            type="button"
            onClick={() => setCursor(shiftMonth(cursor, 1))}
            aria-label="翌月へ"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isDesktop ? (
        <MonthGrid cells={cells} today={today} />
      ) : (
        <WeekList cells={cells} today={today} />
      )}

      {noDueTodos.length > 0 && <NoDueList todos={noDueTodos} />}
    </div>
  );
}

function buildMonthCells(cursor, today, todosByDate) {
  const { year, month } = parseDate(cursor);
  const total = daysInMonth(year, month);
  const firstWeekday = weekdayOf(cursor);
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ ymd: null, day: null, isToday: false, todos: [] });
  }
  for (let day = 1; day <= total; day++) {
    const ymd = partsToYmd(year, month, day);
    cells.push({
      ymd,
      day,
      isToday: ymd === today,
      todos: todosByDate.get(ymd) ?? [],
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ ymd: null, day: null, isToday: false, todos: [] });
  }
  return cells;
}

function buildWeekCells(cursor, today, todosByDate) {
  const { year, month } = parseDate(cursor);
  const first = weekdayOf(cursor);
  const startYMD = addDays(cursor, -first);
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const ymd = addDays(startYMD, i);
    const { month: ym, day: yd } = parseDate(ymd);
    cells.push({
      ymd,
      day: yd,
      inMonth: ym === month,
      isToday: ymd === today,
      todos: todosByDate.get(ymd) ?? [],
    });
  }
  return cells;
}

function todoStateClass(todo, ymd, today) {
  if (todo.done) return 'text-ink-muted line-through decoration-ink-muted/60';
  if (todo.dueDate && getDaysLeft(todo.dueDate) < 0) return 'text-clay-deep';
  return 'text-ink';
}

function MonthGrid({ cells, today }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid grid-cols-7 border-b border-line bg-surface-muted">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="py-2 text-center text-xs font-medium text-ink-muted"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => (
          <DayCell key={cell.ymd ?? `empty-${i}`} cell={cell} today={today} />
        ))}
      </div>
    </div>
  );
}

function DayCell({ cell, today }) {
  if (!cell.ymd) {
    return <div className="min-h-[7.5rem] border-b border-r border-line bg-surface-muted/40" />;
  }
  const visible = cell.todos.slice(0, MAX_VISIBLE);
  const extra = cell.todos.length - visible.length;
  const isToday = cell.isToday;

  return (
    <div
      className={`min-h-[7.5rem] border-b border-r border-line p-1.5 last:border-r-0 sm:p-2 ${
        isToday ? 'bg-sage-soft/70 ring-1 ring-inset ring-sage' : 'bg-surface'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
            isToday ? 'bg-sage text-white' : 'text-ink-muted'
          }`}
        >
          {cell.day}
        </span>
        {cell.todos.length > 0 && (
          <span className="text-[10px] text-ink-muted">{cell.todos.length}件</span>
        )}
      </div>
      <ul className="mt-1 space-y-0.5">
        {visible.map((todo) => (
          <li key={todo.id}>
            <Link
              to={`/edit/${todo.id}`}
              className={`block truncate rounded px-1 py-0.5 text-[11px] leading-tight transition hover:bg-surface-muted ${todoStateClass(
                todo,
                cell.ymd,
                today
              )}`}
              title={todo.title}
            >
              {todo.title}
            </Link>
          </li>
        ))}
        {extra > 0 && (
          <li className="px-1 text-[11px] text-ink-muted">他{extra}件</li>
        )}
      </ul>
    </div>
  );
}

function WeekList({ cells, today }) {
  return (
    <ul className="mt-4 space-y-3">
      {cells.map((cell) => (
        <li
          key={cell.ymd}
          className={`rounded-2xl border p-3 ${
            cell.isToday ? 'border-sage bg-sage-soft/60' : 'border-line bg-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                  cell.isToday ? 'bg-sage text-white' : 'text-ink-muted'
                }`}
              >
                {cell.day}
              </span>
              <span className="text-xs text-ink-muted">
                {WEEKDAYS[weekdayOf(cell.ymd)]}曜日
              </span>
            </div>
            {cell.todos.length > 0 && (
              <span className="text-xs text-ink-muted">{cell.todos.length}件</span>
            )}
          </div>
          {cell.todos.length === 0 ? (
            <p className="mt-2 text-xs text-ink-muted">予定なし</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {cell.todos.map((todo) => (
                <li key={todo.id}>
                  <Link
                    to={`/edit/${todo.id}`}
                    className={`block truncate rounded px-2 py-1 text-sm leading-snug transition hover:bg-surface-muted ${todoStateClass(
                      todo,
                      cell.ymd,
                      today
                    )}`}
                  >
                    {todo.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function NoDueList({ todos }) {
  return (
    <section className="mt-8 rounded-2xl border border-line border-dashed bg-surface p-4">
      <h3 className="text-sm font-medium text-ink-muted">期日なし</h3>
      <ul className="mt-2 space-y-1">
        {todos.map((todo) => (
          <li key={todo.id}>
            <Link
              to={`/edit/${todo.id}`}
              className={`block truncate rounded px-2 py-1 text-sm leading-snug transition hover:bg-surface-muted ${
                todo.done ? 'text-ink-muted line-through decoration-ink-muted/60' : 'text-ink'
              }`}
            >
              {todo.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
