import React, {
    ComponentProps,
    createContext,
    useContext,
    useEffect,
    useMemo,
} from "react";
import { createPortal } from "react-dom";

import useFocusTrap from "@charlietango/use-focus-trap";

import CloseIcon from "../icons/close-icon";
import Button from "./button";

const ModalContext = createContext({ closeModal: () => {} });

export const useModalWindow = () => useContext(ModalContext);

interface IModalWindow extends ComponentProps<"div"> {
    isOpen: boolean;
    handleClose: () => void;
    shouldCloseOnBackgroundClick?: boolean;
}

const ModalWindow: React.FC<IModalWindow> = ({
    isOpen,
    handleClose,
    children,
    className,
    shouldCloseOnBackgroundClick = true,
}) => {
    const contextValue = useMemo(
        () => ({ closeModal: handleClose }),
        [handleClose]
    );

    const onBackgroundClick = () => {
        if (shouldCloseOnBackgroundClick) {
            handleClose();
        }
    };

    const trapRef = useFocusTrap();

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <ModalContext.Provider value={contextValue}>
            <div
                onClick={onBackgroundClick}
                ref={trapRef}
                className="fixed inset-0 flex justify-center items-center bg-opacity-80 bg-white dark:bg-[#242424] dark:bg-opacity-80 isolate z-[10000]"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={
                        className ??
                        "p-4 bg-[#242424] border border-gray-200 rounded-lg max-h-screen overflow-auto"
                    }
                >
                    <div className="flex">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            title="Zamknij okno"
                            className="ml-auto w-fit h-fit rounded"
                        >
                            <CloseIcon />
                        </Button>
                    </div>

                    {children}
                </div>
            </div>
        </ModalContext.Provider>,
        document.getElementById("modal-root")!
    );
};
export default ModalWindow;
