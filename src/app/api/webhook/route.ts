import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    let event: Stripe.Event;

    if (webhookSecret && stripeKey && signature) {
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2026-03-25.acacia' as unknown as Stripe.LatestApiVersion,
      });
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const projectId = session.metadata?.project_id;
      const buyerId = session.metadata?.buyer_id;
      const amountStr = session.metadata?.amount;
      const amount = amountStr ? parseFloat(amountStr) : (session.amount_total ? session.amount_total / 100 : 0);

      if (projectId && buyerId) {
        try {
          const pb = await getPocketBaseAdmin();

          const existing = await pb.collection('purchases').getList(1, 1, {
            filter: `stripe_session_id = '${session.id}'`,
          });

          if (existing.totalItems === 0) {
            await pb.collection('purchases').create({
              buyer: buyerId,
              project: projectId,
              amount,
              stripe_session_id: session.id,
              license_type: 'commercial_reuse',
            });
          }
        } catch {
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
