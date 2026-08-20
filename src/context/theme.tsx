/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { PropsWithChildren } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    toggleTheme: () => void;
};

function getInitialTheme(): Theme {
    if (typeof document === "undefined") {
        return "light";
    }

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    /*
     * First visit: pick the theme from the viewer's time of day —
     * 7 AM to 5 PM reads as light, everything else as dark.
     */
    const hour = new Date().getHours();

    return hour >= 7 && hour < 17 ? "light" : "dark";
}

const ThemeContext = createContext<ThemeContextValue | null>(
    null,
);

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle(
            "dark",
            theme === "dark",
        );
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme: () =>
                    setTheme((currentTheme) =>
                        currentTheme === "dark"
                            ? "light"
                            : "dark",
                    ),
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used within a ThemeProvider",
        );
    }

    return context;
}