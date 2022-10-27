import { useMemo } from "react";

import dayjs from "dayjs";

import { useParams } from "@reach/router";

export const useMonthFromParams = () => {
    const { year, month } = useParams<{ year: string; month: string }>();

    return useMemo(() => {
        const paramsAreCorrectLength =
            year.length === 4 && //
            month.length === 2;
        const paramsAreIntegers =
            !isNaN(parseInt(year)) && //
            !isNaN(parseInt(month));

        const paramsAreValid =
            paramsAreCorrectLength && //
            paramsAreIntegers;

        return paramsAreValid //
            ? dayjs(`${year}/${month}/01`)
            : dayjs();
    }, [year, month]);
};
