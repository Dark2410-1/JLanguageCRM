"use server";

import { db } from "@/db";
import { users, groups, groupMembers, payments, attendance } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ========================
// STUDENTS ACTIONS
// ========================
export async function getStudents() {
  const allUsers = await db.select().from(users).where(eq(users.role, "student")).orderBy(desc(users.createdAt));
  
  // Talabalar guruhini qo'shib olish
  const studentsWithGroup = await Promise.all(
    allUsers.map(async (student) => {
      const membership = await db
        .select({
          groupName: groups.name,
          monthlyFee: groups.monthlyFee,
        })
        .from(groupMembers)
        .innerJoin(groups, eq(groupMembers.groupId, groups.id))
        .where(eq(groupMembers.studentId, student.id))
        .limit(1);

      return {
        ...student,
        group: membership[0] || null,
      };
    })
  );
  return studentsWithGroup;
}

export async function addStudent(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const level = formData.get("level") as string;
  const status = formData.get("status") as any;
  const groupId = formData.get("groupId") as string;

  const [newUser] = await db.insert(users).values({
    name,
    email,
    phone,
    currentJlptLevel: level,
    status,
    role: "student",
    passwordHash: "default123", // Real app will use proper auth
  }).returning();

  if (groupId) {
    await db.insert(groupMembers).values({
      groupId,
      studentId: newUser.id
    });
  }

  revalidatePath("/crm/students");
  return { success: true };
}

// ========================
// GROUPS ACTIONS
// ========================
export async function getGroups() {
  let allGroups = await db.select().from(groups);
  
  // Auto-seed for testing if no groups exist
  if (allGroups.length === 0) {
    const dummyTeacher = await db.select().from(users).where(eq(users.role, "teacher")).limit(1);
    const teacherId = dummyTeacher.length > 0 ? dummyTeacher[0].id : null;
    
    await db.insert(groups).values([
      { name: "N5 Boshlang'ich", jlptTarget: "N5", monthlyFee: 400000, teacherId },
      { name: "N4 Intensiv", jlptTarget: "N4", monthlyFee: 500000, teacherId }
    ]);
    allGroups = await db.select().from(groups);
  }
  
  return allGroups;
}

// ========================
// PAYMENTS ACTIONS
// ========================
export async function getPayments() {
  return await db
    .select({
      id: payments.id,
      amount: payments.amount,
      periodMonth: payments.periodMonth,
      status: payments.status,
      paidAt: payments.paidAt,
      studentName: users.name,
      groupName: groups.name,
    })
    .from(payments)
    .innerJoin(users, eq(payments.studentId, users.id))
    .leftJoin(groups, eq(payments.groupId, groups.id))
    .orderBy(desc(payments.createdAt));
}

export async function addPayment(formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const amount = parseInt(formData.get("amount") as string);
  const periodMonth = formData.get("periodMonth") as string;
  const status = formData.get("status") as any;

  await db.insert(payments).values({
    studentId,
    amount,
    periodMonth,
    status,
    paidAt: status === "completed" ? new Date() : null,
  });

  revalidatePath("/crm/payments");
  return { success: true };
}

// ========================
// ATTENDANCE ACTIONS
// ========================
export async function getAttendance(groupId: string, date: string) {
  const members = await db
    .select({
      studentId: users.id,
      studentName: users.name,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.studentId, users.id))
    .where(eq(groupMembers.groupId, groupId));

  const records = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.groupId, groupId), eq(attendance.date, date)));

  return members.map((member) => {
    const record = records.find((r) => r.studentId === member.studentId);
    return {
      ...member,
      status: record?.status || "present",
      recordId: record?.id,
    };
  });
}

export async function markAttendance(groupId: string, studentId: string, date: string, status: any) {
  const existing = await db
    .select()
    .from(attendance)
    .where(and(
      eq(attendance.groupId, groupId),
      eq(attendance.studentId, studentId),
      eq(attendance.date, date)
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.update(attendance)
      .set({ status })
      .where(eq(attendance.id, existing[0].id));
  } else {
    await db.insert(attendance).values({
      groupId,
      studentId,
      date,
      status,
    });
  }

  revalidatePath("/crm/attendance");
  return { success: true };
}
