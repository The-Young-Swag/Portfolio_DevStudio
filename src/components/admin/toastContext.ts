import { createContext, useContext } from "react";

export const AdminToastContext = createContext<(message: string) => void>(() => {});

export function useAdminToast() {
    return useContext(AdminToastContext);
}
