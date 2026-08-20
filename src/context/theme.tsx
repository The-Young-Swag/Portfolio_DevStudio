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

    return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
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