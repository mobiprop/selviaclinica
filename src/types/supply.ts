export type SupplyUsageType = "Estimado" | "Exacto";

export type SupplyCurrency = "ARS" | "USD";

export type Supply = {
  id: string;
  name: string;
  unit: string;
  usage: SupplyUsageType;
  currency: SupplyCurrency;
};
