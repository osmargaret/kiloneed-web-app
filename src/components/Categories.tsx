import { Laptop, Sofa, Shirt, BookOpen, Dumbbell, Camera, Car, Wrench } from "lucide-react";

const categories = [
  { name: "Electronics", icon: Laptop, count: "2.4k items" },
  { name: "Furniture", icon: Sofa, count: "1.8k items" },
  { name: "Fashion", icon: Shirt, count: "3.1k items" },
  { name: "Books", icon: BookOpen, count: "950 items" },
  { name: "Sports", icon: Dumbbell, count: "1.2k items" },
  { name: "Photography", icon: Camera, count: "780 items" },
  { name: "Vehicles", icon: Car, count: "420 items" },
  { name: "Services", icon: Wrench, count: "630 items" },
];

const Categories = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">Browse by Category</h2>
          <p className="mt-3 text-muted-foreground">Find exactly what you're looking for</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href="#"
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <cat.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.count}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
