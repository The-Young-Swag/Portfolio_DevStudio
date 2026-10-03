import { useEffect, useState } from "react";

import { Container, Footer, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { CertificationsManager, ProjectsManager, TokenGate } from "@/components/admin";

const TOKEN_KEY = "admin-token";

export function AdminPage() {
    const [token, setToken] = useState<string | null>(() =>
        sessionStorage.getItem(TOKEN_KEY),
    );

    useEffect(() => {
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex";
        document.head.appendChild(meta);

        return () => {
            document.head.removeChild(meta);
        };
    }, []);

    function handleUnlock(nextToken: string) {
        sessionStorage.setItem(TOKEN_KEY, nextToken);
        setToken(nextToken);
    }

    function handleSignOut() {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
    }

    function handleUnauthorized() {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
    }

    if (token === null) {
        return (
            <>
                <TokenGate onUnlock={handleUnlock} />
                <Footer />
            </>
        );
    }

    return (
        <>
            <Section id="admin">
                <Container>
                    <div className="flex items-baseline justify-between">
                        <SectionHeading number="00" title="Admin" />

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="
                                font-mono
                                text-[11px]
                                text-(--graphite)
                                transition-colors
                                duration-150
                                hover:text-(--accent-strong)
                                hover:underline
                            "
                        >
                            Sign out
                        </button>
                    </div>

                    <ProjectsManager token={token} onUnauthorized={handleUnauthorized} />

                    <CertificationsManager token={token} onUnauthorized={handleUnauthorized} />
                </Container>
            </Section>

            <Footer />
        </>
    );
}
