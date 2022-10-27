import React from "react";

import dayjs from "dayjs";
// import { getDatabase } from "firebase/database";
import { Form, FormikProvider, useFormik } from "formik";
import { object, string } from "yup";

import { useAuthStore } from "../store/auth";
import Button from "./ui/button";
import TextInput from "./inputs/text-input";
import Textarea from "./inputs/textarea";

const EditEvent: React.FC = () => {
    const { user } = useAuthStore();

    const EditEventForm = useFormik({
        onSubmit(/* values */) {
            // const db = getDatabase();
            // const addedDate = dayjs().unix();
            // const event = { ...values, addedDate };
        },
        initialValues: {
            addedBy: user?.email,
            color: "#ffffff",
            name: "",
            note: "",
            timeWindows: [], // numbers from 0 to 43, each number is 15 minutes from 7:00 to 18:00
            addedDate: 0,
            phone: "",
            email: "",
            day: dayjs().format("YYYY-MM-DD"),
        } as CalendarEventData & {
            day: string;
        },
        validationSchema: object().shape({
            name: string()
                .required("Podaj nazwę")
                .min(3, "Podaj nazwę dłuższą, niż 2 znaki"),
        }),
    });

    return (
        <FormikProvider value={EditEventForm}>
            <Form className="max-w-full w-96 px-5 text-left">
                <h2 className="my-2 text-xl font-bold">Nowy event</h2>

                <TextInput //
                    name="name"
                    label="Tytuł"
                    className="w-full"
                />

                <div className="flex w-full justify-between">
                    <TextInput
                        name="day"
                        label="Data"
                        type="date"
                        className="w-full"
                    />
                    <TextInput
                        name="color"
                        label="Kolor"
                        type="color"
                        className="w-full ml-2"
                    />
                </div>

                <Textarea //
                    name="note"
                    label="Notatka"
                    className="w-full"
                />

                <h3 className="my-2 text-xl font-bold">Kontakt</h3>

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

export default EditEvent;
