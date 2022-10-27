export const rangeArray = (a: number, b: number = 0) => {
    const [min, max] = b > a ? [~~a, ~~b] : [~~b, ~~a];
    return [...Array(max - min + 1).keys()].map((i) => i + min);
};
