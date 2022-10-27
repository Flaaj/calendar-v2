import "./App.css";

import React, { createContext, useContext, useEffect, useState } from "react";

import dayjs, { Dayjs } from "dayjs";
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { Redirect, Router } from "@reach/router";

import firebaseConfig from "../firebase.config";
import Layout from "./layouts/layout";
import Calendar from "./pages/calendar";
import Day from "./pages/day";
import Login from "./pages/login";
import { useAuthStore } from "./store/auth";
import Register from "./pages/register";

export const getMonthRoute = (date?: Date | Dayjs) =>
    dayjs(date).format("/YYYY/MM");
export const getDayRoute = (date?: Date | Dayjs) =>
    dayjs(date).format("/YYYY/MM/DD");

const App: React.FC = () => {
    const signedIn = useAuthStore((state) => state.signedIn);
    const signedOut = useAuthStore((state) => state.signedOut);
    const isSignedIn = useAuthStore((state) => state.isSignedIn);

    const [firebaseApp, setFirebaseApp] = useState<FirebaseApp>();

    useEffect(() => {
        setFirebaseApp(initializeApp(firebaseConfig));

        return getAuth().onAuthStateChanged((user) =>
            user ? signedIn(user) : signedOut()
        );
    }, []);

    const authStateIsUnknown = isSignedIn === null; // if known, isSignedIn equals true/false

    if (!firebaseApp || authStateIsUnknown) {
        return null;
    }

    return (
        <Layout>
            {!isSignedIn && ( //
                <Router>
                    <Register path="/register" />
                    <Login path="*" />
                </Router>
            )}

            {isSignedIn && (
                <Router>
                    <Calendar path=":year/:month" />
                    <Day path=":year/:month/:day" />
                    <Redirect from="*" to={getMonthRoute()} />
                </Router>
            )}
        </Layout>
    );
};

export default App;
