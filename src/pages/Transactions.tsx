import { useState } from "react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Receipt, ArrowUpRight, ArrowDownLeft, CreditCard, Calendar,
  Download, Filter, TrendingUp, Wallet
} from "lucide-react";

const transactions = [
  { id: "TXN-001", description: "Plus Profile Subscription", type: "subscription" as const, amount: -2500, date: "2026-03-28", status: "completed" as const, method: "Visa •••• 4242", invoice: { items: [{ name: "Plus Plan - Monthly", qty: 1, price: 2500 }], subtotal: 2500, tax: 0, total: 2500 } },
  { id: "TXN-002", description: "Marketplace Featured Ad", type: "ad" as const, amount: -5000, date: "2026-03-25", status: "completed" as const, method: "Visa •••• 4242", invoice: { items: [{ name: "Marketplace Featured - 7 days", qty: 1, price: 5000 }], subtotal: 5000, tax: 0, total: 5000 } },
  { id: "TXN-003", description: "Lagos Tech Buyers - Group Dues", type: "dues" as const, amount: -500, date: "2026-03-20", status: "completed" as const, method: "Visa •••• 4242", invoice: { items: [{ name: "Lagos Tech Buyers - Monthly Dues", qty: 1, price: 500 }], subtotal: 500, tax: 0, total: 500 } },
  { id: "TXN-004", description: "Need Feed Sidebar Ad", type: "ad" as const, amount: -3000, date: "2026-03-18", status: "completed" as const, method: "Visa •••• 4242", invoice: { items: [{ name: "Need Feed Sidebar - 1 day", qty: 1, price: 3000 }], subtotal: 3000, tax: 0, total: 3000 } },
  { id: "TXN-005", description: "Pro Profile Subscription", type: "subscription" as const, amount: -6000, date: "2026-03-01", status: "completed" as const, method: "Mastercard •••• 8888", invoice: { items: [{ name: "Pro Plan - Monthly", qty: 1, price: 6000 }], subtotal: 6000, tax: 0, total: 6000 } },
  { id: "TXN-006", description: "Notification Push Campaign", type: "ad" as const, amount: -2000, date: "2026-02-28", status: "failed" as const, method: "Visa •••• 4242", invoice: { items: [{ name: "Notification Push - 1 blast", qty: 1, price: 2000 }], subtotal: 2000, tax: 0, total: 2000 } },
  { id: "TXN-007", description: "Abuja Auto Market - Group Dues", type: "dues" as const, amount: -1000, date: "2026-02-20", status: "pending" as const, method: "Visa •••• 4242", invoice: { items: [{ name: "Abuja Auto Market - Monthly Dues", qty: 1, price: 1000 }], subtotal: 1000, tax: 0, total: 1000 } },
];

const typeLabels: Record<string, string> = { subscription: "Subscription", ad: "Advertising", dues: "Group Dues" };
const statusStyle: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
};

function InvoiceDialog({ txn }: { txn: typeof transactions[0] }) {
  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm sm:text-base flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" /> {txn.id}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium">{txn.date}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Payment</span>
          <span className="font-medium">{txn.method}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="outline" className={`text-[10px] ${statusStyle[txn.status]}`}>{txn.status}</Badge>
        </div>
        <Separator />
        {txn.invoice.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs sm:text-sm">
            <span className="truncate mr-2">{item.name} × {item.qty}</span>
            <span className="font-mono shrink-0">₦{item.price.toLocaleString()}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between text-xs sm:text-sm font-bold">
          <span>Total</span>
          <span className="font-mono">₦{txn.invoice.total.toLocaleString()}</span>
        </div>
        <Button variant="outline" className="w-full text-xs" onClick={() => toast.success(`Invoice ${txn.id} downloaded`)}>
          <Download className="h-3.5 w-3.5 mr-1" /> Download Invoice
        </Button>
      </div>
    </DialogContent>
  );
}

const Transactions = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const filtered = typeFilter === "all" ? transactions : transactions.filter((t) => t.type === typeFilter);
  const totalSpent = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 flex items-center gap-2 sm:gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-3 sm:px-4">
            <SidebarTrigger />
            <span className="font-display text-base sm:text-lg font-bold text-gradient-blue">KILONEED</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Transactions</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">View all payments and invoices.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Card>
                  <CardContent className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-2 sm:px-4">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                      <p className="text-xs sm:text-lg font-bold font-mono truncate">₦{totalSpent.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-2 sm:px-4">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Month</p>
                      <p className="text-xs sm:text-lg font-bold font-mono truncate">₦{transactions.filter((t) => t.date.startsWith("2026-03") && t.status === "completed").reduce((s, t) => s + Math.abs(t.amount), 0).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-2 sm:px-4">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Count</p>
                      <p className="text-xs sm:text-lg font-bold">{transactions.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36 sm:w-44 h-8 text-xs sm:text-sm">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="subscription">Subscriptions</SelectItem>
                    <SelectItem value="ad">Advertising</SelectItem>
                    <SelectItem value="dues">Group Dues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filtered.map((txn) => (
                  <Dialog key={txn.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all group">
                        <CardContent className="flex items-center justify-between py-2.5 sm:py-3 px-3 gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 ${txn.amount < 0 ? "bg-destructive/10" : "bg-emerald-500/10"}`}>
                              {txn.amount < 0 ? <ArrowUpRight className="h-3.5 w-3.5 text-destructive" /> : <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate">{txn.description}</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] sm:text-xs text-muted-foreground">{txn.date}</span>
                                <Badge variant="outline" className="text-[9px] sm:text-[10px]">{typeLabels[txn.type]}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs sm:text-sm font-mono font-semibold ${txn.amount < 0 ? "text-destructive" : "text-emerald-600"}`}>
                              {txn.amount < 0 ? "-" : "+"}₦{Math.abs(txn.amount).toLocaleString()}
                            </p>
                            <Badge variant="outline" className={`text-[9px] sm:text-[10px] ${statusStyle[txn.status]}`}>
                              {txn.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <InvoiceDialog txn={txn} />
                  </Dialog>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Transactions;