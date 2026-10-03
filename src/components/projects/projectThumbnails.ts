import arcHiveThumbnail from "@/assets/images/projects/arc-hive.webp";
import libraryAttendanceThumbnail from "@/assets/images/projects/library-attendance.webp";
import luminoesisThumbnail from "@/assets/images/projects/luminoesis.webp";
import portfolioThumbnail from "@/assets/images/projects/portfolio.webp";

const projectThumbnails: Record<string, string> = {
    "arc-hive": arcHiveThumbnail,
    "library-attendance": libraryAttendanceThumbnail,
    luminoesis: luminoesisThumbnail,
    portfolio: portfolioThumbnail,
};

export function resolveProjectThumbnail(value: string): string {
    return projectThumbnails[value] ?? value;
}
