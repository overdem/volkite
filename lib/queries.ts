import { createClient } from '@supabase/supabase-js';

export type Locale = 'tr' | 'en' | 'bg' | 'ro';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function str(row: Row, key: string): string {
  return (row[key] as string) ?? '';
}

function isConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

// ─── Packages ──────────────────────────────────────────────────────────────────

export interface PackageRow {
  tag: string;
  dur: string;
  title: string;
  desc: string;
  rows: { label: string; price: string }[];
  cta: string;
}

export async function getPackages(locale: Locale): Promise<PackageRow[] | null> {
  if (!isConfigured()) return null;
  const { data, error } = await client().from('packages').select('*').order('sort');
  if (error || !data?.length) return null;
  return (data as Row[]).map((row) => ({
    tag:   str(row, `tag_${locale}`),
    dur:   str(row, `dur_${locale}`),
    title: str(row, `name_${locale}`),
    desc:  str(row, `desc_${locale}`),
    rows:  (row[`rows_${locale}`] as PackageRow['rows']) ?? [],
    cta:   str(row, `cta_${locale}`),
  }));
}

// ─── Services ──────────────────────────────────────────────────────────────────

export interface ServiceRow {
  no: string;
  name: string;
  desc: string;
}

export async function getServices(locale: Locale): Promise<ServiceRow[] | null> {
  if (!isConfigured()) return null;
  const { data, error } = await client().from('services').select('*').order('sort');
  if (error || !data?.length) return null;
  return (data as Row[]).map((row) => ({
    no:   str(row, 'no'),
    name: str(row, `name_${locale}`),
    desc: str(row, `desc_${locale}`),
  }));
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────

export interface FaqRow {
  q: string;
  a: string;
}

export async function getFaq(locale: Locale): Promise<FaqRow[] | null> {
  if (!isConfigured()) return null;
  const { data, error } = await client().from('faq').select('*').order('sort');
  if (error || !data?.length) return null;
  return (data as Row[]).map((row) => ({
    q: str(row, `q_${locale}`),
    a: str(row, `a_${locale}`),
  }));
}

// ─── Site settings ─────────────────────────────────────────────────────────────

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
  windUrl: string;
  season: string;
  windyDays: number;
  spotCoords: string;
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettings | null> {
  if (!isConfigured()) return null;
  const { data, error } = await client().from('site_settings').select('*').eq('id', 1).single();
  if (error || !data) return null;
  const row = data as Row;
  return {
    phone:        str(row, 'phone'),
    email:        str(row, 'email'),
    address:      str(row, `address_${locale}`),
    instagramUrl: str(row, 'instagram_url'),
    facebookUrl:  str(row, 'facebook_url'),
    whatsappUrl:  str(row, 'whatsapp_url'),
    windUrl:      str(row, 'wind_url'),
    season:       str(row, `season_${locale}`),
    windyDays:    (row['windy_days'] as number) ?? 300,
    spotCoords:   str(row, 'spot_coords'),
  };
}
