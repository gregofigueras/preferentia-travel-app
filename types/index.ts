export interface ServiceItem {
  id?: string;
  description: string;
  price: number;
  neto?: string | number | null;
  category?: 'aereo' | 'hotel' | 'traslado' | 'asistencia' | 'auto' | 'otro';
}

export interface PaymentItem {
  id?: string;
  date: string;
  amount: number;
  currency?: 'USD' | 'ARS' | 'EUR';
  tc?: number | null;
  notes?: string;
  payer?: string;
}

export interface Liquidacion {
  id: string;
  sheet_name: string;
  title: string;
  client_name: string;
  destination: string;
  pax_count: number;
  services: ServiceItem[];
  payments: PaymentItem[];
  total_amount: number;
  total_paid: number;
  pending_balance: number;
  currency: 'USD' | 'ARS' | 'EUR';
  status: 'paid' | 'partial' | 'pending';
  notes?: string;
  created_at?: string;
}

export interface CRMItem {
  id: string;
  title: string;
  client_name?: string;
  destination?: string;
  date?: string;
  status: 'armar' | 'enviada' | 'cerrado' | 'viajando';
  notes?: string;
}

export interface UrgentTask {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
}

export interface MonthEntry {
  month: string;
  amount: number | string;
  formula?: string | null;
}

export interface LegajoItem {
  id: string;
  raw_title: string;
  leg_number: string;
  client_name?: string;
  months: MonthEntry[];
  notes?: string;
}

export interface AppData {
  liquidaciones: Liquidacion[];
  crm: {
    urgencias_hoy: UrgentTask[];
    propuestas_a_armar: CRMItem[];
    propuestas_enviadas: CRMItem[];
    cerrados_2026: CRMItem[];
    cerrados_2025: CRMItem[];
  };
  legajos: LegajoItem[];
}
