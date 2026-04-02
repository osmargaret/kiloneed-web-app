import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-accent/50 py-20 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(25_95%_53%/0.08),transparent_60%)]" />
      <div className="container relative mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          Find what you <span className="text-gradient">need</span>,<br />
          sell what you don't.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Kiloneed connects buyers and sellers in a modern marketplace built on trust. Discover unique items or turn your stuff into cash.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-xl border bg-card p-2 shadow-sm">
          <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for anything..."
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button size="sm">Search</Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Popular:</span>
          {["Electronics", "Furniture", "Fashion", "Books", "Sports"].map((tag) => (
            <a
              key={tag}
              href="#"
              className="rounded-full border bg-card px-3 py-1 transition-colors hover:border-primary hover:text-foreground"
            >
              {tag}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
