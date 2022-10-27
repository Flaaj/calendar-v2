import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

type TimeWindows = {
    start: number;
    end: number;
};

interface InterfaceState {
    isNewEventModalOpen: boolean;
    initialTimeWindows: null | TimeWindows;
    newEventModalOpened: (timeWindows?: TimeWindows) => void;
    newEventModalClosed: () => void;
}

export const useInterfaceStore = create(immer<InterfaceState>((set) => ({
    isNewEventModalOpen: false,
    initialTimeWindows: null,
    newEventModalOpened: (timeWindows) =>
        set((state) => {
            if (timeWindows) {
                state.initialTimeWindows = timeWindows;
            }
            state.isNewEventModalOpen = true;
        }),
    newEventModalClosed: () =>
        set((state) => {
            state.isNewEventModalOpen = false;
            state.initialTimeWindows = null;
        }),
})));
