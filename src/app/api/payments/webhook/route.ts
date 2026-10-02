import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Click uchun webhook qabul qiluvchi API
export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    
    // Click yuboradigan asosiy parametrlar
    const click_trans_id = data.get("click_trans_id") as string;
    const service_id = data.get("service_id") as string;
    const click_paydoc_id = data.get("click_paydoc_id") as string;
    const merchant_trans_id = data.get("merchant_trans_id") as string; // Biz yuborgan transaction_param
    const amount = parseFloat(data.get("amount") as string);
    const action = data.get("action") as string;
    const error = data.get("error") as string;
    const error_note = data.get("error_note") as string;
    const sign_time = data.get("sign_time") as string;
    const sign_string = data.get("sign_string") as string;

    const CLICK_SECRET = process.env.CLICK_SECRET || "neo-tokyo-secret";

    // 1. Signaturni tekshirish (Xavfsizlik)
    // MD5 orqali Click tomondan kelgan ma'lumotlar haqiqiyligini tekshiramiz
    const checkString = `${click_trans_id}${service_id}${CLICK_SECRET}${merchant_trans_id}${amount}${action}${sign_time}`;
    const generatedSign = crypto.createHash('md5').update(checkString).digest("hex");

    if (sign_string !== generatedSign) {
      return NextResponse.json({ error: -1, error_note: "SIGN CHECK FAILED" });
    }

    // 2. Action = 0 (Prepare)
    if (action === "0") {
      // Bizning bazamizda shunday user bormi tekshiramiz
      const userId = merchant_trans_id.split("_")[0];
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        return NextResponse.json({ error: -5, error_note: "USER DOES NOT EXIST" });
      }

      return NextResponse.json({
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: click_trans_id,
        error: 0,
        error_note: "Success"
      });
    }

    // 3. Action = 1 (Complete)
    if (action === "1") {
      const [userId, plan, period] = merchant_trans_id.split("_");
      
      const currentMonth = new Date().toISOString().slice(0, 7); // "2026-10"
      
      // CRM to'lovlar jadvaliga yozish
      await db.insert(payments).values({
        studentId: userId,
        amount: amount,
        periodMonth: currentMonth,
        status: "completed",
        paidAt: new Date()
      });

      // User statusini faollashtirish
      const [updatedUser] = await db.update(users)
        .set({ status: "active" }) // yoki plan nomiga qarab 'pro' qilish mumkin
        .where(eq(users.id, userId))
        .returning();

      // Telegram orqali xabar yuborish
      if (updatedUser && updatedUser.telegramChatId && updatedUser.tgNotifyPayments === 1) {
        const { sendTelegramNotification } = await import("@/lib/telegram");
        await sendTelegramNotification(
          updatedUser.telegramChatId,
          `✅ <b>To'lov muvaffaqiyatli qabul qilindi!</b>\n\n💰 Summa: ${amount.toLocaleString()} UZS\n📅 Davr: ${currentMonth}\n\nJLanguage bilan birga ekaningizdan xursandmiz!`
        );
      }

      return NextResponse.json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: click_trans_id,
        error: 0,
        error_note: "Success"
      });
    }

    return NextResponse.json({ error: -3, error_note: "ACTION NOT FOUND" });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: -8, error_note: "UNKNOWN ERROR" });
  }
}
