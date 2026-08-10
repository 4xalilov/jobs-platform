import type { PlanId } from "@/lib/db/types";

/** Tarif narxlari — mahsulot konfiguratsiyasi, bazada saqlanmaydi */
export type Plan = { id: PlanId; price: number; monthly: boolean };

export const plans: Plan[] = [
  { id: "free", price: 0, monthly: false },
  { id: "standard", price: 59_000, monthly: false },
  { id: "premium", price: 129_000, monthly: false },
  { id: "pack", price: 449_000, monthly: false },
  { id: "database", price: 299_000, monthly: true },
];
