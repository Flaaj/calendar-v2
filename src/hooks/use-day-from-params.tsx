import { useMemo } from "react";

import dayjs from "dayjs";

import { useParams } from "@reach/router";

export const useDayFromParams = () => {
    const { year, month, day } = useParams<{
        year: string;
        month: string;
        day: string;
    }>();

    return useMemo(() => {
        const paramsAreCorrectLength =
            year.length === 4 && //
            month.length === 2 &&
            day.length === 2;
        const paramsAreIntegers =
            !isNaN(parseInt(year)) &&
            !isNaN(parseInt(month)) &&
            !isNaN(parseInt(day));

        const paramsAreValid =
            paramsAreCorrectLength && //
            paramsAreIntegers;

        return paramsAreValid //
            ? dayjs(`${year}/${month}/${day}`)
            : dayjs();
    }, [year, month, day]);
};
