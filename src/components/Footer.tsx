const Footer = () => {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <span className="font-heading text-xl font-bold text-primary">Kiloneed</span>
            <p className="mt-3 text-sm text-muted-foreground">
              The modern marketplace for buying and selling anything, built on trust.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold">Marketplace</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Browse</a></li>
              <li><a href="#" className="hover:text-foreground">Categories</a></li>
              <li><a href="#" className="hover:text-foreground">Trending</a></li>
              <li><a href="#" className="hover:text-foreground">New Arrivals</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold">Selling</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Start Selling</a></li>
              <li><a href="#" className="hover:text-foreground">Seller Guide</a></li>
              <li><a href="#" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Support</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kiloneed. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
