import { Receipt, Search, MoreHorizontal, CheckCircle2, Clock, MinusCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Status = "Success" | "Pending" | "Refunded";

type Transaction = {
  id: string;
  customer: string;
  product: string;
  status: Status;
  qty: number;
  unitPrice: number;
  total: number;
};

const TRANSACTIONS: Transaction[] = [
  { id: "#04910", customer: "Ryan Korsgaard", product: "Ergo Office Chair", status: "Success", qty: 12, unitPrice: 3450, total: 41400 },
  { id: "#04911", customer: "Madelyn Lubin", product: "Sunset Desk 02", status: "Success", qty: 20, unitPrice: 2180, total: 43600 },
  { id: "#04912", customer: "Abram Bergson", product: "Eco Bookshelf", status: "Pending", qty: 22, unitPrice: 1750, total: 38500 },
  { id: "#04913", customer: "Phillip Mango", product: "Green Leaf Desk", status: "Refunded", qty: 6, unitPrice: 3250, total: 19500 },
  { id: "#04914", customer: "Sophie Martins", product: "Flex Monitor Arm", status: "Success", qty: 15, unitPrice: 890, total: 13350 },
  { id: "#04915", customer: "James Caldwell", product: "Walnut Standing Desk", status: "Pending", qty: 8, unitPrice: 4200, total: 33600 },
  { id: "#04916", customer: "Elena Vasquez", product: "Mesh Task Chair Pro", status: "Success", qty: 4, unitPrice: 520, total: 2080 },
  { id: "#04917", customer: "Marcus Chen", product: "Cable Management Tray", status: "Success", qty: 30, unitPrice: 45, total: 1350 },
];

const STATUS_STYLES: Record<Status, { icon: LucideIcon; className: string }> = {
  Success: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
  Pending: { icon: Clock, className: "bg-amber-50 text-amber-700" },
  Refunded: { icon: MinusCircle, className: "bg-zinc-100 text-zinc-600" },
};

const currency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export function TransactionsTable() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          Recent Transactions
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search transactions..."
              className="h-8 w-52 rounded-md border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button className="rounded-md border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="w-10 px-5 py-3">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-border" />
              </th>
              <th className="px-3 py-3 font-medium">ID</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Qty</th>
              <th className="px-3 py-3 font-medium">Unit Price</th>
              <th className="px-3 py-3 font-medium">Total Revenue</th>
              <th className="w-10 px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx) => {
              const status = STATUS_STYLES[tx.status];
              return (
                <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-border" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{tx.id}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{tx.customer}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{tx.product}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      <status.icon className="h-3 w-3" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{tx.qty}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{currency(tx.unitPrice)}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{currency(tx.total)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <button className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
