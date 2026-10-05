import { useCallback, useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

import { AdminToastContext } from "./toastContext";

export function AdminToastProvider({ children }: PropsWithChildren) {
    const [toast, setToast] = useState<string | null>(null);
    const timer = useRef(0);

    useEffect(() => {
        const pending = timer.current;

        return () => {
            window.clearTimeout(pending);
        };
    }, []);

    const notify = useCallback((message: string) => {
        setToast(message);
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
                    role="status"
                    className="
                        fixed
                        right-4
                        top-16
                        z-[70]
                        rounded-2xl
                        bg-(--accent-strong)
                        px-4
                        py-2.5
                        text-[13px]
                        font-medium
                        text-white
                        shadow-lg
                    "
                >
                    {toast}
                </div>
            )}
        </AdminToastContext.Provider>
    );
}
