import { useMemo, useState } from "react";
import "./Calendar.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthStartDay(year, month) {
  return new Date(year, month, 1).getDay();
}

function addMonths(date, amount) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + amount);
  return newDate;
}

function getCalendarMatrix(activeDate) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();

  const startDay = getMonthStartDay(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const cells = [];

  for (let i = 0; i < startDay; i += 1) {
    const day = daysInPrevMonth - startDay + i + 1;
    cells.push({
      key: `prev-${month}-${day}`,
      label: "",
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `${year}-${month}-${day}`,
      label: String(day),
      inCurrentMonth: true,
      dateValue: new Date(year, month, day),
    });
  }

  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({
      key: `next-${month + 1}-${nextDay}`,
      label: "",
      inCurrentMonth: false,
    });
    nextDay += 1;
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

function isSameDate(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar() {
  const [activeDate, setActiveDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const today = useMemo(() => new Date(), []);

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
        {calendarMatrix.flat().map((cell) => {
          const isToday = cell.inCurrentMonth
            ? isSameDate(cell.dateValue, today)
            : false;

          return (
            <div
              key={cell.key}
              className={`calendar__cell${
                cell.inCurrentMonth ? " calendar__cell--current" : ""
              }${isToday ? " calendar__cell--today" : ""}`}
            >
              {cell.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;

