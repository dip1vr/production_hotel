import { Hero } from "@/components/home/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { RoomsSection } from "@/components/home/RoomsSection";
import { Amenities } from "@/components/home/Amenities";
import { DiningSection } from "@/components/home/DiningSection";
import { Gallery } from "@/components/home/Gallery";
import { Testimonials } from "@/components/home/Testimonials";
import { ContactSection } from "@/components/home/ContactSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <AboutSection />
      <RoomsSection />
      <DiningSection />
      <Amenities />
      <Gallery />
      <Testimonials />
      <ContactSection />
      <Footer />
    </main>
  );
}
