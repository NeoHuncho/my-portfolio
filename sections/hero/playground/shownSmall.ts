import { createContext, useContext } from 'react';

/**
 * Whether the desk's objects are drawn small, on show beside others (the
 * phone's turntable and shelf, the desk's tray), rather than on the desk.
 * Small, their animated screens are a few hundred pixels across at most:
 * they repaint at half the size, and the tiniest less often.
 */
export const ShownSmall = createContext(false);

export const useShownSmall = () => useContext(ShownSmall);
