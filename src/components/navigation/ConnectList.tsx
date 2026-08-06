import { socialLinks } from "@/constants/socialLinks";

export function ConnectList() {
    return (
        <section className="mt-10">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Connect
            </p>

            <ul className="space-y-2">
                {socialLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.label}>
                            <a
                                href={item.href}
                                target="_blank"
                                rel="noreferrer"
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-sm
                                    text-neutral-600
                                    transition-colors
                                    hover:bg-neutral-100
                                    hover:text-neutral-950
                                "
                            >
                                <Icon size={16} />

                                {item.label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}