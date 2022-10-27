import React from "react";

import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { Form, FormikProvider, useFormik } from "formik";
import { object, string } from "yup";

import { RouteComponentProps } from "@reach/router";

import TextInput from "../components/inputs/text-input";
import Button from "../components/ui/button";

interface Register extends RouteComponentProps {}

const Register: React.FC<Register> = () => {
    const registerForm = useFormik({
        onSubmit: ({ email, password }) =>
            createUserWithEmailAndPassword(getAuth(), email, password),

        initialValues: {
            email: "",
            password: "",
        },

        validationSchema: object().shape({
            email: string()
                .email("Nieprawidłowy format adresu email")
                .required("Podaj swój email"),
            password: string() //
                .required("Podaj swoje hasło"),
        }),
    });

    return (
        <main>
            <FormikProvider value={registerForm}>
                <Form className="flex flex-col w-60 mx-auto">
                    <TextInput
                        name="email"
                        label="Email"
                        className="mt-4 w-full"
                    />
                    <TextInput
                        type="password"
                        name="password"
                        label="Hasło"
                        className="mt-4 w-full"
                    />

                    <Button
                        type="submit"
                        variant="main"
                        className="mt-6 w-fit mx-auto"
                    >
                        Rejestruj
                    </Button>
                </Form>
            </FormikProvider>
        </main>
    );
};

export default Register;
