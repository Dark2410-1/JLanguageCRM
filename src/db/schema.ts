import { pgTable, text, timestamp, uuid, integer, pgEnum, index, real, jsonb, boolean } from "drizzle-orm/pg-core";

// ========================
// ENUMS
// ========================
export const roleEnum = pgEnum("user_role", ["student", "teacher", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "trial"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late", "excused"]);

// ========================
// USERS & ROLES
// ========================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  role: roleEnum("role").default("student").notNull(),
  status: userStatusEnum("status").default("trial").notNull(),
  avatarUrl: text("avatar_url"),
  currentJlptLevel: text("current_jlpt_level").default("N5").notNull(), 
  dailyGoalWords: integer("daily_goal_words").default(15).notNull(),
  ttsSpeed: real("tts_speed").default(1.0).notNull(),
  ttsVoice: text("tts_voice").default("female").notNull(),
  telegramChatId: text("telegram_chat_id"),
  tgNotifySrs: integer("tg_notify_srs").default(1).notNull(),
  tgNotifyLessons: integer("tg_notify_lessons").default(1).notNull(),
  tgNotifyPayments: integer("tg_notify_payments").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  streakCount: integer("streak_count").default(0).notNull(),
  lastStreakDate: timestamp("last_streak_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ========================
// CRM: GROUPS, ATTENDANCE, PAYMENTS
// ========================
export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  teacherId: uuid("teacher_id").references(() => users.id, { onDelete: "set null" }),
  jlptTarget: text("jlpt_target").notNull(),
  monthlyFee: integer("monthly_fee").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  studentGroupIdx: index("idx_group_student").on(table.groupId, table.studentId),
}));

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(),
  periodMonth: text("period_month").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  studentPaymentIdx: index("idx_student_payments").on(table.studentId, table.periodMonth),
}));

export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date", { mode: "string" }).notNull(),
  status: attendanceStatusEnum("status").default("present").notNull(),
  teacherNote: text("teacher_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  attendanceIdx: index("idx_attendance_group_date").on(table.groupId, table.date),
}));

// ========================
// LEARNING CORE: LESSONS & VOCABULARY
// ========================
export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: text("level").notNull(),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  romajiTitle: text("romaji_title"),
  description: text("description"),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  quizData: jsonb("quiz_data").$type<Array<{
    id: string;
    type: "multiple_choice" | "listening" | "reading";
    question: string;
    audioText?: string; // TTS uchun matn
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  levelOrderIdx: index("idx_lessons_level_order").on(table.level, table.order),
}));

export const quizSubmissions = pgTable("quiz_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  passed: integer("passed").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vocabulary = pgTable("vocabulary", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  level: text("level").notNull(),
  kanji: text("kanji").notNull(),
  hiragana: text("hiragana").notNull(),
  romaji: text("romaji").notNull(),
  meaningUz: text("meaning_uz").notNull(),
  examples: jsonb("examples").$type<Array<{ jp: string; uz: string; audio?: string }>>(),
  audioUrl: text("audio_url"),
  strokeCount: integer("stroke_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  vocabLevelIdx: index("idx_vocab_level").on(table.level),
  kanjiSearchIdx: index("idx_vocab_kanji").on(table.kanji),
}));

// ========================
// PROGRESS & SRS (Spaced Repetition)
// ========================
export const userSrsCards = pgTable("user_srs_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  vocabId: uuid("vocab_id").references(() => vocabulary.id, { onDelete: "cascade" }).notNull(),
  interval: integer("interval").default(0).notNull(),
  repetition: integer("repetition").default(0).notNull(),
  easeFactor: real("ease_factor").default(2.5).notNull(),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }).defaultNow().notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
}, (table) => ({
  userReviewIdx: index("idx_user_srs_next_review").on(table.userId, table.nextReviewAt),
}));

export const userLessonProgress = pgTable("user_lesson_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("in_progress").notNull(),
  score: integer("score").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => ({
  userLessonIdx: index("idx_user_lesson").on(table.userId, table.lessonId),
}));

export const xpLogs = pgTable("xp_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(), // 'quiz', 'kanji', 'lesson', 'srs'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userXpLogIdx: index("idx_user_xplogs").on(table.userId, table.createdAt),
}));

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("system").notNull(), // 'system', 'achievement', 'announcement', 'payment'
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userNotifIdx: index("idx_user_notifs").on(table.userId, table.isRead),
}));


