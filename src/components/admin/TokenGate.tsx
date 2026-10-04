import { useState } from "react";
import type { FormEvent } from "react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

type TokenGateProps = {
    onUnlock: (token: string) => void;
};

export function TokenGate({ onUnlock }: TokenGateProps) {
    const [value, setValue] = useState("");

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const token = value.trim();
        if (token.length > 0) {
            onUnlock(token);
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
                        "
                    >
                        Unlock
                    </button>
                </form>
            </Container>
        </Section>
    );
}
