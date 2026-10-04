import { resolveSocialIcon } from "@/constants/socialIcons";
import { useSocialLinks } from "@/hooks/social-links/useSocialLinks";
import { useProfile } from "@/hooks/profile/useProfile";

export function ConnectList() {
    const { socialLinks } = useSocialLinks();
    const { profile } = useProfile();

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
                        text-(--graphite-soft)
                    "
                >
                Connect
            </p>

            <div className="space-y-0.5">
                {socialLinks.map((item) => {
                    const Icon = resolveSocialIcon(item.icon);
                    const isEmail = item.icon === "email";

                    return (
                        <a
                            key={item.label}
                            href={isEmail ? `mailto:${profile.email}` : item.href}
                            target={
                                isEmail
                                    ? undefined
                                    : "_blank"
                            }
                            rel={
                                isEmail
                                    ? undefined
                                    : "noreferrer"
                            }
                            className="
                            flex
                            items-center
                            gap-3
                            rounded-[14px]
                            px-3
                            py-2.5
                            font-mono
                            text-[12px]
                            text-(--graphite)
                            transition-colors
                            duration-150
                            hover:bg-(--glass-bg)
                            hover:text-(--ink)
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