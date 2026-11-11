import { useEffect, useState } from "react";
import { toast } from "sonner";
import { walletApiService } from "@/services/apiClient";
import { authService } from "@/services/authService";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Crown,
  CheckCircle2,
  Sparkles,
  Download,
  Calendar,
  CreditCard,
  Zap,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Megaphone,
  Check,
  ChevronRight,
  AlertCircle,
  Loader2,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Subscription tiers data
const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free Starter",
    badge: "Basic",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Ideal for casual buyers and private sellers.",
    features: [
      "Up to 5 active marketplace listings",
      "Standard search discovery",
      "Direct buyer-seller messaging",
      "Basic trade analytics",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Merchant",
    badge: "Popular",
    monthlyPrice: 5000,
    annualPrice: 48000, // ₦4,000/mo
    description: "Designed for active shops and growing vendors.",
    features: [
      "Up to 30 active marketplace listings",
      "Official Verified Seller Badge",
      "Higher ranking in local category feeds",
      "Direct WhatsApp inquiries button",
      "Detailed lead & visitor insights",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Merchant",
    badge: "Best Value",
    monthlyPrice: 12500,
    annualPrice: 120000, // ₦10,000/mo
    description: "For established businesses, wholesalers & distributors.",
    features: [
      "Unlimited active marketplace listings",
      "Top priority in search & need matching",
      "Automatic listing refresh every 48 hours",
      "Dedicated merchant store URL",
      "24/7 priority account support",
      "Access to bulk buyer network",
    ],
    popular: false,
  },
];

export interface BillingReceipt {
  id: string;
  description: string;
  category: "subscription" | "boost";
  amount: number;
  date: string;
  status: "paid" | "successful" | "pending" | "failed";
  paymentMethod: string;
  invoice: {
    items: { name: string; qty: number; price: number }[];
    subtotal: number;
    vat: number;
    total: number;
  };
}

