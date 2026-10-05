import { useEffect, useState } from "react";

import { Container, Footer, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import {
    AdminSidebar,
    AdminToastProvider,
    AdminTopBar,
    AlsoTrueManager,
    CertificationsManager,
    ExperienceManager,
    HeroStatsManager,
    PortraitManager,
    ProfileManager,
    ProjectsManager,
    ResumeManager,
    SocialLinksManager,
    StackItemsManager,
    TokenGate,
    useAdminCounts,
    type AdminSectionId,
} from "@/components/admin";
import { checkAdminSession } from "@/services/api";

const TOKEN_KEY = "admin-token";

export function AdminPage() {
    const [token, setToken] = useState<string | null>(null);
    const [checkingStoredToken, setCheckingStoredToken] = useState(
        () => sessionStorage.getItem(TOKEN_KEY) !== null,
    );
    const [rejectedNotice, setRejectedNotice] = useState(false);
    const [section, setSection] = useState<AdminSectionId>("profile");
    const [dirtySections, setDirtySections] = useState<
        Partial<Record<AdminSectionId, boolean>>
    >({});
    const counts = useAdminCounts();

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

    function handleDirtyChange(id: AdminSectionId, dirty: boolean) {
        setDirtySections((current) =>
            current[id] === dirty ? current : { ...current, [id]: dirty },
        );
    }

    function handleNavigate(id: AdminSectionId) {
        if (
            id !== section &&
            dirtySections[section] === true &&
            !window.confirm("Discard unsaved changes in this section?")
        ) {
            return;
        }

        setSection(id);
        window.scrollTo(0, 0);
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
        <AdminToastProvider>
            <div
                id="admin"
                className="min-h-dvh min-[820px]:grid min-[820px]:grid-cols-[15.5rem_minmax(0,1fr)]"
            >
                <AdminSidebar
                    current={section}
                    counts={counts}
                    dirty={dirtySections}
                    onNavigate={handleNavigate}
                />

                <div className="min-w-0">
                    <AdminTopBar onSignOut={handleSignOut} />

                    <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6">
                        {section === "profile" && (
                            <ProfileManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("profile", dirty)}
                            />
                        )}

                        {section === "portrait" && (
                            <PortraitManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("portrait", dirty)}
                            />
                        )}

                        {section === "hero-stats" && (
                            <HeroStatsManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("hero-stats", dirty)}
                            />
                        )}

                        {section === "also-true" && (
                            <AlsoTrueManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("also-true", dirty)}
                            />
                        )}

                        {section === "resume" && (
                            <ResumeManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("resume", dirty)}
                            />
                        )}

                        {section === "projects" && (
                            <ProjectsManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("projects", dirty)}
                            />
                        )}

                        {section === "experience" && (
                            <ExperienceManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("experience", dirty)}
                            />
                        )}

                        {section === "stack" && (
                            <StackItemsManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("stack", dirty)}
                            />
                        )}

                        {section === "social-links" && (
                            <SocialLinksManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) => handleDirtyChange("social-links", dirty)}
                            />
                        )}

                        {section === "certifications" && (
                            <CertificationsManager
                                token={token}
                                onUnauthorized={handleUnauthorized}
                                onDirtyChange={(dirty) =>
                                    handleDirtyChange("certifications", dirty)
                                }
                            />
                        )}
                    </main>
                </div>
            </div>
        </AdminToastProvider>
    );
}
