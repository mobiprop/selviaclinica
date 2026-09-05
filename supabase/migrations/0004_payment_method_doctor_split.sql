-- Patients: payment method + doctor split, and renames net_revenue to
-- net_income to match the new "clinic's actual take" framing now that it's
-- computed from a real doctor percentage instead of just defaulting to price.
-- Run this in the Supabase SQL Editor against the same project as 0001-0003.

alter table public.appointments rename column net_revenue to net_income;

alter table public.appointments
  add column if not exists payment_method text check (payment_method in ('Cash', 'Transfer')),
  add column if not exists doctor_percentage numeric check (doctor_percentage >= 0 and doctor_percentage <= 100);