export default function Subscription() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [currentPlanId, setCurrentPlanId] = useState<string>(() => {
    return localStorage.getItem("kiloneed_subscription") || "free";
  });
  const [billingHistory, setBillingHistory] = useState<BillingReceipt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingReceipt | null>(null);
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Sync active subscription and billing history from backend
  const loadSubscriptionData = () => {
    authService
      .getMe()
      .then((res) => {
        const role = (res?.user?.role || "").toLowerCase();
        if (role.includes("premium")) {
          setCurrentPlanId("premium");
          localStorage.setItem("kiloneed_subscription", "premium");
        } else if (role.includes("pro")) {
          setCurrentPlanId("pro");
          localStorage.setItem("kiloneed_subscription", "pro");
        } else {
          const stored = localStorage.getItem("kiloneed_subscription");
          if (stored && ["free", "pro", "premium"].includes(stored)) {
            setCurrentPlanId(stored);
          } else {
            setCurrentPlanId("free");
          }
        }
      })
      .catch(() => {});

    walletApiService
      .getTransactions()
      .then((res) => {
        if (res && Array.isArray(res.transactions)) {
          const mapped: BillingReceipt[] = res.transactions.map((t: any) => {
            const desc = t.description || (t.type === "payment" ? "Subscription Payment" : "Wallet Funding");
            const amt = Number(t.amount) || 0;
            const dateStr = t.created_at
              ? new Date(t.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            return {
              id: t.reference || `TXN-${t.id}`,
              description: desc,
              category: desc.toLowerCase().includes("boost") ? "boost" : "subscription",
              amount: amt,
              date: dateStr,
              status: t.status === "successful" ? "paid" : t.status || "pending",
              paymentMethod: t.metadata?.method ? `${t.metadata.method} ending in card` : "Card / Paystack",
              invoice: {
                items: [{ name: desc, qty: 1, price: amt }],
                subtotal: amt,
                vat: 0,
                total: amt,
              },
            };
          });
          setBillingHistory(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingHistory(false));
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  // Returning from Paystack checkout: confirm payment with backend in real time
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return;

    window.history.replaceState({}, "", window.location.pathname);
    toast.info("Verifying subscription payment in real time...");
    walletApiService
      .verifyPaystack(reference)
      .then((res) => {
        if (res.paystack_status === "success") {
          const planName = (res as any)?.transaction?.metadata?.plan_id || "pro";
          setCurrentPlanId(planName);
          localStorage.setItem("kiloneed_subscription", planName);
          toast.success("Payment confirmed! Your subscription is now active in real time.");
          loadSubscriptionData();
        } else if (res.paystack_status === "failed") {
          toast.error("Payment was not completed.");
        } else {
          toast.info("Payment is processing. We will update your account shortly.");
        }
      })
      .catch(() => toast.error("Could not verify payment status."));
  }, []);

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === currentPlanId) || SUBSCRIPTION_PLANS[0];

  const handleSelectPlan = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    if (plan.id === currentPlanId) {
      toast.info(`You are currently on the ${plan.name}`);
      return;
    }
    setTargetPlan(plan);
    setChangePlanModalOpen(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!targetPlan || isChangingPlan) return;
    const amount =
      billingCycle === "annual" ? targetPlan.annualPrice : targetPlan.monthlyPrice;
    setIsChangingPlan(true);

    try {
      const res = await walletApiService.subscribe({
        plan_id: targetPlan.id,
        plan_name: targetPlan.name,
        amount,
        billing_cycle: billingCycle,
      });

      if (res?.authorization_url && amount > 0) {
        toast.info("Redirecting to Paystack checkout to complete subscription...");
        window.location.href = res.authorization_url;
        return;
      }

      // Free plan or direct switch
      setCurrentPlanId(targetPlan.id);
      localStorage.setItem("kiloneed_subscription", targetPlan.id);
      toast.success(`Switched to ${targetPlan.name} in real time!`);
      setChangePlanModalOpen(false);
      loadSubscriptionData();
    } catch (err: any) {
      toast.error(err?.message || "Unable to change your plan right now");
    } finally {
      setIsChangingPlan(false);
    }
  };
  return (
    <MobileLayout title="Subscription" showBack>
      <div className="max-w-xl mx-auto px-4 py-4 space-y-6 pb-24">
        
        {/* ─── Active Subscription Hero Card ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/10 border border-primary/30 p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">{activePlan.name}</h2>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activePlan.monthlyPrice > 0
                    ? `Active Subscription • ₦${activePlan.monthlyPrice.toLocaleString()}/mo`
                    : "Free Starter Tier • Always free"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{activePlan.monthlyPrice > 0 ? "Unlimited listings" : "Up to 5 listings"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{activePlan.monthlyPrice > 0 ? "Verified Badge" : "Basic discovery"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{activePlan.monthlyPrice > 0 ? "Priority search" : "Direct messaging"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{activePlan.monthlyPrice > 0 ? "24/7 Support" : "Trade analytics"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {activePlan.monthlyPrice > 0 ? "Billed via Paystack" : "No card required"}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("Payment methods are managed securely during Paystack checkout.")}
              className="h-6 text-[10px] rounded-lg border-border px-2"
            >
              Update Card
            </Button>
          </div>
        </div>

        {/* ─── Available Plans & Tiers ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-foreground">Merchant Plans</h3>
              <p className="text-xs text-muted-foreground">Select the right tier for your sales volume</p>
            </div>

            {/* Monthly / Annual Billing Toggle */}
            <div className="flex items-center p-0.5 bg-muted rounded-xl border border-border text-xs">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all",
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1",
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Annual</span>
                <span className="text-[8px] px-1 py-0.1 rounded-full bg-emerald-500 text-white font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="space-y-3">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const price = billingCycle === "monthly" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-2xl border p-3.5 transition-all bg-card space-y-2.5",
                    isCurrent
                      ? "border-primary shadow-sm ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-foreground">{plan.name}</h4>
                        {isCurrent && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] py-0 px-1.5 font-bold">
                            Current Plan
                          </Badge>
                        )}
                        {!isCurrent && plan.popular && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-500 text-[9px] py-0 px-1.5">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{plan.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-0.5">
                        <span className="font-bold text-sm sm:text-base font-display text-foreground">
                          {price === 0 ? "Free" : `₦${price.toLocaleString()}`}
                        </span>
                        {price > 0 && <span className="text-[9px] text-muted-foreground">/mo</span>}
                      </div>
                      {billingCycle === "annual" && plan.annualPrice > 0 && (
                        <p className="text-[9px] text-muted-foreground">
                          ₦{plan.annualPrice.toLocaleString()} billed yearly
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/90">
                        <Check className="w-3 h-3 text-primary shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : "default"}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={cn(
                      "w-full rounded-lg text-[11px] font-semibold h-7.5 px-3 transition-all",
                      isCurrent
                        ? "border-border text-muted-foreground bg-muted/40 cursor-default"
                        : "gradient-blue text-primary-foreground shadow-xs hover:opacity-95"
                    )}
                  >
                    {isCurrent ? "Current Plan" : `Switch to ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Billing History & Invoices ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-foreground">Billing Receipts & Invoices</h3>
              <p className="text-xs text-muted-foreground">Official VAT invoices for subscriptions & ad promotions</p>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="p-6 text-center text-xs text-muted-foreground bg-card rounded-2xl border border-border flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Loading receipts...</span>
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-card border border-border/70 space-y-1.5">
              <Receipt className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-foreground">No Billing Receipts Yet</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Official receipts and VAT invoices for subscription upgrades and ad campaigns will automatically appear here once completed.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 overflow-hidden shadow-xs">
              {billingHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedInvoice(item)}
                  className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {item.category === "subscription" ? (
                        <Crown className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Megaphone className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.date} • {item.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold font-mono text-foreground">
                        ₦{item.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] py-0 px-1 border-emerald-500/30",
                          item.status === "paid" || item.status === "successful"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ─── Invoice Detail Modal ─── */}
      <Dialog open={selectedInvoice !== null} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-2xl">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  Official Platform Receipt
                </DialogTitle>
                <DialogDescription className="sr-only">Official platform subscription receipt details</DialogDescription>
              </DialogHeader>

              <div className="space-y-2.5 py-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt Number</span>
                  <span className="font-mono font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Issued</span>
                  <span className="font-medium">{selectedInvoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{selectedInvoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                    {selectedInvoice.status}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground block">Itemized Charges</span>
                  {selectedInvoice.invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-mono font-medium">₦{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-primary">₦{selectedInvoice.amount.toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7.5 rounded-lg"
                  onClick={() => {
                    toast.success(`Receipt ${selectedInvoice.id} downloaded!`);
                    setSelectedInvoice(null);
                  }}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF Receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Change Plan Confirmation Dialog ─── */}
      <Dialog open={changePlanModalOpen} onOpenChange={setChangePlanModalOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-2xl">
          {targetPlan && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Switch to {targetPlan.name}
                </DialogTitle>
                <DialogDescription className="sr-only">Confirm subscription plan switch</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs text-muted-foreground">
                <p>
                  You are about to switch your active subscription to the{" "}
                  <strong className="text-foreground">{targetPlan.name}</strong>.
                </p>
                <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <span>New Billing Amount</span>
                    <span>
                      {billingCycle === "monthly"
                        ? `₦${targetPlan.monthlyPrice.toLocaleString()}/mo`
                        : `₦${targetPlan.annualPrice.toLocaleString()}/yr`}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Changes take effect in real time once confirmed.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7.5 text-xs rounded-lg px-3"
                  onClick={() => setChangePlanModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isChangingPlan}
                  className="gradient-blue text-primary-foreground font-semibold h-7.5 text-xs rounded-lg px-3 gap-1"
                  onClick={handleConfirmPlanChange}
                >
                  {isChangingPlan ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <span>Confirm Switch</span>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </MobileLayout>
  );
}
