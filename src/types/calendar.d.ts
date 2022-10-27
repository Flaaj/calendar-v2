declare type CalendarEventData = {
  addedBy: string;
  addedDate: number;
  color: string;
  email: string;
  name: string;
  note: string;
  phone: string;
  timeWindows: number[];
};
declare type CalendarEvent = Record<string, CalendarEventData>;
