import { useGetTrip, useGenerateItinerary, getGetTripQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useRoute, Link, useLocation } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Wallet, Compass, Heart, Loader2, FileText, ArrowRight, Plane, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function TripDetail() {
  const [, params] = useRoute("/trips/:id");
  const id = parseInt(params?.id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useGetTrip(id, {
    query: {
      enabled: !!id,
      queryKey: getGetTripQueryKey(id)
    }
  });

  const generateItinerary = useGenerateItinerary();

  const onGenerate = () => {
    generateItinerary.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Itinerary beautifully crafted.");
          queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
          setLocation(`/trips/${id}/itinerary`);
        },
        onError: () => {
          toast.error("Could not weave the itinerary. Please try again.");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Skeleton className="h-64 w-full rounded-3xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full rounded-2xl col-span-2" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!trip) return null;

  return (
    <Layout>
      {generateItinerary.isPending && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <Sparkles className="w-16 h-16 text-primary mb-8 animate-bounce relative z-10" />
          </div>
          <h2 className="text-4xl font-serif text-foreground mb-4">Crafting perfection...</h2>
          <p className="text-muted-foreground text-lg max-w-md text-center">
            Consulting our global concierges and weaving together your perfect {trip.destination} experience.
          </p>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
        
        {/* Header Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-12 bg-primary/5 min-h-[300px] flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <MapPin className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-20 p-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-white/80 font-medium tracking-widest uppercase mb-2">The Blueprint</p>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white capitalize">{trip.destination}</h1>
            </div>
            {trip.hasItinerary ? (
              <Button onClick={() => setLocation(`/trips/${id}/itinerary`)} className="rounded-full bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg shadow-2xl">
                View Full Itinerary <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button onClick={onGenerate} className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-6 text-lg shadow-2xl">
                Generate Itinerary <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="md:col-span-2 space-y-8">
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" /> Core Parameters
                </h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Dates</p>
                    <p className="font-medium text-lg">{format(new Date(trip.startDate), "MMMM d, yyyy")} <br/>to {format(new Date(trip.endDate), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Users className="w-4 h-4"/> Party Size</p>
                    <p className="font-medium text-lg">{trip.groupSize} Travelers</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Wallet className="w-4 h-4"/> Budget Tier</p>
                    <p className="font-medium text-lg capitalize">{trip.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Compass className="w-4 h-4"/> Style</p>
                    <p className="font-medium text-lg capitalize">{trip.travelStyle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {trip.constraints && (
              <Card className="bg-primary/5 border-none shadow-md">
                <CardContent className="p-8">
                  <h3 className="text-xl font-serif font-semibold mb-4 text-primary">Special Constraints</h3>
                  <p className="text-muted-foreground leading-relaxed">{trip.constraints}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-accent" /> Curated Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trip.interests?.map((interest, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium capitalize">
                      {interest}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {trip.hasItinerary && (
              <Card className="bg-card border-none shadow-lg overflow-hidden border-2 border-secondary/20">
                <div className="bg-secondary/10 p-6 flex flex-col items-center text-center">
                  <Plane className="w-10 h-10 text-secondary mb-4" />
                  <h4 className="font-serif font-semibold text-lg mb-2">Want to change course?</h4>
                  <p className="text-sm text-muted-foreground mb-6">Regenerate a brand new itinerary based on these parameters.</p>
                  <Button onClick={onGenerate} variant="outline" className="w-full rounded-full border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors">
                    Regenerate AI Plan
                  </Button>
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}
