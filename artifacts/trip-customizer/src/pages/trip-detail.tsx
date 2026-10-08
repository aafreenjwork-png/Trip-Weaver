import { useState } from "react";
import {
  useGetTrip,
  useGenerateItinerary,
  useUpdateTrip,
  getGetTripQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useRoute, Link, useLocation } from "wouter";
import { format } from "date-fns";
import { getDestinationImageUrl } from "@/lib/destination-utils";
import {
  MapPin, Calendar, Users, Wallet, Compass, Heart,
  Loader2, FileText, ArrowRight, Plane, Sparkles, Pencil, X, Check, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BUDGET_OPTIONS = ["budget", "moderate", "luxury"] as const;
const STYLE_OPTIONS = ["adventure", "cultural", "relaxation", "business", "family", "romantic"] as const;
const INTEREST_OPTIONS = ["art", "food", "history", "nature", "nightlife", "shopping", "sports", "technology", "wellness", "architecture"];
const CURRENCIES = [
  { code: "USD", label: "USD – US Dollar" },
  { code: "EUR", label: "EUR – Euro" },
  { code: "GBP", label: "GBP – British Pound" },
  { code: "JPY", label: "JPY – Japanese Yen" },
  { code: "AUD", label: "AUD – Australian Dollar" },
  { code: "CAD", label: "CAD – Canadian Dollar" },
  { code: "CHF", label: "CHF – Swiss Franc" },
  { code: "SGD", label: "SGD – Singapore Dollar" },
  { code: "HKD", label: "HKD – Hong Kong Dollar" },
  { code: "INR", label: "INR – Indian Rupee" },
  { code: "BRL", label: "BRL – Brazilian Real" },
  { code: "MXN", label: "MXN – Mexican Peso" },
  { code: "AED", label: "AED – UAE Dirham" },
  { code: "THB", label: "THB – Thai Baht" },
  { code: "IDR", label: "IDR – Indonesian Rupiah" },
  { code: "KRW", label: "KRW – South Korean Won" },
  { code: "NZD", label: "NZD – New Zealand Dollar" },
  { code: "ZAR", label: "ZAR – South African Rand" },
  { code: "MYR", label: "MYR – Malaysian Ringgit" },
  { code: "PHP", label: "PHP – Philippine Peso" },
];

type Budget = typeof BUDGET_OPTIONS[number];
type Style = typeof STYLE_OPTIONS[number];

export default function TripDetail() {
  const [, params] = useRoute("/trips/:id");
  const id = parseInt(params?.id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useGetTrip(id, {
    query: { enabled: !!id, queryKey: getGetTripQueryKey(id) },
  });

  const generateItinerary = useGenerateItinerary();
  const updateTrip = useUpdateTrip();

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    destination: string;
    travelingFrom: string;
    startDate: string;
    endDate: string;
    budget: Budget;
    travelStyle: Style;
    interests: string[];
    groupSize: number;
    constraints: string;
    currency: string;
    hotelStars: number;
  } | null>(null);

  const startEditing = () => {
    if (!trip) return;
    setEditForm({
      destination: trip.destination,
      travelingFrom: trip.travelingFrom ?? "",
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget as Budget,
      travelStyle: trip.travelStyle as Style,
      interests: trip.interests ?? [],
      groupSize: trip.groupSize,
      constraints: trip.constraints ?? "",
      currency: trip.currency ?? "USD",
      hotelStars: trip.hotelStars ?? 3,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm(null);
  };

  const saveEdits = () => {
    if (!editForm || !trip) return;
    if (editForm.startDate && editForm.endDate && new Date(editForm.endDate) <= new Date(editForm.startDate)) {
      toast.error("End date must be after start date.");
      return;
    }
    const routeLocationsChanged =
      editForm.destination.trim().toLocaleLowerCase() !== trip.destination.trim().toLocaleLowerCase() ||
      editForm.travelingFrom.trim().toLocaleLowerCase() !== (trip.travelingFrom ?? "").trim().toLocaleLowerCase();
    updateTrip.mutate(
      {
        id,
        data: {
          destination: editForm.destination,
          travelingFrom: editForm.travelingFrom || null,
          destinationAirport: routeLocationsChanged ? null : trip.destinationAirport,
          nearestAirports: routeLocationsChanged ? [] : trip.nearestAirports,
          roadRoute: routeLocationsChanged ? null : trip.roadRoute,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
          budget: editForm.budget,
          travelStyle: editForm.travelStyle,
          interests: editForm.interests,
          groupSize: editForm.groupSize,
          constraints: editForm.constraints || undefined,
          currency: editForm.currency,
          hotelStars: editForm.hotelStars,
        },
      },
      {
        onSuccess: () => {
          toast.success("Trip preferences saved.");
          queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
          setEditing(false);
          setEditForm(null);
        },
        onError: () => {
          toast.error("Could not save changes. Please try again.");
        },
      }
    );
  };

  const toggleInterest = (interest: string) => {
    if (!editForm) return;
    setEditForm((prev) => {
      if (!prev) return prev;
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

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
        },
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

  const hotelStarsDisplay = (stars: number) =>
    "★".repeat(stars) + "☆".repeat(5 - stars);

  const bgImage = getDestinationImageUrl(editing && editForm ? editForm.destination : trip.destination);

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
        <div className="relative rounded-3xl overflow-hidden mb-12 min-h-[300px] flex items-end">
          <img
            src={bgImage}
            alt={trip.destination}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
          <div className="relative z-20 p-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-white/80 font-medium tracking-widest uppercase mb-2">The Blueprint</p>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white capitalize">
                {editing && editForm ? editForm.destination : trip.destination}
              </h1>
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-serif font-semibold flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" /> Details
                  </h3>
                  {!editing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                      className="rounded-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Plan
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                        className="rounded-full gap-2"
                        disabled={updateTrip.isPending}
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveEdits}
                        className="rounded-full gap-2"
                        disabled={updateTrip.isPending}
                      >
                        {updateTrip.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                {!editing ? (
                  <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><MapPin className="w-4 h-4" /> Destination</p>
                      <p className="font-medium text-lg capitalize">{trip.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Plane className="w-4 h-4" /> Travelling From</p>
                      <p className="font-medium text-lg capitalize">{trip.travelingFrom || <span className="text-muted-foreground text-base italic">Not specified</span>}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Party Size</p>
                      <p className="font-medium text-lg">{trip.groupSize} {trip.groupSize === 1 ? "Traveler" : "Travelers"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Dates</p>
                      <p className="font-medium text-lg">
                        {format(new Date(trip.startDate), "MMMM d, yyyy")}
                        <br />to {format(new Date(trip.endDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Wallet className="w-4 h-4" /> Budget Tier</p>
                      <p className="font-medium text-lg capitalize">{trip.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Compass className="w-4 h-4" /> Style</p>
                      <p className="font-medium text-lg capitalize">{trip.travelStyle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Star className="w-4 h-4" /> Hotel Rating</p>
                      <p className="font-medium text-lg text-amber-500 tracking-wide">{hotelStarsDisplay(trip.hotelStars ?? 3)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">💱 Currency</p>
                      <p className="font-medium text-lg">{trip.currency ?? "USD"}</p>
                    </div>
                  </div>
                ) : editForm ? (
                  <div className="space-y-6">
                    <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">Currency can only be changed when creating a new trip.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4" /> Destination</label>
                        <Input
                          value={editForm.destination}
                          onChange={(e) => setEditForm((p) => p ? { ...p, destination: e.target.value } : p)}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2"><Plane className="w-4 h-4" /> Travelling From</label>
                        <Input
                          placeholder="e.g. New York, London"
                          value={editForm.travelingFrom}
                          onChange={(e) => setEditForm((p) => p ? { ...p, travelingFrom: e.target.value } : p)}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Date</label>
                        <Input
                          type="date"
                          value={editForm.startDate}
                          onChange={(e) => setEditForm((p) => p ? { ...p, startDate: e.target.value } : p)}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4" /> End Date</label>
                        <Input
                          type="date"
                          value={editForm.endDate}
                          min={editForm.startDate ? (() => { const d = new Date(editForm.startDate); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })() : undefined}
                          onChange={(e) => setEditForm((p) => p ? { ...p, endDate: e.target.value } : p)}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2"><Users className="w-4 h-4" /> Party Size</label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={editForm.groupSize}
                          onChange={(e) => setEditForm((p) => p ? { ...p, groupSize: parseInt(e.target.value) || 1 } : p)}
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><Wallet className="w-4 h-4" /> Budget Tier</label>
                      <div className="flex gap-2 flex-wrap">
                        {BUDGET_OPTIONS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setEditForm((p) => p ? { ...p, budget: b } : p)}
                            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all border ${
                              editForm.budget === b
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-muted text-muted-foreground border-transparent hover:border-primary/30"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><Compass className="w-4 h-4" /> Travel Style</label>
                      <div className="flex gap-2 flex-wrap">
                        {STYLE_OPTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEditForm((p) => p ? { ...p, travelStyle: s } : p)}
                            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all border ${
                              editForm.travelStyle === s
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-muted text-muted-foreground border-transparent hover:border-primary/30"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><Star className="w-4 h-4" /> Hotel Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditForm((p) => p ? { ...p, hotelStars: star } : p)}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-xs font-medium ${
                              editForm.hotelStars === star
                                ? "border-accent bg-accent/10 text-accent-foreground"
                                : "border-muted text-muted-foreground hover:border-accent/40"
                            }`}
                          >
                            <div className="flex">
                              {Array.from({ length: star }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${editForm.hotelStars === star ? 'fill-accent text-accent' : 'fill-muted-foreground/30 text-muted-foreground/30'}`} />
                              ))}
                            </div>
                            {star}★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">💱 Currency</label>
                      <div className="relative">
                        <select
                          value={editForm.currency}
                          onChange={(e) => setEditForm((p) => p ? { ...p, currency: e.target.value } : p)}
                          className="w-full py-3 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                        >
                          {CURRENCIES.map(c => (
                            <option key={c.code} value={c.code}>{c.label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">▾</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Constraints card */}
            {!editing ? (
              trip.constraints && (
                <Card className="bg-primary/5 border-none shadow-md">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-serif font-semibold mb-4 text-primary">Special Constraints</h3>
                    <p className="text-muted-foreground leading-relaxed">{trip.constraints}</p>
                  </CardContent>
                </Card>
              )
            ) : editForm ? (
              <Card className="bg-primary/5 border-none shadow-md">
                <CardContent className="p-8">
                  <h3 className="text-xl font-serif font-semibold mb-4 text-primary">Special Constraints</h3>
                  <Textarea
                    placeholder="Dietary restrictions, accessibility needs, must-see places..."
                    value={editForm.constraints}
                    onChange={(e) => setEditForm((p) => p ? { ...p, constraints: e.target.value } : p)}
                    className="rounded-xl resize-none min-h-[100px]"
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-accent" /> Curated Interests
                </h3>
                {!editing ? (
                  <div className="flex flex-wrap gap-2">
                    {trip.interests?.map((interest, i) => (
                      <span key={i} className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium capitalize">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : editForm ? (
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all border ${
                          editForm.interests.includes(interest)
                            ? "bg-accent text-white border-accent shadow-sm"
                            : "bg-muted text-muted-foreground border-transparent hover:border-accent/30"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {trip.hasItinerary && (
              <Card className="bg-card border-none shadow-lg overflow-hidden border-2 border-secondary/20">
                <div className="bg-secondary/10 p-6 flex flex-col items-center text-center">
                  <Plane className="w-10 h-10 text-secondary mb-4" />
                  <h4 className="font-serif font-semibold text-lg mb-2">Want to change course?</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    {editing
                      ? "Save your changes above, then regenerate to apply them."
                      : "Regenerate a brand new itinerary based on these parameters."}
                  </p>
                  <Button
                    onClick={onGenerate}
                    variant="outline"
                    disabled={editing}
                    className="w-full rounded-full border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors disabled:opacity-40"
                  >
                    Regenerate Plan
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
