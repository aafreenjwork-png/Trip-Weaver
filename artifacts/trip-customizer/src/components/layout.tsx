import { Link, useLocation } from "wouter";
import { Map } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <Map className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-primary">TripWeaver</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${isHome ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"}`}
            >
              Journeys
            </Link>
            <Link href="/new" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm">
              Craft Itinerary
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="border-t border-border/40 py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-serif italic">Your journey begins here.</p>
        </div>
      </footer>
    </div>
  );
}
