const DATASHEETS = import.meta.glob("./*.txt", { as: "raw", eager: true });
export const DATA = Object.values(DATASHEETS).join();
