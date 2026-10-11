import { useCallback, useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

import { AdminToastContext, type AdminToastKind } from "./toastContext";

export function AdminToastProvider({ children }: PropsWithChildren) {
    const [toast, setToast] = useState<{ message: string; kind: AdminToastKind } | null>(
        null,
    );
    const timer = useRef(0);

    useEffect(() => {
        const pending = timer.current;

        return () => {
            window.clearTimeout(pending);
        };
    }, []);

    const notify = useCallback((message: string, kind: AdminToastKind = "success") => {
        setToast({ message, kind });
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
            setToast(null);
        }, 2200);
    }, []);

    return (
        <AdminToastContext.Provider value={notify}>
            {children}

            {toast !== null && (
                <div
                    role={toast.kind === "error" ? "alert" : "status"}
                    className={`
                        fixed
                        right-4
                        top-16
                        z-[70]
                        rounded-2xl
                        px-4
                        py-2.5
                        text-[13px]
                        font-medium
                        text-white
                        shadow-lg
                        ${toast.kind === "error" ? "bg-red-600" : "bg-(--accent-strong)"}
                    `}
                >
                    {toast.message}
                </div>
            )}
        </AdminToastContext.Provider>
    );
}
