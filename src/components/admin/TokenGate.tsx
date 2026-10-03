import { useState } from "react";
import type { FormEvent } from "react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { ApiError, checkAdminSession } from "@/services/api";

type TokenGateProps = {
    onUnlock: (token: string) => void;
    rejected: boolean;
};

export function TokenGate({ onUnlock, rejected }: TokenGateProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const token = value.trim();

        if (token.length === 0) {
            return;
        }

        setError(null);
        setChecking(true);

        try {
            await checkAdminSession(token);
            onUnlock(token);
        } catch (checkError) {
            if (checkError instanceof ApiError) {
                setError(checkError.message);
            } else {
                setError("Unable to reach the server. Check your connection.");
            }
        } finally {
            setChecking(false);
        }
    }

    return (
        <Section id="admin">
            <Container>
                <SectionHeading number="00" title="Admin" />

                <form
                    onSubmit={handleSubmit}
                    className="
                        mt-6
                        max-w-sm
                        rounded-2xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        p-6
                        shadow-[inset_0_1px_0_var(--glass-highlight)]
                        backdrop-blur-xl
                        backdrop-saturate-160
                    "
                >
                    <label
                        htmlFor="admin-token"
                        className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)"
                    >
                        Admin token
                    </label>

                    <input
                        id="admin-token"
                        type="password"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        autoComplete="off"
                        className="
                            mt-3
                            w-full
                            rounded-lg
                            border
                            border-(--glass-border)
                            bg-white/40
                            px-3
                            py-2
                            text-[13px]
                            text-(--ink)
                            outline-none
                            focus:border-(--accent-strong)
                            dark:bg-black/20
                        "
                    />

                    <button
                        type="submit"
                        disabled={checking}
                        className="
                            mt-4
                            w-full
                            rounded-lg
                            border
                            border-(--accent-strong)
                            bg-(--accent-strong)
                            px-4
                            py-2
                            text-[13px]
                            font-medium
                            text-white
                            transition-colors
                            duration-150
                            hover:border-(--accent-deep)
                            hover:bg-(--accent-deep)
                            disabled:opacity-60
                        "
                    >
                        {checking ? "Checking…" : "Unlock"}
                    </button>

                    {rejected && error === null && (
                        <p className="mt-3 font-mono text-[11px] text-(--accent-strong)">
                            The token was rejected. Sign in again.
                        </p>
                    )}

                    {error !== null && (
                        <p className="mt-3 font-mono text-[11px] text-red-500">{error}</p>
                    )}
                </form>
            </Container>
        </Section>
    );
}
