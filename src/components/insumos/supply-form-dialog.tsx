"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Supply, SupplyCurrency, SupplyUsageType } from "@/types/supply";

type FormState = {
  name: string;
  unit: string;
  usage: SupplyUsageType;
  currency: SupplyCurrency;
};

const EMPTY_FORM: FormState = {
  name: "",
  unit: "",
  usage: "Estimado",
  currency: "ARS",
};

function toFormState(supply: Supply): FormState {
  return {
    name: supply.name,
    unit: supply.unit,
    usage: supply.usage,
    currency: supply.currency,
  };
}

type SupplyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Supply | null;
  onSubmit: (supply: Supply) => void;
};

export function SupplyFormDialog({ open, onOpenChange, initialData, onSubmit }: SupplyFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const isEditing = initialData !== null;

  useEffect(() => {
    if (open) {
      setForm(initialData ? toFormState(initialData) : EMPTY_FORM);
    }
  }, [open, initialData]);

  const isValid = form.name.trim() !== "" && form.unit.trim() !== "";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({
      id: initialData?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      unit: form.unit.trim(),
      usage: form.usage,
      currency: form.currency,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Supply" : "Add Supply"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update this medical supply." : "Add a new medical supply to the catalog."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Toxina Botulinica - Botox"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  placeholder="e.g. ampolla"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="usage">Usage</Label>
                <Select value={form.usage} onValueChange={(v) => update("usage", v as SupplyUsageType)}>
                  <SelectTrigger id="usage" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estimado">Estimado</SelectItem>
                    <SelectItem value="Exacto">Exacto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v as SupplyCurrency)}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!isValid}>
              {isEditing ? "Save Changes" : "Save Supply"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
