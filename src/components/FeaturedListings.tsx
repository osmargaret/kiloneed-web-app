import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const listings = [
  { id: 1, title: "Vintage Leather Sofa", price: 450, location: "Brooklyn, NY", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop" },
  { id: 2, title: "MacBook Pro 14\"", price: 1200, location: "San Francisco, CA", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop" },
  { id: 3, title: "Mountain Bike", price: 380, location: "Denver, CO", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop" },
  { id: 4, title: "Canon EOS R6", price: 1800, location: "Austin, TX", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop" },
  { id: 5, title: "Mid-Century Desk", price: 290, location: "Portland, OR", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop" },
  { id: 6, title: "Air Jordan 1 Retro", price: 220, location: "Chicago, IL", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop" },
];

const FeaturedListings = () => {
  return (
    <section className="border-t bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold md:text-4xl">Featured Listings</h2>
            <p className="mt-3 text-muted-foreground">Recently added items you'll love</p>
          </div>
          <Button variant="outline" className="hidden md:inline-flex">
            View All
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <a
              key={item.id}
              href="#"
              className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-primary">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug">{item.title}</h3>
                  <span className="shrink-0 font-heading text-lg font-bold text-primary">
                    ${item.price}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline">View All Listings</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
