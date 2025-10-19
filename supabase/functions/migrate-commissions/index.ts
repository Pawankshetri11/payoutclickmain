import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type Txn = { id: string; user_id: string; amount: number; description: string | null; created_at: string };
type Referral = { referrer_id: string; referred_id: string };
type Profile = { user_id: string; email: string | null; name: string | null };
type Withdrawal = { id: string; user_id: string; amount: number; created_at: string };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // 1) Load all referral relationships
    const { data: referrals, error: refErr } = await supabase
      .from("referrals")
      .select("referrer_id, referred_id") as unknown as { data: Referral[] | null; error: any };
    if (refErr) throw refErr;

    const referredIds = Array.from(new Set((referrals || []).map((r) => r.referred_id)));
    const referrerToReferees = new Map<string, string[]>();
    (referrals || []).forEach((r) => {
      const arr = referrerToReferees.get(r.referrer_id) || [];
      arr.push(r.referred_id);
      referrerToReferees.set(r.referrer_id, arr);
    });

    // 2) Load emails for all referred users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, name")
      .in("user_id", referredIds) as unknown as { data: Profile[] | null };
    const emailByUser = new Map<string, string>();
    (profiles || []).forEach((p) => {
      if (p.email) emailByUser.set(p.user_id, p.email);
    });

    // 3) Find legacy commission transactions (missing an email in description)
    const { data: legacyTxns, error: txnErr } = await supabase
      .from("transactions")
      .select("id, user_id, amount, description, created_at")
      .eq("type", "earning")
      .ilike("description", "%referral commission%")
      .not("description", "ilike", "%@%")
      .limit(5000) as unknown as { data: Txn[] | null; error: any };
    if (txnErr) throw txnErr;

    let updated = 0;
    let matched = 0;

    // Helper: try to match a transaction to a referred user's withdrawal
    const matchRefereeForTxn = async (txn: Txn, candidateUserIds: string[]): Promise<string | null> => {
      for (const uid of candidateUserIds) {
        // Find withdrawals for this user around the txn time and with 10% matching amount
        const { data: wds } = await supabase
          .from("withdrawals")
          .select("id, user_id, amount, created_at")
          .eq("user_id", uid)
          .order("created_at", { ascending: false }) as unknown as { data: Withdrawal[] | null };

        const email = emailByUser.get(uid) || null;
        for (const w of wds || []) {
          const tenPercent = Number((w.amount * 0.10).toFixed(2));
          const txnAmt = Number(Number(txn.amount).toFixed(2));
          const timeDiff = Math.abs(new Date(txn.created_at).getTime() - new Date(w.created_at).getTime());
          // Within 3 days and amount matches approx 10%
          if (Math.abs(tenPercent - txnAmt) < 0.5 && timeDiff <= 3 * 24 * 60 * 60 * 1000) {
            return email;
          }
        }
      }
      return null;
    };

    // 4) Process each legacy transaction
    for (const txn of legacyTxns || []) {
      const candidates = referrerToReferees.get(txn.user_id) || [];
      let email = null as string | null;

      if (candidates.length === 1) {
        email = emailByUser.get(candidates[0]) || null;
      } else if (candidates.length > 1) {
        email = await matchRefereeForTxn(txn, candidates);
      }

      if (email) {
        matched++;
        const newDesc = `Referral commission from ${email}`;
        if ((txn.description || "").trim() !== newDesc) {
          const { error: updErr } = await supabase
            .from("transactions")
            .update({ description: newDesc })
            .eq("id", txn.id);
          if (!updErr) updated++;
        }
      }
    }

    // 5) Recompute totals per referral pair based on transactions containing that email
    let pairsUpdated = 0;
    for (const r of referrals || []) {
      const email = emailByUser.get(r.referred_id);
      if (!email) continue;
      const { data: txnsForPair } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", r.referrer_id)
        .eq("type", "earning")
        .ilike("description", `%${email}%`) as unknown as { data: { amount: number }[] | null };
      const total = (txnsForPair || []).reduce((s, t) => s + (t.amount || 0), 0);
      const { error: upRefErr } = await supabase
        .from("referrals")
        .update({ total_commission_earned: total })
        .eq("referrer_id", r.referrer_id)
        .eq("referred_id", r.referred_id);
      if (!upRefErr) pairsUpdated++;
    }

    const result = { legacy_found: (legacyTxns || []).length, matched, updated, pairsUpdated };
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e: any) {
    console.error("migrate-commissions error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});