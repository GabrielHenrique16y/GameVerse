export const daysToSeconds = (days: string) => {
    const daysNumber = parseInt(days, 10);
    return daysNumber * 24 * 60 * 60;
};

