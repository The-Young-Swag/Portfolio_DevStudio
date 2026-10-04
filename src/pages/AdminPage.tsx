import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Link } from "react-router";

import { Container, Footer, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { AlsoTrueManager, CertificationsManager, ExperienceManager, HeroStatsManager, PortraitManager, ProfileManager, ProjectsManager, ResumeManager, SocialLinksManager, StackItemsManager, TokenGate } from "@/components/admin";
import { checkAdminSession } from "@/services/api";

const TOKEN_KEY = "admin-token";

const ADMIN_SECTIONS = [
    { id: "profile", label: "Profile" },
    { id: "resume", label: "Resume" },
    { id: "portrait", label: "Portrait" },
    { id: "hero-stats", label: "Hero stats" },
    { id: "also-true", label: "Also true" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "stack", label: "Stack" },
    { id: "social-links", label: "Social links" },
    { id: "certifications", label: "Certifications" },
] as const;

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
                    <div className="flex items-center justify-between gap-4">
                        <SectionHeading number="00" title="Admin" id="admin" />

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-(--glass-border)
                                bg-(--glass-bg)
                                px-4
                                py-2
                                font-mono
                                text-[12px]
                                text-(--ink)
                                shadow-[inset_0_1px_0_var(--glass-highlight)]
                                transition-colors
                                duration-150
                                hover:border-(--accent-strong)
                                hover:text-(--accent-strong)
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-(--accent-strong)
                            "
                        >
                            <LogOut size={14} strokeWidth={2} />
                            Log out
                        </button>
                    </div>

                    <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-(--graphite)">
                        Changes publish to the live site immediately — there
                        are no drafts.{" "}
                        <Link
                            to="/"
                            className="font-mono text-[11.5px] text-(--accent-strong) hover:underline"
                        >
                            View site →
                        </Link>
                    </p>

                    <nav
                        aria-label="Content sections"
                        className="mt-4 flex flex-wrap gap-2"
                    >
                        {ADMIN_SECTIONS.map((section) => (
                            <a
                                key={section.id}
                                href={`#admin-${section.id}`}
                                className="
                                    rounded-full
                                    border
                                    border-(--glass-border)
                                    bg-(--glass-bg)
                                    px-3
                                    py-1.5
                                    font-mono
                                    text-[11px]
                                    text-(--graphite)
                                    transition-colors
                                    duration-150
                                    hover:border-(--accent-strong)
                                    hover:text-(--accent-strong)
                                "
                            >
                                {section.label}
                            </a>
                        ))}
                    </nav>

                    <div id="admin-profile" className="scroll-mt-28">
                        <ProfileManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-resume" className="scroll-mt-28">
                        <ResumeManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-portrait" className="scroll-mt-28">
                        <PortraitManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-hero-stats" className="scroll-mt-28">
                        <HeroStatsManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-also-true" className="scroll-mt-28">
                        <AlsoTrueManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-projects" className="scroll-mt-28">
                        <ProjectsManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-experience" className="scroll-mt-28">
                        <ExperienceManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-stack" className="scroll-mt-28">
                        <StackItemsManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-social-links" className="scroll-mt-28">
                        <SocialLinksManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>

                    <div id="admin-certifications" className="scroll-mt-28">
                        <CertificationsManager token={token} onUnauthorized={handleUnauthorized} />
                    </div>
                </Container>
            </Section>

            <Footer />
        </>
    );
}
