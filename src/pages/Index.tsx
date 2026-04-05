import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AdBanner from "@/components/AdBanner";
import NeedsFeed from "@/components/NeedsFeed";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <NeedsFeed />
      <AdBanner />
      <FeaturedProducts />
      <Footer />
    </div>
  );
};

export default Index;
