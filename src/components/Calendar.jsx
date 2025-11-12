import { useMemo, useState } from "react";
import "./Calendar.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addMonths(date, amount) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + amount);
  return newDate;
}

function getCalendarMatrix(activeDate) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();

  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ key: `prev-${i}`, label: "", inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `${year}-${month}-${day}`,
      label: String(day),
      inCurrentMonth: true,
    });
  }

  while (cells.length < 42) {
    const index = cells.length - daysInMonth - firstWeekday;
    cells.push({ key: `next-${index}`, label: "", inCurrentMonth: false });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

export function Calendar() {
  const [activeDate, setActiveDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const calendarMatrix = useMemo(
    () => getCalendarMatrix(activeDate),
    [activeDate],
  );

  const monthLabel = activeDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar">
      <header className="calendar__header">
        <button
          type="button"
          className="calendar__nav-button"
          aria-label="Previous month"
          onClick={() => setActiveDate((prev) => addMonths(prev, -1))}
        >
          ‹
        </button>
        <h1 className="calendar__title">{monthLabel}</h1>
        <button
          type="button"
          className="calendar__nav-button"
          aria-label="Next month"
          onClick={() => setActiveDate((prev) => addMonths(prev, 1))}
        >
          ›
        </button>
      </header>
      <div className="calendar__grid">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="calendar__weekday">
            {weekday}
          </div>
        ))}
        {calendarMatrix.flat().map((cell) => (
          <div
            key={cell.key}
            className={`calendar__cell${
              cell.inCurrentMonth ? " calendar__cell--current" : ""
            }`}
          >
            {cell.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;

