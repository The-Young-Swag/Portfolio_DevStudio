import { profile } from "@/constants/profile";
import { Container } from "./Container";

export function Footer() {
    return (
        <footer
            className="
                border-t
                border-(--line)
                py-6
            "
        >
            <Container>
                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-4
                    "
                >
<p
                            className="
                                font-mono
                                text-[10.5px]
                                text-(--graphite-soft)
                            "
                        >
                            © 2026 Ivan Harvey Rivera — probably
                            still debugging something.
                        </p>

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                            font-mono
                            text-[10.5px]
                            text-(--graphite-soft)
                        "
                    >
                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noreferrer"
                            className="
                                transition-colors
                                duration-150
                                hover:text-(--accent-strong)
                            "
                        >
                            GitHub
                        </a>

                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="
                                transition-colors
                                duration-150
                                hover:text-(--accent-strong)
                            "
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            </Container>
        </footer>
    );
}