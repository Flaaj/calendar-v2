import React, { PropsWithChildren, useEffect } from "react";

import { getAuth } from "firebase/auth";

import { RouteComponentProps } from "@reach/router";

import CalendarIcon from "../components/icons/calendar-icon";
import LogoutIcon from "../components/icons/logout-icon";
import PlusIcon from "../components/icons/plus-icon";
import NewEvent from "../components/new-event";
import Button from "../components/ui/button";
import ModalWindow from "../components/ui/modal-window";
import { useAuthStore } from "../store/auth";
import { useInterfaceStore } from "../store/interface";
import { useAutoAnimate } from "../utils/auto-animate";

const NewEventButton = () => {
    const { isNewEventModalOpen, newEventModalOpened, newEventModalClosed } =
        useInterfaceStore();

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!isNewEventModalOpen && e.key === " ") {
                e.preventDefault();
                newEventModalOpened();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isNewEventModalOpen]);

    return (
        <Button
            variant="outlined"
            onClick={() => newEventModalOpened()}
            title="Dodaj nowe wydarzenie"
            className="flex items-center ml-6 mr-auto h-full"
        >
            <CalendarIcon />
            <PlusIcon />

            <ModalWindow
                isOpen={isNewEventModalOpen}
                handleClose={newEventModalClosed}
            >
                <NewEvent />
            </ModalWindow>
        </Button>
    );
};

const LogoutButton = () => (
    <button onClick={() => getAuth().signOut()} title="Wyloguj się">
        <LogoutIcon />
    </button>
);

interface Layout extends RouteComponentProps, PropsWithChildren {}

const Layout: React.FC<Layout> = ({ children }) => {
    const isSignedIn = useAuthStore((state) => state.isSignedIn);

    return (
        <div className="h-screen w-full flex flex-col">
            <header
                ref={useAutoAnimate()}
                className="w-full p-2 md:p-4 bg-[#242424] shadow-md flex justify-between items-center"
            >
                <h1 className="text-white text-4xl md:text-5xl font-thin">
                    Mechanik
                </h1>

                {isSignedIn && (
                    <>
                        <NewEventButton />
                        <LogoutButton />
                    </>
                )}
            </header>

            <main ref={useAutoAnimate()} className="h-full">
                {children}
            </main>

            <div id="modal-root" ref={useAutoAnimate()} />
        </div>
    );
};

export default Layout;
