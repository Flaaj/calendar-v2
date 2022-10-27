import { useEffect } from "react";

import dayjs, { Dayjs } from "dayjs";
import { getDatabase, onValue, ref } from "firebase/database";

import { useEventsStore } from "../store/events";

export const useSubscribeToMonthEvents = (date: Dayjs) => {
    const eventAdded = useEventsStore((state) => state.eventAdded);

    useEffect(() => {
        const dbEventsRef = ref(getDatabase(), date.format("YYYY/MM"));

        return onValue(dbEventsRef, (snapshot) => {
            const data = snapshot.val() as Record<string, CalendarEvent> | null;

            if (data) {
                for (const [day, events] of Object.entries(data)) {
                    for (const [eventId, event] of Object.entries(events)) {
                        const eventDate = dayjs(
                            date.format("YYYY/MM/") + day
                        ).toDate();

                        eventAdded(eventId, event, eventDate);
                    }
                }
            }
        });
    }, [date]);
};
