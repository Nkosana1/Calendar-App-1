import { useMemo } from "react";
import "./Calendar.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCalendarMatrix(activeDate) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const leadingBlankDays = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const cells = [];

  for (let i = 0; i < leadingBlankDays; i += 1) {
    cells.push({ key: `prev-${i}`, label: "", isCurrentMonth: false });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const key = `${year}-${month}-${day}`;
    cells.push({ key, label: String(day), isCurrentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const index = cells.length - totalDays - leadingBlankDays;
    cells.push({ key: `next-${index}`, label: "", isCurrentMonth: false });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

export function Calendar({ date = new Date() }) {
  const calendarMatrix = useMemo(() => getCalendarMatrix(date), [date]);

  const monthLabel = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar">
      <header className="calendar__header">
        <h1 className="calendar__title">{monthLabel}</h1>
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
              cell.isCurrentMonth ? " calendar__cell--current" : ""
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

