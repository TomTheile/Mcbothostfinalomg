import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface PaymentInfo {
  paypalEmail: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
}

export default function PremiumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  // Abrufen der Premium-Pläne
  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["/api/premium/plans"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/premium/plans");
      return await res.json();
    },
  });

  // Abrufen des Premium-Status
  const { data: premiumStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["/api/premium/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/premium/status");
      return await res.json();
    },
  });

  // Mutation zum Erstellen einer neuen Transaktion
  const createTransactionMutation = useMutation({
    mutationFn: async (planType: string) => {
      const res = await apiRequest("POST", "/api/premium/transactions", { planType });
      return await res.json();
    },
    onSuccess: (data) => {
      setPaymentInfo(data.paymentInfo);
      setPaymentStatus("pending");
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Erstellen der Transaktion",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation zum Abschließen einer Transaktion (simuliert für Testzwecke)
  const completeTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await apiRequest("POST", `/api/premium/transactions/${transactionId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      setPaymentStatus("success");
      queryClient.invalidateQueries({ queryKey: ["/api/premium/status"] });
      toast({
        title: "Premium aktiviert!",
        description: "Ihr Premium-Account wurde erfolgreich aktiviert.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      setPaymentStatus("error");
      toast({
        title: "Fehler bei der Zahlungsabwicklung",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = () => {
    if (!selectedPlan) return;
    createTransactionMutation.mutate(selectedPlan);
  };

  const handleCompletePayment = () => {
    if (!paymentInfo?.reference) return;
    completeTransactionMutation.mutate(paymentInfo.reference);
  };

  // Rendern der Seite während des Ladens
  if (isLoadingPlans || isLoadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Lade Premium-Informationen...</p>
      </div>
    );
  }

  // Wenn der Benutzer bereits Premium ist
  if (premiumStatus?.isPremium) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Premium-Status</h1>
            <p className="text-muted-foreground">Ihr aktueller Premium-Status und Vorteile</p>
          </div>

          <Card className="border-primary mb-8">
            <CardHeader className="bg-primary/10">
              <div className="flex justify-between items-center">
                <CardTitle>Premium-Mitglied</CardTitle>
                <Badge variant="default" className="bg-primary">Aktiv</Badge>
              </div>
              <CardDescription>
                {premiumStatus.status === "lifetime" 
                  ? "Lebenslange Mitgliedschaft"
                  : `Gültig bis: ${new Date(premiumStatus.premiumUntil).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Unbegrenzte Bots</h3>
                    <p className="text-sm text-muted-foreground">Sie können unbegrenzt viele Bots erstellen und verwalten.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Erweiterte Bot-Funktionen</h3>
                    <p className="text-sm text-muted-foreground">Zugriff auf alle verfügbaren Bot-Funktionen und -Einstellungen.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Prioritäts-Support</h3>
                    <p className="text-sm text-muted-foreground">Erhalten Sie bevorzugten Support bei technischen Problemen.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Maximale Anzahl an Bots: <span className="text-primary">Unbegrenzt</span></p>
                <p className="text-sm text-muted-foreground">Vielen Dank, dass Sie Premium-Mitglied sind!</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Wenn eine Zahlung in Bearbeitung ist
  if (paymentStatus === "pending" && paymentInfo) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Zahlung in Bearbeitung</h1>
            <p className="text-muted-foreground">Bitte folgen Sie diesen Schritten, um Ihre Premium-Mitgliedschaft zu aktivieren</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>PayPal-Zahlung</CardTitle>
              <CardDescription>Überweisen Sie den angegebenen Betrag an die PayPal-Adresse unten.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                  <p className="font-medium mb-2">PayPal-Adresse:</p>
                  <div className="flex items-center gap-2 mb-4 bg-background rounded p-2">
                    <span className="font-mono text-sm font-medium break-all">{paymentInfo.paypalEmail}</span>
                  </div>
                  
                  <p className="font-medium mb-2">Zahlungsdetails:</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Betrag:</span>
                      <span className="font-medium">{paymentInfo.amount} {paymentInfo.currency}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Beschreibung:</span>
                      <span className="font-medium">{paymentInfo.description}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Referenz:</span>
                      <span className="font-mono text-sm">{paymentInfo.reference}</span>
                    </li>
                  </ul>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Wichtig:</strong> Bitte geben Sie die Referenznummer in der Zahlungsbeschreibung an, damit wir Ihre Zahlung zuordnen können.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleCompletePayment} 
                disabled={completeTransactionMutation.isPending}
              >
                {completeTransactionMutation.isPending 
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird verarbeitet...</>
                  : "Ich habe die Zahlung abgeschlossen"
                }
              </Button>
            </CardFooter>
          </Card>

          <div className="text-center">
            <Button variant="outline" onClick={() => setPaymentStatus("idle")} disabled={completeTransactionMutation.isPending}>
              Abbrechen und zurück
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Erfolgreiche Zahlung
  if (paymentStatus === "success") {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Zahlung erfolgreich!</h1>
          <p className="text-muted-foreground mb-8">Ihr Premium-Account wurde aktiviert. Genießen Sie die Vorteile!</p>
          <Button onClick={() => window.location.reload()}>Zum Premium-Dashboard</Button>
        </div>
      </div>
    );
  }

  // Fehler bei der Zahlung
  if (paymentStatus === "error") {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Zahlung fehlgeschlagen</h1>
          <p className="text-muted-foreground mb-8">Bei der Verarbeitung Ihrer Zahlung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.</p>
          <Button onClick={() => setPaymentStatus("idle")}>Zurück zur Planauswahl</Button>
        </div>
      </div>
    );
  }

  // Normale Anzeige der Premium-Pläne
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3">Upgrade auf Premium</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Erhalten Sie unbegrenzten Zugriff auf alle Funktionen und erstellen Sie beliebig viele Bots für Ihre Minecraft-Server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plansData?.plans.map((plan: PremiumPlan) => (
            <Card 
              key={plan.id} 
              className={`flex flex-col ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary' : ''}`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price} €</span>
                  {plan.id === "monthly" && <span className="text-muted-foreground ml-1">/Monat</span>}
                  {plan.id === "yearly" && <span className="text-muted-foreground ml-1">/Jahr</span>}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Unbegrenzte Bots</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Erweiterte Funktionen</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Priority Support</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={selectedPlan === plan.id ? "default" : "outline"} 
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? "Ausgewählt" : "Auswählen"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            disabled={!selectedPlan || createTransactionMutation.isPending} 
            onClick={handlePurchase}
            className="px-8"
          >
            {createTransactionMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verarbeite...</>
            ) : (
              "Jetzt kaufen"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}