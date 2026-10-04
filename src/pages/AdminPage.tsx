import { useEffect, useState } from "react";

import { Container, Footer, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { AlsoTrueManager, CertificationsManager, ExperienceManager, HeroStatsManager, PortraitManager, ProfileManager, ProjectsManager, ResumeManager, SocialLinksManager, StackItemsManager, TokenGate } from "@/components/admin";
import { checkAdminSession } from "@/services/api";

const TOKEN_KEY = "admin-token";

export function AdminPage() {
    const [token, setToken] = useState<string | null>(null);
    const [checkingStoredToken, setCheckingStoredToken] = useState(
        () => sessionStorage.getItem(TOKEN_KEY) !== null,
    );
    const [rejectedNotice, setRejectedNotice] = useState(false);

    useEffect(() => {
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex";
        document.head.appendChild(meta);

        return () => {
            document.head.removeChild(meta);
        };
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem(TOKEN_KEY);

        if (!stored) {
            return;
        }

        let cancelled = false;

        checkAdminSession(stored).then(
            () => {
                if (cancelled) {
                    return;
                }

                setToken(stored);
                setCheckingStoredToken(false);
            },
            () => {
                if (cancelled) {
                    return;
                }

                sessionStorage.removeItem(TOKEN_KEY);
                setRejectedNotice(true);
                setCheckingStoredToken(false);
            },
        );

        return () => {
            cancelled = true;
        };
    }, []);

    function handleUnlock(nextToken: string) {
        sessionStorage.setItem(TOKEN_KEY, nextToken);
        setRejectedNotice(false);
        setToken(nextToken);
    }

    function handleSignOut() {
        sessionStorage.removeItem(TOKEN_KEY);
        setRejectedNotice(false);
        setToken(null);
    }

    function handleUnauthorized() {
        sessionStorage.removeItem(TOKEN_KEY);
        setRejectedNotice(true);
        setToken(null);
    }

    if (checkingStoredToken) {
        return (
            <>
                <Section id="admin">
                    <Container>
                        <SectionHeading number="00" title="Admin" />

                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            Checking session…
                        </p>
                    </Container>
                </Section>

                <Footer />
            </>
        );
    }

    if (token === null) {
        return (
            <>
                <TokenGate onUnlock={handleUnlock} rejected={rejectedNotice} />
                <Footer />
            </>
        );
    }

    return (
        <>
            <Section id="admin">
                <Container>
                    <div className="flex items-baseline justify-between">
                        <SectionHeading number="00" title="Admin" id="admin" />

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

                    <ProfileManager token={token} onUnauthorized={handleUnauthorized} />

                    <ResumeManager token={token} onUnauthorized={handleUnauthorized} />

                    <PortraitManager token={token} onUnauthorized={handleUnauthorized} />

                    <HeroStatsManager token={token} onUnauthorized={handleUnauthorized} />

                    <AlsoTrueManager token={token} onUnauthorized={handleUnauthorized} />

                    <ProjectsManager token={token} onUnauthorized={handleUnauthorized} />

                    <ExperienceManager token={token} onUnauthorized={handleUnauthorized} />

                    <StackItemsManager token={token} onUnauthorized={handleUnauthorized} />

                    <SocialLinksManager token={token} onUnauthorized={handleUnauthorized} />

                    <CertificationsManager token={token} onUnauthorized={handleUnauthorized} />
                </Container>
            </Section>

            <Footer />
        </>
    );
}
