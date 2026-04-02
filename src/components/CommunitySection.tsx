import { motion } from "framer-motion";
import { MapPin, Users, ArrowRight } from "lucide-react";

const communities = [
  { name: "Lagos Market", members: "12.4K", location: "Lagos" },
  { name: "Abuja Sellers Hub", members: "8.2K", location: "Abuja" },
  { name: "PH Trade Circle", members: "5.7K", location: "Port Harcourt" },
  { name: "Ibadan Connect", members: "3.9K", location: "Ibadan" },
];

const CommunitySection = () => {
  return (
    <section className="py-20 border-t border-border" id="communities">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Communities</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Join Your Local Community
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            Connect with buyers and sellers near you. Trade locally, grow globally.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {communities.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="gradient-card rounded-2xl border border-border p-6 cursor-pointer hover:shadow-glow transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl gradient-red flex items-center justify-center mb-4 shadow-glow">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{c.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{c.location}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{c.members}</span> members
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
