import { useEffect, useMemo, useRef, useState } from "react";
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

function getDateKey(date) {
  return date.toISOString().split("T")[0];
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
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState({});
  const [eventTitle, setEventTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);
  const today = useMemo(() => new Date(), []);

  const calendarMatrix = useMemo(
    () => getCalendarMatrix(activeDate),
    [activeDate],
  );

  const monthLabel = activeDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const formattedSelectedDate = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedEvents =
    (selectedDateKey && events[selectedDateKey]) ? events[selectedDateKey] : [];

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleMonthNavigate = (offset) => {
    setActiveDate((prev) => {
      const next = addMonths(prev, offset);
      setSelectedDate((currentSelected) => {
        if (!currentSelected) {
          return new Date(next.getFullYear(), next.getMonth(), 1);
        }
        const targetDay = Math.min(
          currentSelected.getDate(),
          getDaysInMonth(next.getFullYear(), next.getMonth()),
        );
        return new Date(next.getFullYear(), next.getMonth(), targetDay);
      });
      return next;
    });
  };

  const handleAddEvent = (event) => {
    event.preventDefault();
    if (!eventTitle.trim() || !selectedDate || isSubmitting) return;
    const key = getDateKey(selectedDate);
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    setIsSubmitting(true);
    submitTimeoutRef.current = setTimeout(() => {
      setEvents((prev) => {
        const nextEvents = prev[key] ? [...prev[key]] : [];
        nextEvents.push({
          id: `${key}-${Date.now()}`,
          title: eventTitle.trim(),
        });
        return {
          ...prev,
          [key]: nextEvents,
        };
      });
      setEventTitle("");
      setIsSubmitting(false);
      submitTimeoutRef.current = null;
    }, 200);
  };

  return (
    <div className="calendar">
      <header className="calendar__header">
        <button
          type="button"
          className="calendar__nav-button"
          aria-label="Previous month"
          onClick={() => handleMonthNavigate(-1)}
        >
          ‹
        </button>
        <h1 className="calendar__title">{monthLabel}</h1>
        <button
          type="button"
          className="calendar__nav-button"
          aria-label="Next month"
          onClick={() => handleMonthNavigate(1)}
        >
          ›
        </button>
      </header>
      <div className="calendar__content">
        <div
          className="calendar__grid"
          role="grid"
          aria-readonly="true"
          aria-label="Calendar dates"
        >
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="calendar__weekday" role="columnheader">
              {weekday}
            </div>
          ))}
          {calendarMatrix.flat().map((cell) => {
            const isToday = cell.inCurrentMonth
              ? isSameDate(cell.dateValue, today)
              : false;
            const isSelected = cell.inCurrentMonth
              ? isSameDate(cell.dateValue, selectedDate)
              : false;
            const key =
              cell.inCurrentMonth && cell.dateValue
                ? getDateKey(cell.dateValue)
                : null;
            const cellEvents = key && events[key] ? events[key] : [];
            const indicatorLabel =
              cellEvents.length > 9 ? "9+" : String(cellEvents.length || "");
            const ariaLabel =
              cell.inCurrentMonth && cell.dateValue
                ? `${cell.dateValue.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}${
                    cellEvents.length
                      ? `. ${cellEvents.length} event${
                          cellEvents.length > 1 ? "s" : ""
                        }`
                      : ""
                  }`
                : undefined;

            return (
              <div
                key={cell.key}
                role={cell.inCurrentMonth ? "gridcell" : "presentation"}
                tabIndex={cell.inCurrentMonth ? 0 : -1}
                onClick={() => {
                  if (!cell.inCurrentMonth || !cell.dateValue) return;
                  setSelectedDate(cell.dateValue);
                }}
                onKeyDown={(evt) => {
                  if (
                    cell.inCurrentMonth &&
                    cell.dateValue &&
                    (evt.key === "Enter" || evt.key === " ")
                  ) {
                    evt.preventDefault();
                    setSelectedDate(cell.dateValue);
                  }
                }}
                className={`calendar__cell${
                  cell.inCurrentMonth ? " calendar__cell--current" : " calendar__cell--adjacent"
                }${cell.inCurrentMonth ? " calendar__cell--interactive" : ""}${
                  isToday ? " calendar__cell--today" : ""
                }${isSelected ? " calendar__cell--selected" : ""}${
                  cellEvents.length ? " calendar__cell--has-events" : ""
                }`}
                aria-selected={cell.inCurrentMonth ? isSelected : undefined}
                aria-label={ariaLabel}
              >
                <span className="calendar__cell-label" aria-hidden="true">
                  {cell.label}
                </span>
                {cellEvents.length > 0 && (
                  <span className="calendar__event-indicator" aria-hidden="true">
                    {indicatorLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <section className="calendar__details" aria-live="polite">
          <div className="calendar__details-heading">
            <h2 className="calendar__details-title">
              {formattedSelectedDate || "Select a date"}
            </h2>
            {selectedEvents.length > 0 && (
              <span className="calendar__details-count">
                {selectedEvents.length}{" "}
                {selectedEvents.length === 1 ? "event" : "events"}
              </span>
            )}
          </div>
          {selectedDate ? (
            <>
              <form
                className="calendar__event-form"
                onSubmit={handleAddEvent}
                aria-busy={isSubmitting}
              >
                <label className="calendar__event-label" htmlFor="event-title">
                  Add Event
                </label>
                <div className="calendar__event-inputs">
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    placeholder="e.g. Team stand-up at 9:30"
                    onChange={(evt) => setEventTitle(evt.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className={`calendar__event-submit${
                      isSubmitting ? " calendar__event-submit--loading" : ""
                    }`}
                    disabled={isSubmitting || !eventTitle.trim()}
                  >
                    {isSubmitting ? "Adding..." : "Add Event"}
                  </button>
                </div>
              </form>
              <ul className="calendar__event-list" aria-live="polite">
                {selectedEvents.length === 0 ? (
                  <li className="calendar__event-empty">No events yet.</li>
                ) : (
                  selectedEvents.map((item) => (
                    <li key={item.id} className="calendar__event-item">
                      {item.title}
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <p className="calendar__event-empty">
              Choose a date to add events.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Calendar;

