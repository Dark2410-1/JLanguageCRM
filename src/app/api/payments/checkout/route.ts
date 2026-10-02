import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const { plan, amount, isYearly } = await req.json();

    // Haqiqiy ilovada Merchant ID va Secret lar .env dan olinadi
    const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || "12345";
    const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID || "67890";

    // Tranzaksiya parmetri sifatida UserId va Plan ni beramiz
    // Webhook kelganda kim qaysi ta'rifni sotib olganini shu orqali bilamiz
    const transactionParam = `${session.id}_${plan}_${isYearly ? "year" : "month"}`;

    // Click checkout URL format
    const checkoutUrl = `https://my.click.uz/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${amount}&transaction_param=${transactionParam}`;

    // Payme ulanishi kerak bo'lsa, xuddi shunday Payme base64 encoded string yasaladi.
    
    return NextResponse.json({ url: checkoutUrl });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "To'lov xatosiga duch keldik" }, { status: 500 });
  }
}
