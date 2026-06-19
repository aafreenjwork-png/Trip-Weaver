import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCreateTrip } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2, MapPin, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

const BUDGET_OPTIONS = ["budget", "moderate", "luxury"] as const;
const STYLE_OPTIONS = ["adventure", "cultural", "relaxation", "business", "family", "romantic"] as const;

const formSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.enum(BUDGET_OPTIONS),
  travelStyle: z.enum(STYLE_OPTIONS),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  groupSize: z.coerce.number().min(1, "Must be at least 1"),
  constraints: z.string().optional(),
});

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
      startDate: "",
      endDate: "",
      budget: "moderate" as const,
      travelStyle: "cultural" as const,
      interests: [],
      groupSize: 2,
      constraints: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTrip.mutate(
      { data: values },
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

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
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
                
                {/* Step 1: Destination & Dates */}
                <div className={step === 1 ? "block animate-in fade-in slide-in-from-right-8" : "hidden"}>
                  <div className="space-y-6">
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
                                <Input type="date" className="pl-12 py-6 text-lg rounded-xl" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                      name="groupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-serif">Group Size</FormLabel>
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
