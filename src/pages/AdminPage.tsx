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
    ADMIN_SECTION_IDS,
    type AdminSectionId,
} from "@/components/admin";
import { checkAdminSession, isUnauthorized } from "@/services/api";

const TOKEN_KEY = "admin-token";
const SECTION_KEY = "admin-section";

export function AdminPage() {
    const [token, setToken] = useState<string | null>(null);
    const [checkingStoredToken, setCheckingStoredToken] = useState(
        () => sessionStorage.getItem(TOKEN_KEY) !== null,
    );
    const [rejectedNotice, setRejectedNotice] = useState(false);
    const [sessionError, setSessionError] = useState<string | null>(null);
    const [sessionCheckAttempt, setSessionCheckAttempt] = useState(0);
    const [section, setSection] = useState<AdminSectionId>(() => {
        const stored = sessionStorage.getItem(SECTION_KEY);
        return stored !== null && (ADMIN_SECTION_IDS as string[]).includes(stored)
            ? (stored as AdminSectionId)
            : "profile";
    });
    const [dirtySections, setDirtySections] = useState<
        Partial<Record<AdminSectionId, boolean>>
    >({});
    const counts = useAdminCounts(token !== null);

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

        const controller = new AbortController();

        checkAdminSession(stored, controller.signal).then(
            () => {
                if (controller.signal.aborted) {
                    return;
                }

                setToken(stored);
                setSessionError(null);
                setCheckingStoredToken(false);
            },
            (error: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                if (isUnauthorized(error)) {
                    sessionStorage.removeItem(TOKEN_KEY);
                    setRejectedNotice(true);
                } else {
                    setSessionError(
                        error instanceof Error ? error.message : "Unable to verify the token.",
                    );
                }

                setCheckingStoredToken(false);
            },
        );

        return () => controller.abort();
    }, [sessionCheckAttempt]);

    function handleRetrySession() {
        setSessionError(null);
        setCheckingStoredToken(true);
        setSessionCheckAttempt((attempt) => attempt + 1);
    }

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
        sessionStorage.setItem(SECTION_KEY, id);
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

    if (sessionError !== null) {
        return (
            <>
                <Section id="admin">
                    <Container>
                        <SectionHeading number="00" title="Admin" />

                        <p role="alert" className="mt-6 font-mono text-[11px] text-red-500">
                            {sessionError}
                        </p>

                        <button
                            type="button"
                            onClick={handleRetrySession}
                            className="mt-4 rounded-lg border border-(--accent-strong) bg-(--accent-strong) px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-(--accent-deep)"
                        >
                            Retry
                        </button>
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
