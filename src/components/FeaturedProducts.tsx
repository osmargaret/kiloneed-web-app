import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import featured1 from "@/assets/featured-1.jpg";
import featured2 from "@/assets/featured-2.jpg";
import featured3 from "@/assets/featured-3.jpg";
import featured4 from "@/assets/featured-4.jpg";
import featured5 from "@/assets/featured-5.jpg";
import featured6 from "@/assets/featured-6.jpg";

const products = [
  { image: featured1, title: "Pro Wireless Headphones", price: "₦85,000", seller: "TechHub Lagos", rating: 4.8, location: "Lagos, NG", featured: true },
  { image: featured2, title: "Designer Sneakers", price: "₦120,000", seller: "SneakerVault", rating: 4.9, location: "Abuja, NG", featured: true },
  { image: featured3, title: "Luxury Chronograph Watch", price: "₦250,000", seller: "TimeKeepers", rating: 5.0, location: "Port Harcourt, NG", featured: false },
  { image: featured4, title: "Premium Leather Briefcase", price: "₦65,000", seller: "LeatherCraft NG", rating: 4.7, location: "Ibadan, NG", featured: false },
  { image: featured5, title: "Gaming Controller Pro", price: "₦45,000", seller: "GameZone", rating: 4.6, location: "Enugu, NG", featured: true },
  { image: featured6, title: "Designer Sunglasses", price: "₦38,000", seller: "OpticStyle", rating: 4.5, location: "Kano, NG", featured: false },
];

const FeaturedProducts = () => {
  return (
    <section className="py-20" id="featured">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Featured</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Trending Products
            </h2>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:hidden">
          <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
