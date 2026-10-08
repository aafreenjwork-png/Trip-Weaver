import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import {
  useCreateTrip,
  useGetRouteOptions,
  getGetRouteOptionsQueryKey,
  type AirportOption,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2, MapPin, Calendar, Users, Star, Plane, CarFront, Clock } from "lucide-react";
import { toast } from "sonner";

const BUDGET_OPTIONS = ["budget", "moderate", "luxury"] as const;
const STYLE_OPTIONS = ["adventure", "cultural", "relaxation", "business", "family", "romantic"] as const;

function formatAirportLabel(airport: AirportOption) {
  return airport.iataCode ? `${airport.name} (${airport.iataCode})` : airport.name;
}

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

const formSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  travelingFrom: z.string().min(2, "Origin city is required"),
  destinationAirport: z.string().nullable().optional(),
  currency: z.string().default("USD"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.enum(BUDGET_OPTIONS),
  travelStyle: z.enum(STYLE_OPTIONS),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  groupSize: z.coerce.number().min(1, "Must be at least 1"),
  constraints: z.string().optional(),
  hotelStars: z.coerce.number().min(1).max(5).default(3),
}).refine(
  (data) => !data.startDate || !data.endDate || new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

const INTERESTS = ["food", "history", "nature", "art", "nightlife", "shopping", "sports", "wellness"];

export default function NewTrip() {
  const [, setLocation] = useLocation();
  const createTrip = useCreateTrip();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      travelingFrom: "",
      destinationAirport: null,
      currency: "USD",
      startDate: "",
      endDate: "",
      budget: "moderate" as const,
      travelStyle: "cultural" as const,
      interests: [],
      groupSize: 2,
      constraints: "",
      hotelStars: 3,
    },
  });

  const destination = form.watch("destination")?.trim() ?? "";
  const origin = form.watch("travelingFrom")?.trim() ?? "";
  const [routeLookup, setRouteLookup] = useState<{ destination: string; origin: string } | null>(null);
  const lookupMatchesCurrent = Boolean(
    routeLookup && routeLookup.destination === destination && routeLookup.origin === origin,
  );
  const routeOptionsQuery = useGetRouteOptions(
    routeLookup ?? { destination: "", origin: "" },
    {
      query: {
        enabled: lookupMatchesCurrent,
        retry: false,
        queryKey: getGetRouteOptionsQueryKey(
          routeLookup ?? { destination: "", origin: "" },
        ),
      },
    },
  );
  const routeOptions = lookupMatchesCurrent ? routeOptionsQuery.data : undefined;

  useEffect(() => {
    if (!lookupMatchesCurrent || !routeOptions) return;
    const selectedAirport = form.getValues("destinationAirport");
    const selectedAirportIsNearby = routeOptions.airports.some(
      (airport) => formatAirportLabel(airport) === selectedAirport,
    );
    if (!selectedAirportIsNearby) {
      form.setValue(
        "destinationAirport",
        routeOptions.airports.length ? formatAirportLabel(routeOptions.airports[0]) : null,
        { shouldDirty: true },
      );
    }
  }, [form, lookupMatchesCurrent, routeOptions]);

  const searchRoutes = () => {
    if (lookupMatchesCurrent) {
      void routeOptionsQuery.refetch();
      return;
    }
    form.setValue("destinationAirport", null);
    setRouteLookup({ destination, origin });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const savedRouteOptions = lookupMatchesCurrent ? routeOptionsQuery.data : undefined;
    const selectedAirport = savedRouteOptions?.airports.some(
      (airport) => formatAirportLabel(airport) === values.destinationAirport,
    )
      ? values.destinationAirport
      : null;
    createTrip.mutate(
      {
        data: {
          ...values,
          destinationAirport: selectedAirport,
          nearestAirports: savedRouteOptions?.airports ?? [],
          roadRoute: savedRouteOptions?.roadRoute ?? null,
        },
      },
      {
        onSuccess: (data) => {
          toast.success("Journey canvas created.");
          setLocation(`/trips/${data.id}`);
        },
        onError: () => {
          toast.error("Failed to create trip. Please try again.");
        }
      }
    );
  };

  const validateStep = async () => {
    if (step === 1) {
      return await form.trigger(["destination", "travelingFrom", "currency", "startDate", "endDate", "groupSize"]);
    }
    if (step === 2) return await form.trigger(["budget", "travelStyle", "hotelStars"]);
    if (step === 3) return await form.trigger(["interests"]);
    return true;
  };

  const nextStep = async () => {
    const valid = await validateStep();
    if (valid) setStep(s => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i + 1 <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground">
            {step === 1 && "Where to?"}
            {step === 2 && "Pacing & Style"}
            {step === 3 && "Curated Interests"}
            {step === 4 && "Final Details"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Card className="bg-card border-none shadow-xl">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Step 1: Destination, Origin, Currency & Dates */}
                <div className={step === 1 ? "block animate-in fade-in slide-in-from-right-8" : "hidden"}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-serif">Destination</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                                <Input placeholder="e.g. Kyoto, Japan" className="pl-12 py-6 text-lg rounded-xl" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="travelingFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-serif">Travelling From</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Plane className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                                <Input placeholder="e.g. New York, London" className="pl-12 py-6 text-lg rounded-xl" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={searchRoutes}
                        disabled={destination.length < 2 || origin.length < 2 || routeOptionsQuery.isFetching}
                        className="rounded-xl"
                      >
                        {routeOptionsQuery.isFetching ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="mr-2 h-4 w-4" />
                        )}
                        {lookupMatchesCurrent && routeOptionsQuery.isError
                          ? "Try airport and road search again"
                          : "Find nearby airports & road options"}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Compare nearby airports and check the actual driving distance from your starting point.
                      </p>

                      {lookupMatchesCurrent && routeOptionsQuery.isError && (
                        <p role="alert" className="text-sm text-destructive">
                          {routeOptionsQuery.error instanceof Error
                            ? routeOptionsQuery.error.message
                            : "Nearby airports and road options could not be loaded. You can try again or continue planning."}
                        </p>
                      )}

                      {routeOptions && (
                        <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-5">
                          <section aria-labelledby="nearby-airports-title" className="space-y-3">
                            <div>
                              <h3 id="nearby-airports-title" className="font-serif text-lg font-semibold">
                                Nearest airports to {destination}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Choose the arrival airport for your Day 1 flight.
                              </p>
                            </div>
                            {routeOptions.airports.length ? (
                              <FormField
                                control={form.control}
                                name="destinationAirport"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    {routeOptions.airports.map((airport) => {
                                      const airportLabel = formatAirportLabel(airport);
                                      const isSelected = field.value === airportLabel;
                                      return (
                                        <FormItem key={`${airportLabel}-${airport.distanceKm}`}>
                                          <FormControl>
                                            <label
                                              className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-3 transition-colors ${
                                                isSelected
                                                  ? "border-primary ring-1 ring-primary"
                                                  : "border-border hover:border-primary/50"
                                              }`}
                                            >
                                              <input
                                                type="radio"
                                                name={field.name}
                                                value={airportLabel}
                                                checked={isSelected}
                                                onBlur={field.onBlur}
                                                ref={field.ref}
                                                onChange={() => field.onChange(airportLabel)}
                                                className="h-4 w-4 accent-primary"
                                              />
                                              <span className="flex-1 font-medium">{airportLabel}</span>
                                              <span className="text-sm text-muted-foreground">
                                                {airport.distanceKm.toLocaleString()} km away
                                              </span>
                                            </label>
                                          </FormControl>
                                        </FormItem>
                                      );
                                    })}
                                  </FormItem>
                                )}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {routeOptions.airportMessage ?? "No nearby airports were found."}
                              </p>
                            )}
                          </section>

                          <section
                            aria-labelledby="road-option-title"
                            className="flex items-start gap-3 border-t border-border pt-4"
                          >
                            {routeOptions.roadRoute.status === "unavailable" ? (
                              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            ) : (
                              <CarFront className="mt-0.5 h-5 w-5 text-primary" />
                            )}
                            <div>
                              <h3 id="road-option-title" className="font-medium">
                                Road option from {origin}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {routeOptions.roadRoute.message}
                              </p>
                              {routeOptions.roadRoute.durationMinutes !== null && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  Estimated drive time; breaks and traffic can add time.
                                </p>
                              )}
                            </div>
                          </section>
                          <p className="text-xs text-muted-foreground">
                            Approximate airport distances use{" "}
                            <a
                              href="https://ourairports.com/data/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-2"
                            >
                              OurAirports data
                            </a>
                            ; road estimates use{" "}
                            <a
                              href="https://www.openstreetmap.org/copyright"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-2"
                            >
                              OpenStreetMap data
                            </a>
                            . Drive times can vary with traffic and stops.
                          </p>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-serif">Preferred Currency</FormLabel>
                          <FormDescription>All cost estimates will use this currency.</FormDescription>
                          <FormControl>
                            <div className="relative mt-1">
                              <select
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-full py-4 px-4 rounded-xl border border-input bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                              >
                                {CURRENCIES.map(c => (
                                  <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">▾</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-serif">Start Date</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                                <Input type="date" className="pl-12 py-6 text-lg rounded-xl" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-serif">End Date</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                                <Input
                                  type="date"
                                  className="pl-12 py-6 text-lg rounded-xl"
                                  {...field}
                                  min={(() => {
                                    const s = form.getValues("startDate");
                                    if (!s) return undefined;
                                    const d = new Date(s);
                                    d.setDate(d.getDate() + 1);
                                    return d.toISOString().split("T")[0];
                                  })()}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="groupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-serif">Party Size</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                              <Input type="number" min={1} className="pl-12 py-6 text-lg rounded-xl" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Step 2: Budget & Style */}
                <div className={step === 2 ? "block animate-in fade-in slide-in-from-right-8" : "hidden"}>
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-serif">Budget Level</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-4">
                              {BUDGET_OPTIONS.map(budget => (
                                <button
                                  type="button"
                                  key={budget}
                                  onClick={() => field.onChange(budget)}
                                  className={`p-4 rounded-xl border-2 transition-all capitalize font-medium ${
                                    field.value === budget
                                      ? 'border-primary bg-primary/5 text-primary'
                                      : 'border-muted bg-transparent text-muted-foreground hover:border-primary/50'
                                  }`}
                                >
                                  {budget}
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="travelStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-serif">Travel Style</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {STYLE_OPTIONS.map(style => (
                                <button
                                  type="button"
                                  key={style}
                                  onClick={() => field.onChange(style)}
                                  className={`p-4 rounded-xl border-2 transition-all capitalize font-medium ${
                                    field.value === style
                                      ? 'border-secondary bg-secondary/5 text-secondary'
                                      : 'border-muted bg-transparent text-muted-foreground hover:border-secondary/50'
                                  }`}
                                >
                                  {style}
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hotelStars"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-serif">Hotel Rating</FormLabel>
                          <FormDescription>Select your preferred accommodation standard.</FormDescription>
                          <FormControl>
                            <div className="flex gap-3 mt-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => field.onChange(star)}
                                  className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all ${
                                    field.value === star
                                      ? 'border-accent bg-accent/10 text-accent-foreground'
                                      : 'border-muted text-muted-foreground hover:border-accent/40'
                                  }`}
                                >
                                  <div className="flex">
                                    {Array.from({ length: star }).map((_, i) => (
                                      <Star key={i} className={`w-3.5 h-3.5 ${field.value === star ? 'fill-accent text-accent' : 'fill-muted-foreground/30 text-muted-foreground/30'}`} />
                                    ))}
                                  </div>
                                  <span className="text-xs font-medium">{star}★</span>
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Step 3: Interests */}
                <div className={step === 3 ? "block animate-in fade-in slide-in-from-right-8" : "hidden"}>
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-serif">What excites you?</FormLabel>
                        <FormDescription>Select all that apply.</FormDescription>
                        <FormControl>
                          <div className="flex flex-wrap gap-3 mt-4">
                            {INTERESTS.map(interest => {
                              const isSelected = field.value.includes(interest);
                              return (
                                <button
                                  type="button"
                                  key={interest}
                                  onClick={() => {
                                    if (isSelected) {
                                      field.onChange(field.value.filter(i => i !== interest));
                                    } else {
                                      field.onChange([...field.value, interest]);
                                    }
                                  }}
                                  className={`px-6 py-3 rounded-full border-2 transition-all capitalize font-medium ${
                                    isSelected
                                      ? 'border-accent bg-accent/20 text-accent-foreground'
                                      : 'border-muted bg-transparent text-muted-foreground hover:border-accent/50'
                                  }`}
                                >
                                  {interest}
                                </button>
                              )
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Step 4: Final Details */}
                <div className={step === 4 ? "block animate-in fade-in slide-in-from-right-8" : "hidden"}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="constraints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-serif">Special Notes or Constraints</FormLabel>
                          <FormDescription>Dietary restrictions, mobility issues, specific requests.</FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. Vegan, prefer avoiding early mornings, must visit a contemporary art museum."
                              className="min-h-[120px] rounded-xl text-lg resize-none p-4"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-8 border-t border-border/50 mt-8">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full px-6 text-base">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  ) : <div></div>}

                  {step < totalSteps ? (
                    <Button type="button" onClick={nextStep} className="rounded-full px-8 py-6 text-base bg-primary hover:bg-primary/90">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={createTrip.isPending}
                      className="rounded-full px-8 py-6 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
                    >
                      {createTrip.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Craft Journey
                    </Button>
                  )}
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
