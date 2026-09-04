import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import Simulator from "@/components/landing/Simulator";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/landing/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Benefits />
      <HowItWorks />
      <Simulator />
      <Testimonials />
      <FAQ />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
