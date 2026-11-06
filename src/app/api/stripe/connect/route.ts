import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const pb = await getPocketBaseAdmin();
    let user: { id: string; email?: string; stripe_account_id?: string; stripe_onboarded?: boolean } | null = null;

    try {
      user = await pb.collection('users').getOne(userId);
    } catch {
      user = { id: userId, stripe_onboarded: false };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.nextUrl.origin || 'http://localhost:3000';

    if (!stripeKey) {
      try {
        await pb.collection('users').update(userId, {
          stripe_account_id: `acct_sim_${Date.now()}`,
          stripe_onboarded: true,
        });
      } catch {
      }

      return NextResponse.json({
        url: `${origin}/profile?stripe_connected=simulated`,
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2026-03-25.acacia' as unknown as Stripe.LatestApiVersion,
    });

    let stripeAccountId = user?.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user?.email || undefined,
        capabilities: {
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      try {
        await pb.collection('users').update(userId, {
          stripe_account_id: stripeAccountId,
        });
      } catch {
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/profile?stripe_connect=refresh`,
      return_url: `${origin}/profile?stripe_connect=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe Connect onboarding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
