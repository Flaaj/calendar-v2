import "./calendar.css";

import React, { useCallback, useMemo } from "react";

import clsx from "clsx";
import dayjs, { Dayjs } from "dayjs";
import ReactCalendar, { DateCallback, ViewCallback } from "react-calendar";

import { navigate, RouteComponentProps, useParams } from "@reach/router";

import { getDayRoute, getMonthRoute } from "../App";
import ChevronLeftIcon from "../components/icons/chevron-left-icon";
import ChevronRightIcon from "../components/icons/chevron-right-icon";
import { useSubscribeToMonthEvents } from "../hooks/use-subscribe-to-month-events";
import { useDayEvents } from "../store/events";
import { useAutoAnimate } from "../utils/auto-animate";
import { hexToRgba } from "../utils/hex-to-rgba";
import { getHourFromTimeWindow } from "../utils/get-hour-from-time-window";
import { useMonthFromParams } from "../hooks/use-month-from-params";

interface EventThumbnail extends React.ComponentProps<"li"> {}

const EventThumbnail: React.FC<EventThumbnail> = ({ style, children }) => (
    <li
        style={style}
        className="h-fit w-full px-1 rounded-lg border-2 border-transparent relative group hover:!border-white"
    >
        {children}
    </li>
);

interface Tooltip extends React.ComponentProps<"div"> {}

const Tooltip: React.FC<Tooltip> = ({ className, children }) => (
    <div
        className={clsx(
            "absolute z-10 text-background-900 bg-white p-3 top-0 translate-y-[calc(-50%_+_20px)] w-48 min-w-full opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-lg shadow-gray-800 rounded-md",
            className
        )}
        style={{ boxShadow: "0 2px 10px 4px rgb(0 0 0 / 10%)" }}
    >
        {children}
    </div>
);

const useCalendarTile = (date: Dayjs) => {
    const events = useDayEvents(date);

    const isTheFirstHalfOfWeek = dayjs(date).day() <= 4;

    const getEventStartHour = useCallback(
        (event: CalendarEventData) =>
            getHourFromTimeWindow(
                date, //
                event.timeWindows[0],
                "start"
            ).format("HH:mm"),
        [date]
    );
    const getEventEndHour = useCallback(
        (event: CalendarEventData) =>
            getHourFromTimeWindow(
                date,
                event.timeWindows[event.timeWindows.length - 1],
                "end"
            ).format("HH:mm"),
        [date]
    );

    const isEventFinished = useCallback(
        (event: CalendarEventData) => {
            const endDate = getHourFromTimeWindow(
                date,
                event.timeWindows[event.timeWindows.length - 1],
                "end"
            );

            return endDate.isBefore(Date.now());
        },
        [date]
    );

    return {
        events,
        isTheFirstHalfOfWeek,
        getEventStartHour,
        getEventEndHour,
        isEventFinished,
    };
};

interface CalendarTile {
    date: Date;
}
const CalendarTile: React.FC<CalendarTile> = ({ date }) => {
    const {
        events,
        isTheFirstHalfOfWeek,
        getEventStartHour,
        getEventEndHour,
        isEventFinished,
    } = useCalendarTile(dayjs(date));

    return (
        <div className="relative h-max w-full">
            <ul
                ref={useAutoAnimate()}
                className="h-full w-full min-h-[100px] flex flex-col gap-2 md:px-2"
            >
                {events.map(([eventId, event]) => (
                    <EventThumbnail
                        key={eventId}
                        style={
                            // prettier-ignore
                            isEventFinished(event)
                                ? {
                                      backgroundColor: hexToRgba("#000", 0.05),
                                      outline: "3px solid #000",
                                  }
                                : {
                                      backgroundColor: hexToRgba(event.color, 0.3),
                                      border: `1px solid ${event.color}`,
                                  }
                        }
                    >
                        <div className="text-xs md:text-md font-thin">
                            <span>{getEventStartHour(event)}</span>
                            <span className="hidden md:inline-block px-2">
                                -
                            </span>
                            <span className="hidden md:inline-block">
                                {getEventEndHour(event)}
                            </span>

                            <p className="text-center text-[0.625rem] leading-none mb-2 break-all">
                                {event.name}
                            </p>
                        </div>

                        <Tooltip
                            className={
                                isTheFirstHalfOfWeek // if the first half, display tooltip on the right, if the second type - on the left - so that it doesn't run off screen
                                    ? "left-[calc(100%_+_10px)]"
                                    : "right-[calc(100%_+_10px)]"
                            }
                        >
                            <p className="text-lg text-center leading-none font-bold mb-2">
                                {getEventStartHour(event)} -{" "}
                                {getEventEndHour(event)}
                            </p>

                            <p className="text-xl text-left leading-none font-extrabold mb-2">
                                {event.name}
                            </p>

                            <p className="text-lg text-left leading-8">
                                {event.note || "-"}
                            </p>
                        </Tooltip>
                    </EventThumbnail>
                ))}
            </ul>
        </div>
    );
};

const useCalendar = () => {
    const initialDate = useMonthFromParams();
    useSubscribeToMonthEvents(initialDate);

    const onActiveStartDateChange: ViewCallback = useCallback(
        ({ activeStartDate }) => navigate(getMonthRoute(activeStartDate)),
        []
    );

    const onClickDay: DateCallback = useCallback(
        (date) => {
            if (dayjs(date).isSame(initialDate, "month")) {
                navigate(getDayRoute(date));
            }
        },
        [initialDate]
    );

    const activeStartDate = useMemo(() => initialDate.toDate(), [initialDate]);

    return {
        onActiveStartDateChange,
        activeStartDate,
        onClickDay,
    };
};

interface Calendar extends RouteComponentProps {}

const Calendar: React.FC<Calendar> = () => {
    const { activeStartDate, onActiveStartDateChange, onClickDay } =
        useCalendar();

    return (
        <ReactCalendar
            calendarType="ISO 8601"
            activeStartDate={activeStartDate}
            onActiveStartDateChange={onActiveStartDateChange}
            tileContent={({ date }) => <CalendarTile date={date} />}
            onClickDay={onClickDay}
            prevLabel={<ChevronLeftIcon />}
            nextLabel={<ChevronRightIcon />}
        />
    );
};

export default Calendar;
