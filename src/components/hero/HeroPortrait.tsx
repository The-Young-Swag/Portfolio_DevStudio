import profileDefault from "@/assets/images/profile-default.png";

export function HeroPortrait() {
    return (
        <figure
            className="
                overflow-hidden
                rounded-[20px]
                border
                border-white/70
                bg-white/30
                shadow-[0_18px_45px_rgba(31,38,135,0.10)]
                backdrop-blur-[18px]
                backdrop-saturate-[140%]
            "
        >
            <img
                src={profileDefault}
                alt="Portrait of Ivan Harvey Rivera"
                className="
                    aspect-square
                    h-full
                    w-full
                    object-cover
                "
            />
        </figure>
    );
}