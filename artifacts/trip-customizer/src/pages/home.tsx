import { useListTrips, useGetTripStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { format } from "date-fns";
import { MapPin, Users, Calendar, Plane, Compass, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDestinationImageUrl } from "@/lib/destination-utils";

export default function Home() {
  const { data: trips, isLoading: isLoadingTrips } = useListTrips();
  const { data: stats, isLoading: isLoadingStats } = useGetTripStats();

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        
        {/* Hero Section */}
        <section className="mb-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-6">
            Curate your next <br/><span className="text-primary italic">masterpiece.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Intelligently crafted itineraries tailored precisely to your tastes, budget, and dreams.
          </p>
          <Link 
            href="/new" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            Craft New Itinerary <Compass className="w-5 h-5" />
          </Link>
        </section>

        {/* Stats Section */}
        <section className="mb-20 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoadingStats ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))
            ) : stats ? (
              <>
                <Card className="bg-card border-none shadow-md hover-elevate">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <Plane className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Journeys</p>
                      <p className="text-3xl font-serif font-semibold">{stats.totalTrips}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-none shadow-md hover-elevate">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Top Spot</p>
                      <p className="text-3xl font-serif font-semibold capitalize truncate max-w-[150px]">
                        {stats.topDestinations[0]?.destination || "None"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-none shadow-md hover-elevate">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Avg Group</p>
                      <p className="text-3xl font-serif font-semibold">{Math.round(stats.avgGroupSize || 0)}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </section>

        {/* Trips Grid */}
        <section className="animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-semibold">Your Portfolio</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingTrips ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))
            ) : trips && trips.length > 0 ? (
              trips.map((trip) => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <Card className="group h-full bg-card border-transparent hover:border-border transition-all duration-500 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="h-48 bg-muted relative overflow-hidden">
                      <img
                        src={getDestinationImageUrl(trip.destination)}
                        alt={trip.destination}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                      <div className="absolute bottom-4 left-6 z-20">
                        <h3 className="text-2xl font-serif font-bold text-white capitalize drop-shadow-md">
                          {trip.destination}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{trip.groupSize}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium capitalize">
                            {trip.budget}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                            {trip.travelStyle}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
                <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-serif font-medium text-foreground mb-2">No journeys yet</h3>
                <p className="text-muted-foreground mb-6">Begin crafting your first masterpiece.</p>
                <Link href="/new" className="text-primary font-medium hover:underline inline-flex items-center gap-2">
                  Plan your first trip <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

      </div>
    </Layout>
  );
}
