import "dayjs/locale/pl";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import clsx from "clsx";
import dayjs from "dayjs";

import { navigate, RouteComponentProps, useParams } from "@reach/router";

import { getDayRoute, getMonthRoute } from "../App";
import BackIcon from "../components/icons/back-icon";
import CloseIcon from "../components/icons/close-icon";
import EditIcon from "../components/icons/edit-icon";
import PlusIcon from "../components/icons/plus-icon";
import TrashIcon from "../components/icons/trash-icon";
import Button from "../components/ui/button";
import { useSubscribeToMonthEvents } from "../hooks/use-subscribe-to-month-events";
import { useDayEvents, useEventsStore } from "../store/events";
import { useInterfaceStore } from "../store/interface";
import { getHourFromTimeWindow } from "../utils/get-hour-from-time-window";
import { hexToRgba } from "../utils/hex-to-rgba";
import { getDatabase, ref, remove } from "firebase/database";
import { useDayFromParams } from "../hooks/use-day-from-params";

dayjs.locale("pl");

const TIME_WINDOWS = [...Array(44).keys()] as const;

interface ITimeMarkers {
    onAddEventByPointerPress: (timeWindow: number) => void;
}
const TimeMarkers: React.FC<ITimeMarkers> = ({ onAddEventByPointerPress }) => {
    const pressTimeout = useRef<NodeJS.Timeout>();
    const [pressing, setPressing] = useState<{ x: number; y: number } | false>(
        false
    );

    const startPressing = (e: React.PointerEvent<EventTarget>) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const timeWindow = parseInt(e.target.dataset.timeWindow!);

        setPressing({ x: e.clientX, y: e.clientY });

        pressTimeout.current = setTimeout(() => {
            onAddEventByPointerPress(timeWindow);
            setPressing(false);
        }, 1000);
    };

    const stopPressing = () => {
        clearTimeout(pressTimeout.current);
        setPressing(false);
    };

    return (
        <div className="absolute w-full text-left">
            <div
                className={clsx(
                    "fixed rounded-full bg-black bg-opacity-50 w-16 h-16 -translate-x-2/4 -translate-y-2/4",
                    pressing
                        ? "scale-100 transition duration-1000 ease-in"
                        : "scale-0"
                )}
                style={{
                    left: pressing ? pressing.x : undefined,
                    top: pressing ? pressing.y : undefined,
                }}
            />
            {TIME_WINDOWS.map((timeWindow) => (
                <p
                    key={timeWindow}
                    data-time-window={timeWindow}
                    onPointerDown={startPressing}
                    onPointerUp={stopPressing}
                    onPointerMove={stopPressing}
                    className={clsx(
                        "h-16 pl-1 even:bg-slate-300 even:bg-opacity-10 select-none cursor-pointer",
                        timeWindow % 4 ? "text-sm opacity-50" : "text-lg"
                    )}
                >
                    <span className="block -translate-y-[50%] pointer-events-none">
                        <span className="pointer-events-none">
                            {getHourFromTimeWindow(
                                dayjs(),
                                timeWindow,
                                "start"
                            ).format("HH:mm")}
                        </span>
                    </span>
                </p>
            ))}
        </div>
    );
};

interface IEventCard {
    eventId: string;
    event: CalendarEventData;
    displayEventDetails: (eventId: string, event: CalendarEventData) => void;
}
const EventCard: React.FC<IEventCard> = ({
    eventId,
    event,
    displayEventDetails,
}) => (
    <button
        onClick={() => displayEventDetails(eventId, event)}
        className="block relative z-10 ml-2 md:ml-4 my-1 p-2 rounded-xl overflow-hidden"
        style={{
            gridRowStart: event.timeWindows[0] + 1,
            gridRowEnd: event.timeWindows[event.timeWindows.length - 1] + 2,
            backgroundColor: hexToRgba(event.color, 0.4),
            border: `1px solid ${event.color}`,
        }}
    >
        <span className="leading-none block text-xs md:text-base md:leading-none font-thin">
            {event.name}
        </span>
    </button>
);

interface IPlaceholderCard {
    onAddEventByPointerPress: (timeWindow: number | null) => void;
    startTimeWindow?: number;
    endTimeWindow?: number;
}
const PlaceholderCard: React.FC<IPlaceholderCard> = ({
    onAddEventByPointerPress,
    startTimeWindow,
    endTimeWindow,
}) => {
    const { newEventModalOpened } = useInterfaceStore();

    if (typeof startTimeWindow !== "number") {
        return null;
    }

    if (typeof endTimeWindow !== "number") {
        return (
            <div
                className="relative z-10 ml-2 md:ml-4 my-1 p-2 rounded-lg overflow-hidden"
                style={{
                    gridRowStart: startTimeWindow + 1, // +1 because grid rows start from 1, timeWindows start from 0
                    gridRowEnd: startTimeWindow + 2, // +1 + 1 = +2 because we want to
                    backgroundColor: `rgb(255, 255, 255, 0.2)`,
                    border: `1px solid white`,
                }}
            />
        );
    }

    return (
        <div
            className="relative z-10 ml-2 md:ml-4 my-1 p-2 rounded-lg overflow-hidden flex items-center justify-center"
            style={{
                gridRowStart: startTimeWindow + 1,
                gridRowEnd: endTimeWindow + 2,
                backgroundColor: `rgb(255, 255, 255, 0.4)`,
                border: `1px solid white`,
            }}
        >
            <button
                onClick={() => {
                    newEventModalOpened({
                        start: startTimeWindow!,
                        end: endTimeWindow!,
                    });
                    onAddEventByPointerPress(null);
                }}
                title="Dodaj event w tym czasie"
                className="cursor-pointer p-3 rounded-full bg-black bg-opacity-10 hover:bg-opacity-30"
            >
                <PlusIcon className="h-10 w-10" />
            </button>
        </div>
    );
};

