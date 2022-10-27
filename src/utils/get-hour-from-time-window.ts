import { Dayjs } from "dayjs";

const TIME_WINDOW_DURATION = 15; // minutes

export const getHourFromTimeWindow = (
    date: Dayjs,
    timeWindow: number,
    type: "start" | "end"
) =>
    date
        .hour(7) //   start from
        .minute(0) // 7:00 AM.
        .add(TIME_WINDOW_DURATION * timeWindow, "minutes")
        .add(type === "end" ? TIME_WINDOW_DURATION : 0, "minutes"); // to get the end date of a timeWindow, add it's one full duration
