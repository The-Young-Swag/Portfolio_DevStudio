import { socialLinks } from "@/constants/socialLinks";

export function ConnectList() {
    return (
        <div className="mt-6">
            <p
                className="
                    px-3
                    pb-3
                    font-mono
                    text-[10.5px]
                    uppercase
                    tracking-[0.11em]
                    text-neutral-500
                "
            >
                Connect
            </p>

            <div className="space-y-0.5">
                {socialLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                        <a
                            key={item.label}
                            href={item.href}
                            target={
                                item.label === "Email"
                                    ? undefined
                                    : "_blank"
                            }
                            rel={
                                item.label === "Email"
                                    ? undefined
                                    : "noreferrer"
                            }
                            className="
                                flex
                                items-center
                                gap-3
                                px-3
                                py-2.5
                                font-mono
                                text-[12px]
                                text-neutral-600
                                transition-colors
                                hover:text-neutral-950
                            "
                        >
                            <Icon
                                size={14}
                                strokeWidth={1.75}
                            />

                            {item.label}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}