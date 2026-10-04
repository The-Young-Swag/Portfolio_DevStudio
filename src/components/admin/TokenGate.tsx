import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Container, Section } from "@/components/layout";
import { ApiError, checkAdminSession } from "@/services/api";

type TokenGateProps = {
    onUnlock: (token: string) => void;
    rejected: boolean;
};

export function TokenGate({ onUnlock, rejected }: TokenGateProps) {
    const [value, setValue] = useState("");
    const [visible, setVisible] = useState(false);
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
                <div className="mx-auto mt-10 max-w-sm">
                    <div className="flex items-center gap-3">
                        <span
                            aria-hidden="true"
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-(--glass-border)
                                bg-(--glass-bg)
                                text-(--accent-strong)
                                shadow-[inset_0_1px_0_var(--glass-highlight)]
                            "
                        >
                            <Lock size={18} strokeWidth={2} />
                        </span>

                        <div>
                            <h1 className="font-display text-[24px] font-medium leading-tight text-(--ink)">
                                Admin sign in
                            </h1>

                            <p className="mt-0.5 font-mono text-[11px] text-(--graphite-soft)">
                                This site&apos;s private area
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="
                            mt-6
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

                        <div className="relative mt-3">
                            <input
                                id="admin-token"
                                type={visible ? "text" : "password"}
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="Paste the ADMIN_TOKEN value"
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-(--glass-border)
                                    bg-white/40
                                    py-2
                                    pl-3
                                    pr-11
                                    font-mono
                                    text-[13px]
                                    text-(--ink)
                                    outline-none
                                    focus:border-(--accent-strong)
                                    dark:bg-black/20
                                "
                            />

                            <button
                                type="button"
                                onClick={() => setVisible((shown) => !shown)}
                                aria-label={visible ? "Hide token" : "Show token"}
                                aria-pressed={visible}
                                className="
                                    absolute
                                    right-1
                                    top-1/2
                                    flex
                                    h-9
                                    w-9
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-(--graphite)
                                    transition-colors
                                    duration-150
                                    hover:text-(--accent-strong)
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-(--accent-strong)
                                "
                            >
                                {visible ? (
                                    <EyeOff size={16} strokeWidth={2} />
                                ) : (
                                    <Eye size={16} strokeWidth={2} />
                                )}
                            </button>
                        </div>

                        <p className="mt-3 text-[12.5px] leading-relaxed text-(--graphite)">
                            Enter the <span className="font-mono text-[12px]">ADMIN_TOKEN</span> from
                            the server environment. It is checked on every sign-in and saved
                            only in this browser tab — closing the tab signs you out.
                        </p>

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
                            {checking ? "Checking…" : "Sign in"}
                        </button>

                        {rejected && error === null && (
                            <p className="mt-3 font-mono text-[11px] text-(--accent-strong)">
                                The token was rejected. Sign in again.
                            </p>
                        )}

                        {error !== null && (
                            <p role="alert" className="mt-3 font-mono text-[11px] text-red-500">
                                {error}
                            </p>
                        )}
                    </form>
                </div>
            </Container>
        </Section>
    );
}
