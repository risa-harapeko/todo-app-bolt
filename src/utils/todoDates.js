const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const DAY_MS = 24 * 60 * 60 * 1000;
const TOKYO_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function parseDate(ymd) {
  const [year, month, day] = ymd.split('-').map(Number);
  return { year, month, day };
}

function dayNumber(ymd) {
  const { year, month, day } = parseDate(ymd);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

export function getDaysLeft(dueDate, now = new Date()) {
  return dayNumber(dueDate) - dayNumber(TOKYO_DATE.format(now));
}

export function formatDateParts(dueDate) {
  const { year, month, day } = parseDate(dueDate);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return { monthDay: `${month}/${day}`, weekday: `${weekday}曜日` };
}

export function getDueUrgency(todo, now = new Date()) {
  if (!todo.dueDate) return { tone: 'neutral', label: '期日なし' };

  const daysLeft = getDaysLeft(todo.dueDate, now);

  if (daysLeft < 0) return { tone: 'overdue', label: `${-daysLeft}日超過` };
  if (daysLeft === 0) return { tone: 'soon', label: '今日まで' };
  if (daysLeft === 1) return { tone: 'soon', label: '明日まで' };
  return { tone: 'neutral', label: `あと${daysLeft}日` };
}

export function getGroupStatus(dueDate, now = new Date()) {
  if (!dueDate) return { tone: 'someday', label: 'いつか' };

  const daysLeft = getDaysLeft(dueDate, now);

  if (daysLeft < 0) return { tone: 'overdue', label: '期限切れ' };
  if (daysLeft === 0) return { tone: 'today', label: '今日' };
  if (daysLeft === 1) return { tone: 'tomorrow', label: '明日' };
  return { tone: 'upcoming', label: `あと${daysLeft}日` };
}

export function groupTodosByDue(todos) {
  const groups = new Map();
  for (const todo of todos) {
    if (!groups.has(todo.dueDate)) {
      groups.set(todo.dueDate, { dueDate: todo.dueDate, todos: [] });
    }
    groups.get(todo.dueDate).todos.push(todo);
  }
  return [...groups.values()].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
