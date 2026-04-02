import { motion } from "framer-motion";
import { Star, Heart, MapPin, Sparkles } from "lucide-react";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  seller: string;
  rating: number;
  location: string;
  featured?: boolean;
}

const ProductCard = ({ image, title, price, seller, rating, location, featured }: ProductCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative gradient-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-glow transition-shadow"
    >
      {featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 gradient-blue px-2.5 py-1 rounded-full text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Featured
        </div>
      )}

      <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-primary transition-colors">
        <Heart className="h-4 w-4" />
      </button>

      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={640}
          height={640}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground truncate">{title}</h3>
        <p className="text-xl font-bold text-gradient-blue mt-1">{price}</p>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span className="truncate">{seller}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
