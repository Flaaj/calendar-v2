import dayjs, { Dayjs } from "dayjs";
import { useMemo } from "react";
import create from "zustand";
import { immer } from "zustand/middleware/immer";

const getDayKey = (date: Date | Dayjs) => dayjs(date).format("YYYY/MM/DD");

interface EventsState {
    events: { [key: string]: CalendarEvent };
    eventAdded: (eventId: string, event: CalendarEventData, eventDate: Date) => void;
    eventRemoved: (eventId: string, eventDate: Date) => void;
};

export const useEventsStore = create(immer<EventsState>((set, get) => ({
    events: {},
    eventAdded: (eventId, event, eventDate) =>
        set((state) => {
            const day = getDayKey(eventDate);
            if (!get().events[day]) {
                state.events[day] = {};
            }
            state.events[day][eventId] = event;
        }),
    eventRemoved: (eventId, eventDate) =>
        set((state) => {
            delete state.events[getDayKey(eventDate)][eventId];
        }),
})));

export const useDayEvents = (date: Date | Dayjs) => {
    const events = useEventsStore((state) => state.events[getDayKey(date)]);
    return useMemo(
        () =>
            // map object to array of entries and sort them by event time
            events
                ? Object.entries(events).sort(([, eventA], [, eventB]) => {
                      if (eventA.timeWindows[0] < eventB.timeWindows[0])
                          return -1;

                      if (eventA.timeWindows[0] > eventB.timeWindows[0])
                          return 1;

                      if (
                          eventA.timeWindows[eventA.timeWindows.length - 1] <
                          eventB.timeWindows[eventB.timeWindows.length - 1]
                      )
                          return -1;

                      return 1;
                  })
                : [],
        [events]
    );
};
