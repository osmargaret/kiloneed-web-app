import { motion } from "framer-motion";
import { Megaphone, ArrowRight } from "lucide-react";
import adBanner from "@/assets/ad-banner.jpg";

const AdBanner = () => {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-border shadow-card"
        >
          <img
            src={adBanner}
            alt="Sponsored products"
            loading="lazy"
            width={1200}
            height={512}
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent flex items-center">
            <div className="px-8 md:px-12 max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Sponsored</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Promote Your Products
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Get your products featured and reach thousands of buyers in your area.
              </p>
              <button className="flex items-center gap-2 gradient-blue px-6 py-2.5 rounded-xl text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                Feature Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AdBanner;
