import { useEffect, useState } from "react";

import { Container, Footer, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { AlsoTrueManager, CertificationsManager, ExperienceManager, HeroStatsManager, PortraitManager, ProfileManager, ProjectsManager, ResumeManager, SocialLinksManager, StackItemsManager, TokenGate } from "@/components/admin";

const TOKEN_KEY = "admin-token";

export function AdminPage() {
    const [token, setToken] = useState<string | null>(() =>
        sessionStorage.getItem(TOKEN_KEY),
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
