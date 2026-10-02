"use server";

import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createSession, deleteSession } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Iltimos, barcha maydonlarni to'ldiring." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    return { error: "Foydalanuvchi topilmadi yoki email xato." };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    // Agar "default123" kabi to'g'ridan-to'g'ri yozilgan parollar bo'lsa (Seed data uchun)
    if (password === user.passwordHash) {
       // O'tkazib yuboramiz
    } else {
      return { error: "Parol noto'g'ri." };
    }
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  if (user.role === 'admin' || user.role === 'teacher') {
    redirect('/admin');
  } else {
    redirect('/');
  }
}

export async function register(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Barcha maydonlarni to'ldiring." };
  }

  const [existingUser] = await db.select().from(users).where(eq(users.email, email));
  if (existingUser) {
    return { error: "Ushbu email allaqachon ro'yxatdan o'tgan." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db.insert(users).values({
    name,
    email,
    passwordHash,
    role: "student",
    currentJlptLevel: "N5",
  }).returning();

  await createSession({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });

  if (newUser.role === 'admin' || newUser.role === 'teacher') {
    redirect('/admin');
  } else {
    redirect('/');
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}



export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Emailni kiriting." };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    // Xavfsizlik uchun: User bor yoki yo`qligini oshkor qilmaslik
    return { success: "Agar bu email ro`yxatdan o`tgan bo`lsa, unga parolni tiklash havolasi yuborildi." };
  }

  // Generate Token (32 bytes -> 64 chars hex)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins from now

  await db.insert(passwordResetTokens).values({
    email,
    token,
    expiresAt,
  });

  const sent = await sendPasswordResetEmail(email, token);
  
  if (!sent) {
    return { error: "Email yuborishda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko`ring." };
  }

  return { success: "Email manzilingizga parolni tiklash havolasi yuborildi." };
}

export async function resetPassword(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) return { error: "Yangi parolni kiriting." };
  if (password.length < 6) return { error: "Parol kamida 6 ta belgidan iborat bo`lishi kerak." };

  const [resetRecord] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));

  if (!resetRecord) {
    return { error: "Havola xato yoki eskirgan." };
  }

  if (resetRecord.expiresAt < new Date()) {
    return { error: "Havola muddati o`tgan." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, resetRecord.email));
  if (!user) return { error: "Foydalanuvchi topilmadi." };

  const passwordHash = await bcrypt.hash(password, 10);

  // Update password
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  // Delete token
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetRecord.id));

  // Auto-login
  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { success: true };
}





