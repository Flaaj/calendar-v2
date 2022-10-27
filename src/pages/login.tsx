import React from "react";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Form, FormikProvider, useFormik } from "formik";
import { object, string } from "yup";

import { RouteComponentProps } from "@reach/router";

import TextInput from "../components/inputs/text-input";
import Button from "../components/ui/button";

interface Login extends RouteComponentProps {}

const Login: React.FC<Login> = () => {
    const loginForm = useFormik({
        onSubmit: ({ email, password }) =>
            signInWithEmailAndPassword(getAuth(), email, password).catch(
                (err) => {
                    if (
                        err.message.includes("auth/user-not-found") ||
                        err.message.includes("auth/wrong-password")
                    ) {
                        loginForm.setFieldError(
                            "password",
                            "Nieprawidłowy email lub hasło"
                        );
                        return;
                    }
                    if (err.message.includes("auth/too-many-requests")) {
                        loginForm.setFieldError(
                            "password",
                            "Zbyt dużo nieudanych prób zalogowania, spróbuj ponownie później"
                        );
                        return;
                    }
                    loginForm.setFieldError(
                        "password",
                        "Coś poszło nie tak, spróbuj odświeżyć stonę"
                    );
                }
            ),

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
            <FormikProvider value={loginForm}>
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
                        Zaloguj
                    </Button>
                </Form>
            </FormikProvider>
        </main>
    );
};

export default Login;
