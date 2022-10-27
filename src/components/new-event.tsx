import React, { useMemo } from "react";

import dayjs from "dayjs";
import { getDatabase, push, ref } from "firebase/database";
import { Form, FormikProvider, useFormik } from "formik";
import { object, string } from "yup";

import { useAuthStore } from "../store/auth";
import { useInterfaceStore } from "../store/interface";
import { getHourFromTimeWindow } from "../utils/get-hour-from-time-window";
import { rangeArray } from "../utils/range-array";
import SelectInput from "./inputs/select-input";
import TextInput from "./inputs/text-input";
import Textarea from "./inputs/textarea";
import Button from "./ui/button";

const startTimeWindowOptions = [...Array(44).keys()].map((value) => ({
    value,
    label: getHourFromTimeWindow(dayjs(), value, "start").format("HH:mm"),
}));
const endTimeWindowOptions = [...Array(44).keys()].map((value) => ({
    value,
    label: getHourFromTimeWindow(dayjs(), value, "end").format("HH:mm"),
}));

type NewEventFormValues = CalendarEventData & {
    day: string;
    startTimeWindow?: number;
    endTimeWindow?: number;
};

type ValidationSchema<T extends Object> = { [key in keyof T]: any };

const NewEvent: React.FC = () => {
    const initialDate = useMemo(() => {
        const [y, m, d] = window.location.pathname.replace("/", "").split("/");

        const paramsAreCorrectLength =
            y.length === 4 && //
            m.length === 2 &&
            (d ? d.length === 2 : true);
        const paramsAreIntegers =
            !isNaN(parseInt(y)) &&
            !isNaN(parseInt(m)) &&
            (d ? !isNaN(parseInt(d)) : true);

        const paramsAreValid = paramsAreCorrectLength && paramsAreIntegers;

        if (!paramsAreValid) {
            return dayjs();
        }

        if (!d) {
            const today = dayjs();
            const firstDayOfMonth = dayjs(`${y}/${m}/01`);
            return firstDayOfMonth.isBefore(today, "day")
                ? today
                : firstDayOfMonth;
        }

        return dayjs(`${y}/${m}/${d}`);
    }, []);

    const { user } = useAuthStore();
    const { newEventModalClosed, initialTimeWindows } = useInterfaceStore();

    const newEventForm = useFormik({
        onSubmit({
            startTimeWindow,
            endTimeWindow,
            timeWindows,
            day,
            ...values
        }) {
            if (startTimeWindow! > endTimeWindow!) {
                newEventForm.setFieldError(
                    "endTimeWindow",
                    "Godzina zakończenia nie może być wcześniej, niż godzina rozpoczęcia"
                );
                return;
            }

            const event = {
                ...values,
                timeWindows: rangeArray(startTimeWindow!, endTimeWindow),
                addedDate: dayjs().format(),
            };

            push(
                ref(getDatabase(), dayjs(day).format("YYYY/MM/D")),
                event
            ).then(() => newEventModalClosed());
        },

        initialValues: {
            addedBy: user?.email,
            color: "#ffffff",
            name: "",
            note: "",
            startTimeWindow: initialTimeWindows?.start,
            endTimeWindow: initialTimeWindows?.end,
            addedDate: 0,
            phone: "",
            email: "",
            day: initialDate.format("YYYY-MM-DD"),
        } as NewEventFormValues,

        validationSchema: object().shape({
            name: string()
                .required("Podaj nazwę")
                .min(3, "Podaj nazwę dłuższą, niż 2 znaki"),
            startTimeWindow: string().required("Wybierz godzinę rozpoczęcia"),
            endTimeWindow: string().required("Wybierz godzinę zakończenia"),
        } as ValidationSchema<NewEventFormValues>),
    });

    return (
        <FormikProvider value={newEventForm}>
            <Form className="max-w-full w-96 px-5 text-left">
                <h2 className="my-2 text-2xl text-center font-thin">
                    Nowy event
                </h2>

                <TextInput name="name" label="Tytuł" className="w-full" />

                <div className="flex w-full justify-between">
                    <TextInput
                        name="day"
                        label="Data"
                        type="date"
                        className="w-3/4"
                    />
                    <TextInput
                        name="color"
                        label="Kolor"
                        type="color"
                        className="w-1/4 ml-2"
                    />
                </div>

                <div className="flex w-full justify-between">
                    <SelectInput
                        name="startTimeWindow"
                        label="Od"
                        options={startTimeWindowOptions}
                        className="w-full"
                    />
                    <SelectInput
                        name="endTimeWindow"
                        label="Do"
                        options={endTimeWindowOptions}
                        className="w-full ml-2"
                    />
                </div>

                <Textarea name="note" label="Notatka" className="w-full" />

                <h3 className="my-2 text-xl font-thin">Kontakt</h3>

                <div className="flex w-full justify-between">
                    <TextInput
                        name="email"
                        label="Email"
                        type="email"
                        className="w-full"
                    />
                    <TextInput
                        name="phone"
                        label="Numer telefonu"
                        type="phone"
                        className="w-full ml-2"
                    />
                </div>

                <Button type="submit" variant="main" className="my-4 w-full">
                    Potwierdź
                </Button>
            </Form>
        </FormikProvider>
    );
};

export default NewEvent;