interface IEventDetailsModal {
    eventData: [string, CalendarEventData];
    closeEventDetails: () => void;
}
const EventDetailsModal: React.FC<IEventDetailsModal> = ({
    eventData: [eventId, event],
    closeEventDetails,
}) => {
    const eventRemoved = useEventsStore((state) => state.eventRemoved);

    const date = useDayFromParams();

    const deleteEvent = () => {
        if (window.confirm("Czy na pewno chcesz usunąć ten event?")) {
            remove(
                ref(getDatabase(), date.format(`YYYY/MM/D/[${eventId}]/`))
            ).then(() => eventRemoved(eventId, date.toDate()));
        }
    };

    return (
        <div className="sticky bottom-0 left-0 right-0 z-[100] bg-gray-600">
            <div
                className="p-4"
                style={{
                    background: hexToRgba(event.color, 0.4),
                    borderTop: `1px solid ${event.color}`,
                }}
            >
                <h2 className="text-2xl mb-4 font-light">{event.name}</h2>

                <p className="italic font-thin tracking-widest mb-6">
                    {event.note}
                </p>

                {event.email && (
                    <div className="my-2">
                        <span>Email:&nbsp;</span>
                        <a
                            href={`mailto:${event.email}`}
                            className="text-inherit"
                        >
                            {event.email}
                        </a>
                    </div>
                )}

                {event.phone && (
                    <div className="my-2">
                        <span>Numer telefonu:&nbsp;</span>
                        <a //
                            href={`tel:${event.phone}`}
                            className="text-inherit"
                        >
                            {event.phone}
                        </a>
                    </div>
                )}

                <div className="flex justify-between pt-4">
                    <Button variant="light-bg" onClick={deleteEvent}>
                        <TrashIcon />
                    </Button>
                    <Button variant="light-bg" onClick={closeEventDetails}>
                        <CloseIcon />
                    </Button>
                    <Button variant="light-bg">
                        <EditIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};

const useCalendarDay = () => {
    const date = useDayFromParams();
    useSubscribeToMonthEvents(date);

    const events = useDayEvents(date);

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

    return { events, date, isEventFinished };
};
interface Day extends RouteComponentProps {}

const Day: React.FC<Day> = () => {
    const { events, date } = useCalendarDay();

    const [eventDetailsDisplayed, setEventDetailsModaled] = //
        useState<[string, CalendarEventData] | false>(false);

    const displayEventDetails = useCallback(
        (eventId: string, event: CalendarEventData) =>
            setEventDetailsModaled([eventId, event]),
        []
    );
    const closeEventDetails = useCallback(
        () => setEventDetailsModaled(false),
        []
    );

    const [pointerPressState, setPointerPressState] = useState<{
        startTimeWindow?: number;
        endTimeWindow?: number;
    } | null>(null);

    const onAddEventByPointerPress = useCallback(
        (timeWindow: number | null) => {
            if (!timeWindow) {
                setPointerPressState(null);
                return;
            }

            const pressEventStarted = pointerPressState === null;

            if (pressEventStarted) {
                setPointerPressState({ startTimeWindow: timeWindow });
                return;
            }

            const pressedEndTimeIsSmallerThanStartTime =
                typeof pointerPressState.startTimeWindow === "number" &&
                timeWindow < pointerPressState.startTimeWindow;

            if (pressedEndTimeIsSmallerThanStartTime) {
                setPointerPressState(null);
                return;
            }

            const pressEventEndedSuccessfully =
                typeof pointerPressState.endTimeWindow !== "number";

            if (pressEventEndedSuccessfully) {
                setPointerPressState((prev) => ({
                    ...prev,
                    endTimeWindow: timeWindow,
                }));
                return;
            }

            setPointerPressState(null);
        },
        [pointerPressState]
    );

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    navigate(getMonthRoute(date));
                    break;
                case "ArrowLeft":
                    navigate(getDayRoute(date.subtract(1, "day")));
                    break;
                case "ArrowRight":
                    navigate(getDayRoute(date.add(1, "day")));
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [date]);

    const onBackClick = useCallback(() => navigate(getMonthRoute(date)), []);

    return (
        <div>
            <div className="sticky top-0 bg-[#242424] z-50 py-2 mb-4 flex justify-center">
                <Button variant="secondary" onClick={onBackClick}>
                    <BackIcon />
                </Button>

                <h1 className="text-3xl ml-4 font-thin">
                    {date.format("DD MMMM YYYY")}
                </h1>
            </div>

            <div className="relative pl-10 grid grid-cols-4 grid-rows-[repeat(44,4rem)]">
                <TimeMarkers
                    onAddEventByPointerPress={onAddEventByPointerPress}
                />

                {events.map(([eventId, event]) => (
                    <EventCard
                        key={eventId}
                        event={event}
                        eventId={eventId}
                        displayEventDetails={displayEventDetails}
                    />
                ))}

                <PlaceholderCard
                    onAddEventByPointerPress={onAddEventByPointerPress}
                    {...pointerPressState}
                />
            </div>

            {eventDetailsDisplayed && (
                <EventDetailsModal
                    eventData={eventDetailsDisplayed}
                    closeEventDetails={closeEventDetails}
                />
            )}
        </div>
    );
};

export default Day;
