import { createContext, useContext } from "react";

export type AdminToastKind = "success" | "error";

export const AdminToastContext = createContext<
    (message: string, kind?: AdminToastKind) => void
>(() => {});

export function useAdminToast() {
    return useContext(AdminToastContext);
}
