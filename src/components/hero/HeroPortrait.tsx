import profileDefault from "@/assets/images/profile-default.png";

export function HeroPortrait() {
    return (
        <figure
            className="
                overflow-hidden
                rounded-2xl
                border
                border-neutral-200
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