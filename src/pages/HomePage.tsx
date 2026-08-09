import { Hero } from "@/components/hero";
import { GitHubActivitySection } from "@/components/github";
import { ProjectsSection } from "@/components/projects";
import { ExperienceSection } from "@/components/experience";
import { StackSection } from "@/components/stack"
import { CertificationsSection } from "@/components/certifications"
import { TimeSection } from "@/components/time"
import { ContactSection } from "@/components/contact";
import { Footer } from "@/components/layout";

export function HomePage() {
    return (
        <>

            <Hero />

            <GitHubActivitySection />

            <ProjectsSection />

            <ExperienceSection />
            
            <StackSection />
            
            <CertificationsSection />
            
            <TimeSection />

            <ContactSection />

            <Footer />
        </>
    );
}