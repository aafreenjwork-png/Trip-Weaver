import { useState } from "react";
import { useGetItinerary, useGetTrip, useDeleteItinerary, getGetItineraryQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useRoute, Link, useLocation } from "wouter";
import { format } from "date-fns";
import {
  MapPin, Clock, Utensils, Bed, Briefcase,
  Map, Bus, Sparkles, ChevronLeft, Calendar as CalendarIcon, Trash2, Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDestinationImageUrl, getCurrencySymbol } from "@/lib/destination-utils";

export default function ItineraryView() {
  const [, params] = useRoute("/trips/:id/itinerary");
  const id = parseInt(params?.id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: trip, isLoading: isLoadingTrip } = useGetTrip(id, {
    query: { enabled: !!id, queryKey: getGetTripQueryKey(id) }
  });

  const { data: itinerary, isLoading: isLoadingItinerary } = useGetItinerary(id, {
    query: { enabled: !!id, queryKey: getGetItineraryQueryKey(id) }
  });

  const deleteItinerary = useDeleteItinerary();
  const [imgError, setImgError] = useState(false);

  const isLoading = isLoadingTrip || isLoadingItinerary;

  const handleDelete = () => {
    deleteItinerary.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Itinerary deleted.");
          queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
          setLocation(`/trips/${id}`);
        },
        onError: () => {
          toast.error("Could not delete itinerary. Please try again.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!trip || !itinerary) return null;

  const sym = getCurrencySymbol(trip.currency);
  const bgImage = getDestinationImageUrl(trip.destination);

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden">
        {!imgError ? (
          <img
            src={bgImage}
            alt={trip.destination}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-10 lg:px-16 pb-10 max-w-7xl mx-auto w-full">
          <Link href={`/trips/${id}`} className="inline-flex items-center text-sm font-medium text-white/70 hover:text-white mb-4 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Blueprint
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white capitalize drop-shadow-lg">
                {trip.destination}
              </h1>
              <p className="text-white/80 flex items-center gap-2 mt-2">
                <CalendarIcon className="w-4 h-4" />
                {format(new Date(trip.startDate), "MMM d")} — {format(new Date(trip.endDate), "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-right">
                <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-1">Total Est. Cost</p>
                <p className="text-3xl font-serif font-bold text-white drop-shadow">{sym}{itinerary.totalEstimatedCost.toLocaleString()}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 border-white/40 text-white bg-white/10 hover:bg-red-500/80 hover:border-red-400 hover:text-white backdrop-blur-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this itinerary?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the {trip.destination} itinerary. Your trip blueprint will be kept and you can generate a new itinerary anytime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteItinerary.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-8 flex-wrap">
            <TabsTrigger value="schedule" className="rounded-lg px-6 py-3 text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">The Schedule</TabsTrigger>
            <TabsTrigger value="hotels" className="rounded-lg px-6 py-3 text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">Stays</TabsTrigger>
            <TabsTrigger value="restaurants" className="rounded-lg px-6 py-3 text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">Dining</TabsTrigger>
            <TabsTrigger value="logistics" className="rounded-lg px-6 py-3 text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">Logistics & Prep</TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="animate-in fade-in duration-500">
            <div className="space-y-12">
              {itinerary.days.map((day) => (
                <div key={day.day} className="relative pl-4 md:pl-0">
                  <div className="sticky top-24 bg-background/95 backdrop-blur-sm z-30 py-4 mb-6 border-b border-border">
                    <h2 className="text-3xl font-serif font-bold flex items-baseline gap-4">
                      Day {day.day}
                      <span className="text-lg font-sans text-muted-foreground font-normal">
                        {format(new Date(day.date), "EEEE, MMMM d")}
                      </span>
                    </h2>
                  </div>

                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 md:before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {day.activities.map((activity, idx) => (
                      <Card key={idx} className="relative bg-card border-none shadow-md hover:shadow-lg transition-shadow overflow-visible">
                        <div className="absolute left-0 md:left-1/2 w-10 h-10 -translate-x-1/2 rounded-full bg-primary border-4 border-background flex items-center justify-center text-primary-foreground z-10 top-6">
                          {activity.type === 'attraction' && <Map className="w-4 h-4" />}
                          {activity.type === 'restaurant' && <Utensils className="w-4 h-4" />}
                          {activity.type === 'hotel' && <Bed className="w-4 h-4" />}
                          {activity.type === 'transport' && <Bus className="w-4 h-4" />}
                          {activity.type === 'activity' && <Sparkles className="w-4 h-4" />}
                          {activity.type === 'shopping' && <Briefcase className="w-4 h-4" />}
                        </div>
                        <CardContent className="p-0 ml-8 md:ml-0 md:w-[calc(50%-2.5rem)] md:even:ml-auto md:odd:mr-auto overflow-hidden rounded-xl flex flex-row">
                          {activity.imageUrl && (
                            <div className="w-32 shrink-0 overflow-hidden rounded-l-xl">
                              <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                          )}
                          <div className="p-5 flex-1 min-w-0">
                            <div className="flex items-center gap-3 text-sm text-primary font-medium mb-3">
                              <Clock className="w-4 h-4 shrink-0" /> {activity.time} <span className="text-muted-foreground">({activity.duration})</span>
                            </div>
                            <h4 className="text-lg font-serif font-semibold mb-2 leading-snug">{activity.title}</h4>
                            <p className="text-muted-foreground mb-4 leading-relaxed text-sm">{activity.description}</p>

                            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border/50">
                              {activity.address && (
                                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span className="truncate">{activity.address}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-sm font-medium ml-auto bg-muted px-3 py-1 rounded-md whitespace-nowrap">
                                {sym}{activity.estimatedCost.toLocaleString()}
                              </div>
                            </div>
                            {activity.tips && (
                              <div className="mt-3 bg-secondary/10 text-secondary-foreground p-3 rounded-lg text-xs italic border border-secondary/20">
                                💡 {activity.tips}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {itinerary.hotels.map((hotel, i) => (
                <Card key={i} className="bg-card border-none shadow-md">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-serif font-semibold">{hotel.name}</h3>
                      <Badge variant="secondary" className="text-sm px-3 py-1">{hotel.priceRange}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-4 text-amber-500">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={j < Math.round(hotel.rating) ? 'text-amber-500' : 'text-muted opacity-30'}>★</span>
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">{hotel.rating}</span>
                    </div>
                    <p className="text-muted-foreground mb-6">{hotel.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium uppercase tracking-wider text-primary">Highlights</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                        {hotel.highlights.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {itinerary.restaurants.map((rest, i) => (
                <Card key={i} className="bg-card border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-serif font-semibold">{rest.name}</h3>
                      <span className="text-muted-foreground font-medium">{rest.priceRange}</span>
                    </div>
                    <p className="text-sm font-medium text-secondary mb-4 capitalize">{rest.cuisine}</p>
                    <p className="text-muted-foreground text-sm mb-6">{rest.description}</p>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground mb-2">Must Try</p>
                      <div className="flex flex-wrap gap-2">
                        {rest.mustTry.map((item, j) => (
                          <span key={j} className="text-xs bg-background border border-border px-2 py-1 rounded-md">{item}</span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value="logistics" className="animate-in fade-in duration-500 space-y-8">
            <Card className="bg-card border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex items-center gap-3">
                  <Bus className="w-6 h-6 text-primary" /> Transportation Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{itinerary.transportationPlan}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-card border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-serif flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-secondary" /> Packing Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <ul className="space-y-3">
                    {itinerary.packingSuggestions.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-serif flex items-center gap-3 text-primary">
                    <Map className="w-5 h-5" /> Alternative Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  {itinerary.alternativeOptions.map((opt, i) => (
                    <div key={i}>
                      <h4 className="font-semibold text-foreground mb-1">{opt.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{opt.description}</p>
                      <p className="text-xs font-medium text-primary bg-primary/10 inline-block px-2 py-1 rounded">Why: {opt.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
