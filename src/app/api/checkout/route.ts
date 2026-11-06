import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';
import { INITIAL_MOCK_PROJECTS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, buyerId, simulate } = body;

    if (!projectId || !buyerId) {
      return NextResponse.json({ error: 'Missing projectId or buyerId' }, { status: 400 });
    }

    const pb = await getPocketBaseAdmin();
    let project: { id: string; title: string; price: number; user: string; is_for_sale?: boolean } | null = null;
    let sellerStripeAccount: string | null = null;

    try {
      const rec = await pb.collection('projects').getOne(projectId, { expand: 'user' });
      project = {
        id: rec.id,
        title: rec.title,
        price: typeof rec.price === 'number' ? rec.price : 0,
        user: rec.user,
        is_for_sale: !!rec.is_for_sale,
      };
      if (rec.expand?.user?.stripe_account_id && rec.expand?.user?.stripe_onboarded) {
        sellerStripeAccount = rec.expand.user.stripe_account_id;
      }
    } catch {
      const mock = INITIAL_MOCK_PROJECTS.find((p) => p.id === projectId);
      if (mock) {
        project = {
          id: mock.id,
          title: mock.title,
          price: mock.price || 0,
          user: mock.user,
          is_for_sale: mock.is_for_sale,
        };
      }
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.is_for_sale || project.price <= 0) {
      return NextResponse.json({ error: 'This project is not for sale' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.nextUrl.origin || 'http://localhost:3000';

    if (!stripeKey || simulate) {
      try {
        await pb.collection('purchases').create({
          buyer: buyerId,
          project: project.id,
          amount: project.price,
          stripe_session_id: `sim_${Date.now()}`,
          license_type: 'commercial_reuse',
        });
      } catch {
      }
      return NextResponse.json({
        url: `${origin}/purchases?success=true&projectId=${project.id}&mock=true`,
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2026-03-25.acacia' as unknown as Stripe.LatestApiVersion,
    });

    const amountInCents = Math.round(project.price * 100);
    const platformFee = Math.round(amountInCents * 0.10);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountInCents,
            product_data: {
              name: `${project.title} — Source Code & Salvage License`,
              description: 'Commercial salvage rights and full archive download access.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        project_id: project.id,
        buyer_id: buyerId,
        amount: project.price.toString(),
      },
      success_url: `${origin}/purchases?success=true&session_id={CHECKOUT_SESSION_ID}&projectId=${project.id}`,
      cancel_url: `${origin}/?canceled=true`,
    };

    if (sellerStripeAccount) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerStripeAccount,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout session creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
