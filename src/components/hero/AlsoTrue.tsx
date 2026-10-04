import { useProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import type { AlsoTrueItem } from "@/services/profile/profile";
import { resolveStatIcon } from "./statIcons";

export function AlsoTrue() {
    const { profile } = useProfile();
    const items: AlsoTrueItem[] = profile.also_true ?? staticProfile.also_true;

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="border-t hairline px-1 py-5 sm:py-6">
<p
                    className="
                        mb-3
                        font-mono
                        text-[12px]
                        uppercase
                        tracking-[0.08em]
                        text-(--graphite-soft)
                    "
                >
                Also true
            </p>

            <div className="flex flex-wrap gap-2.5">
                {items.map(({ text, icon }, index) => {
                    const Icon = resolveStatIcon(icon);

                    return (
                        <span
                            key={`${text}-${index}`}
                        className="
                        group
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        px-3
                        py-1.5
                        font-mono
                        text-[12.5px]
                        text-(--graphite)
                        shadow-[0_6px_20px_rgba(31,38,135,0.06)]
                        backdrop-blur-md
                        backdrop-saturate-140
                        transition-colors
                        duration-150
                        hover:border-(--accent-strong)
                        hover:text-(--accent-strong)
                    "
                    >
                        <Icon
                            size={15}
                            strokeWidth={1.8}
                            className="
                                text-(--graphite)
                                transition-colors
                                duration-150
                                group-hover:text-(--accent-strong)
                            "
                        />

                        {text}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}