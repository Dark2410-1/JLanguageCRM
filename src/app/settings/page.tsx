import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.id));

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="py-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 font-jp mb-2">Sozlamalar</h1>
        <p className="text-slate-400">Shaxsiy ma'lumotlar, maqsadlar va audio parametrlarni sozlang.</p>
      </div>
      
      <SettingsForm user={user} />
    </div>
  );
}
