import { useState } from "react";
import { useGetItinerary, useGetTrip, useDeleteItinerary, getGetItineraryQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useRoute, Link, useLocation } from "wouter";
import { format } from "date-fns";
import {
  MapPin, Clock, Utensils, Bed, Briefcase,
  Map, Bus, Sparkles, ChevronLeft, Calendar as CalendarIcon, Trash2, Loader2, Star,
  Plane, Hotel, UtensilsCrossed, Ticket, Landmark, ExternalLink,
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
import {
  googleFlightsUrl, skyscannerFlightsUrl, kayakFlightsUrl, expediaFlightsUrl,
  bookingComUrl, airbnbHotelsUrl, hotelsComUrl, expediaHotelsUrl,
  yelpRestaurantsUrl, tripadvisorRestaurantsUrl, openTableUrl, googleMapsRestaurantsUrl,
  viatorUrl, getYourGuideUrl, airbnbExperiencesUrl, klookUrl,
  tripadvisorAttractionsUrl, googleMapsAttractionsUrl, lonelyPlanetUrl,
  googleMapsSearchUrl, yelpSearchUrl, viatorActivityUrl,
} from "@/lib/booking-utils";

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
            <TabsTrigger value="experiences" className="rounded-lg px-6 py-3 text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">Suggested Experiences</TabsTrigger>
            <TabsTrigger value="book" className="rounded-lg px-6 py-3 text-base data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold text-primary">Book It</TabsTrigger>
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

                  <div className="space-y-5 relative before:absolute before:left-5 before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {day.activities.map((activity, idx) => {
                      const lo = Math.round(activity.estimatedCost * (activity.type === 'transport' ? 0.88 : activity.type === 'hotel' ? 0.85 : 0.72));
                      const hi = Math.round(activity.estimatedCost * (activity.type === 'transport' ? 1.12 : activity.type === 'hotel' ? 1.2 : 1.35));
                      return (
                      <Card key={idx} className="relative ml-14 bg-card border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="absolute -left-9 top-6 w-10 h-10 -translate-x-1/2 rounded-full bg-primary border-4 border-background flex items-center justify-center text-primary-foreground z-10 shrink-0">
                          {activity.type === 'attraction' && <Map className="w-4 h-4" />}
                          {activity.type === 'restaurant' && <Utensils className="w-4 h-4" />}
                          {activity.type === 'hotel' && <Bed className="w-4 h-4" />}
                          {activity.type === 'transport' && <Bus className="w-4 h-4" />}
                          {activity.type === 'activity' && <Sparkles className="w-4 h-4" />}
                          {activity.type === 'shopping' && <Briefcase className="w-4 h-4" />}
                        </div>
                        <CardContent className="p-0 flex flex-row min-h-[11rem]">
                          {activity.imageUrl ? (
                            <div className="w-48 sm:w-56 md:w-64 shrink-0 overflow-hidden">
                              <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                          ) : (
                            <div className="w-48 sm:w-56 md:w-64 shrink-0 bg-muted/40" />
                          )}
                          <div className="p-5 flex-1 min-w-0 flex flex-col">
                            <div className="flex items-center gap-3 text-sm text-primary font-medium mb-2">
                              <Clock className="w-4 h-4 shrink-0" /> {activity.time} <span className="text-muted-foreground">({activity.duration})</span>
                            </div>
                            <h4 className="text-lg font-serif font-semibold mb-1.5 leading-snug">{activity.title}</h4>
                            <p className="text-muted-foreground leading-relaxed text-sm flex-1">{activity.description}</p>

                            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border/50">
                              {activity.address && (
                                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span className="truncate">{activity.address}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-sm font-medium ml-auto bg-muted px-3 py-1 rounded-md whitespace-nowrap">
                                {sym}{lo.toLocaleString()} – {sym}{hi.toLocaleString()}
                              </div>
                            </div>
                            {activity.tips && (
                              <div className="mt-3 bg-secondary/10 text-secondary-foreground p-3 rounded-lg text-xs italic border border-secondary/20">
                                💡 {activity.tips}
                              </div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {activity.type === 'restaurant' && (<>
                                <a href={yelpSearchUrl(activity.title, trip.destination)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#d32323]/10 text-[#d32323] hover:bg-[#d32323]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Yelp</a>
                                <a href={openTableUrl(trip.destination, trip.startDate, trip.groupSize)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#da3743]/10 text-[#da3743] hover:bg-[#da3743]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />OpenTable</a>
                                <a href={googleMapsRestaurantsUrl(trip.destination, activity.title)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#4285f4]/10 text-[#4285f4] hover:bg-[#4285f4]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Maps</a>
                              </>)}
                              {activity.type === 'attraction' && (<>
                                <a href={googleMapsSearchUrl(activity.title, trip.destination)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#4285f4]/10 text-[#4285f4] hover:bg-[#4285f4]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Maps</a>
                                <a href={tripadvisorAttractionsUrl(activity.title)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#34e0a1]/10 text-[#1a7a50] hover:bg-[#34e0a1]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />TripAdvisor</a>
                              </>)}
                              {(activity.type === 'activity' || activity.type === 'shopping') && (<>
                                <a href={viatorActivityUrl(activity.title, trip.destination)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#172432]/10 text-[#172432] hover:bg-[#172432]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Viator</a>
                                <a href={getYourGuideUrl(trip.destination, trip.startDate, trip.endDate, trip.groupSize)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#ff8000]/10 text-[#cc6600] hover:bg-[#ff8000]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />GetYourGuide</a>
                              </>)}
                              {activity.type === 'hotel' && (<>
                                <a href={bookingComUrl(trip.destination, trip.startDate, trip.endDate, trip.groupSize)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#003580]/10 text-[#003580] hover:bg-[#003580]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Booking.com</a>
                                <a href={airbnbHotelsUrl(trip.destination, trip.startDate, trip.endDate, trip.groupSize)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#ff5a5f]/10 text-[#ff5a5f] hover:bg-[#ff5a5f]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Airbnb</a>
                              </>)}
                              {activity.type === 'transport' && trip.travelingFrom && (<>
                                <a href={googleFlightsUrl(trip.travelingFrom, trip.destination, trip.startDate, trip.endDate)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#4285f4]/10 text-[#4285f4] hover:bg-[#4285f4]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Google Flights</a>
                                <a href={skyscannerFlightsUrl(trip.travelingFrom, trip.destination, trip.startDate, trip.endDate, trip.groupSize)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#0770e3]/10 text-[#0770e3] hover:bg-[#0770e3]/20 transition-colors font-medium"><ExternalLink className="w-3 h-3" />Skyscanner</a>
                              </>)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ); })}
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

          {/* Suggested Experiences Tab */}
          <TabsContent value="experiences" className="animate-in fade-in duration-500">
            {itinerary.suggestedExperiences && itinerary.suggestedExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {itinerary.suggestedExperiences.map((exp, i) => (
                  <Card key={i} className="bg-card border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-row">
                    <div className="w-36 shrink-0 overflow-hidden">
                      <img
                        src={exp.imageUrl}
                        alt={exp.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <CardContent className="p-5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-serif font-semibold leading-snug">{exp.title}</h3>
                        <Badge variant="secondary" className="text-xs shrink-0">{exp.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{exp.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3 mt-auto">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {exp.duration}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-foreground ml-auto bg-muted px-2.5 py-1 rounded-md">
                          {sym}{exp.estimatedCost.toLocaleString()}
                        </div>
                      </div>
                      {exp.tips && (
                        <div className="mt-3 bg-secondary/10 text-secondary-foreground p-2.5 rounded-lg text-xs italic border border-secondary/20">
                          💡 {exp.tips}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Star className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="font-serif text-lg">No suggested experiences available.</p>
                <p className="text-sm mt-1">Regenerate your itinerary to get personalised recommendations.</p>
              </div>
            )}
          </TabsContent>

          {/* Book It Tab */}
          <TabsContent value="book" className="animate-in fade-in duration-500 space-y-10">

            {/* Helper to render a platform card */}
            {(() => {
              const dest = trip.destination;
              const start = trip.startDate;
              const end = trip.endDate;
              const pax = trip.groupSize;
              const from = (trip as typeof trip & { travelingFrom?: string | null }).travelingFrom;

              type BookingCard = { label: string; description: string; url: string; color: string };
              const Section = ({ icon, title, subtitle, cards }: { icon: React.ReactNode; title: string; subtitle: string; cards: BookingCard[] }) => (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
                    <div>
                      <h3 className="text-xl font-serif font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((c) => (
                      <a key={c.label} href={c.url} target="_blank" rel="noopener noreferrer"
                        className="group flex flex-col gap-2 p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-base" style={{ color: c.color }}>{c.label}</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                        <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium" style={{ color: c.color }}>
                          Search now →
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              );

              return (
                <div className="space-y-10">
                  {/* Trip summary banner */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 flex flex-wrap gap-6">
                    <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Destination</p><p className="font-serif text-lg font-semibold capitalize">{dest}</p></div>
                    <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Dates</p><p className="font-serif text-lg font-semibold">{format(new Date(start), "MMM d")} – {format(new Date(end), "MMM d, yyyy")}</p></div>
                    <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Travellers</p><p className="font-serif text-lg font-semibold">{pax} {pax === 1 ? "person" : "people"}</p></div>
                    {from && <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Flying from</p><p className="font-serif text-lg font-semibold capitalize">{from}</p></div>}
                    <p className="w-full text-xs text-muted-foreground mt-1">All links open on the platform's site pre-filled with your trip details. Prices and availability are shown live on each platform.</p>
                  </div>

                  {/* Flights — only if origin is known */}
                  {from && (
                    <Section
                      icon={<Plane className="w-5 h-5" />}
                      title="Flights"
                      subtitle={`${from} → ${dest} · ${format(new Date(start), "MMM d")} return ${format(new Date(end), "MMM d")}`}
                      cards={[
                        { label: "Google Flights", description: "Compare fares across all airlines with price tracking and flexible date search.", url: googleFlightsUrl(from, dest, start, end), color: "#4285f4" },
                        { label: "Skyscanner", description: "Find the cheapest flights with one-way, return and multi-city options.", url: skyscannerFlightsUrl(from, dest, start, end, pax), color: "#0770e3" },
                        { label: "Kayak", description: "Search hundreds of travel sites at once and set price alerts.", url: kayakFlightsUrl(from, dest, start, end, pax), color: "#ff690f" },
                        { label: "Expedia", description: "Bundle flights with hotels for extra savings and package deals.", url: expediaFlightsUrl(from, dest, start, end, pax), color: "#1d3d6e" },
                      ]}
                    />
                  )}

                  {/* Hotels */}
                  <Section
                    icon={<Hotel className="w-5 h-5" />}
                    title="Hotels & Stays"
                    subtitle={`${dest} · ${format(new Date(start), "MMM d")} – ${format(new Date(end), "MMM d")} · ${pax} guest${pax > 1 ? "s" : ""}`}
                    cards={[
                      { label: "Booking.com", description: "World's largest accommodation platform with free cancellation options.", url: bookingComUrl(dest, start, end, pax), color: "#003580" },
                      { label: "Airbnb", description: "Unique homes, apartments and private rooms from local hosts.", url: airbnbHotelsUrl(dest, start, end, pax), color: "#ff5a5f" },
                      { label: "Hotels.com", description: "Earn reward nights and access member-only deals.", url: hotelsComUrl(dest, start, end, pax), color: "#c00" },
                      { label: "Expedia", description: "Bundle hotel + flight for extra savings on your whole trip.", url: expediaHotelsUrl(dest, start, end, pax), color: "#1d3d6e" },
                    ]}
                  />

                  {/* Restaurants & Cafes */}
                  <Section
                    icon={<UtensilsCrossed className="w-5 h-5" />}
                    title="Restaurants & Cafes"
                    subtitle={`Dining in ${dest} — browse reviews, menus and reserve a table`}
                    cards={[
                      { label: "Yelp", description: "Reviews, photos, and menus for restaurants and cafes near you.", url: yelpRestaurantsUrl(dest), color: "#d32323" },
                      { label: "OpenTable", description: "Reserve a table at the best restaurants in real time.", url: openTableUrl(dest, start, pax), color: "#da3743" },
                      { label: "TripAdvisor", description: "Millions of traveller reviews to find the top-rated local spots.", url: tripadvisorRestaurantsUrl(dest), color: "#00af87" },
                      { label: "Google Maps", description: "Explore every café, restaurant and bar on an interactive map.", url: googleMapsRestaurantsUrl(dest), color: "#4285f4" },
                    ]}
                  />

                  {/* Experiences & Activities */}
                  <Section
                    icon={<Ticket className="w-5 h-5" />}
                    title="Experiences & Activities"
                    subtitle={`Things to do in ${dest} with instant booking`}
                    cards={[
                      { label: "Viator", description: "Skip-the-line tickets, guided tours and unique local experiences.", url: viatorUrl(dest, start), color: "#172432" },
                      { label: "GetYourGuide", description: "Thousands of activities, day trips and multi-day tours.", url: getYourGuideUrl(dest, start, end, pax), color: "#ff8000" },
                      { label: "Airbnb Experiences", description: "Hands-on activities hosted by local experts.", url: airbnbExperiencesUrl(dest, start, end), color: "#ff5a5f" },
                      { label: "Klook", description: "Discounted attraction passes and activity bundles across Asia & beyond.", url: klookUrl(dest), color: "#e8192c" },
                    ]}
                  />

                  {/* Attractions */}
                  <Section
                    icon={<Landmark className="w-5 h-5" />}
                    title="Attractions & Sights"
                    subtitle={`Must-see landmarks and hidden gems in ${dest}`}
                    cards={[
                      { label: "TripAdvisor", description: "Top-rated sights ranked by travellers with photos and tips.", url: tripadvisorAttractionsUrl(dest), color: "#00af87" },
                      { label: "Google Maps", description: "Explore landmarks, museums and parks on an interactive map.", url: googleMapsAttractionsUrl(dest), color: "#4285f4" },
                      { label: "Lonely Planet", description: "Expert-curated guide to the best sights in ${dest}.", url: lonelyPlanetUrl(dest), color: "#00aadf" },
                      { label: "Yelp", description: "Find arts & entertainment venues with crowd-sourced reviews.", url: yelpRestaurantsUrl(dest, "arts,entertainment"), color: "#d32323" },
                    ]}
                  />
                </div>
              );
            })()}
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
