import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User management for role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("teacher"), // admin, principal, vice_principal, teacher, class_teacher
  employeeId: varchar("employee_id").unique(),
  subjects: text("subjects").array(), // subjects taught
  classes: text("classes").array(), // classes assigned
  department: varchar("department"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schools/Institutions
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  principalId: varchar("principal_id").references(() => users.id),
  settings: jsonb("settings"), // school-specific configurations
  createdAt: timestamp("created_at").defaultNow(),
});

// Students
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  parentPhone: varchar("parent_phone"),
  parentEmail: varchar("parent_email"),
  class: varchar("class").notNull(),
  section: varchar("section").notNull(),
  rollNumber: integer("roll_number"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  feeStatus: varchar("fee_status").default("pending"), // paid, pending, overdue
  totalFees: decimal("total_fees", { precision: 10, scale: 2 }),
  paidFees: decimal("paid_fees", { precision: 10, scale: 2 }).default("0"),
  admissionDate: date("admission_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Teachers
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  employeeId: varchar("employee_id").unique().notNull(),
  subjects: text("subjects").array(),
  classes: text("classes").array(),
  department: varchar("department"),
  dutyFactor: decimal("duty_factor", { precision: 3, scale: 1 }).default("1.0"),
  status: varchar("status").default("ACTIVE"), // ACTIVE, SICK, ON-LEAVE
  totalDuties: integer("total_duties").default(0),
  lastDutyDate: date("last_duty_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  date: date("date").notNull(),
  status: varchar("status").notNull(), // present, absent, late, excused
  markedBy: varchar("marked_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee Records
export const feeRecords = pgTable("fee_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  feeType: varchar("fee_type").notNull(), // tuition, transport, meal, etc.
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  status: varchar("status").default("pending"), // pending, paid, overdue
  paymentMethod: varchar("payment_method"), // cash, online, cheque
  transactionId: varchar("transaction_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timetable
export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  class: varchar("class").notNull(),
  section: varchar("section").notNull(),
  day: varchar("day").notNull(), // monday, tuesday, etc.
  period: integer("period").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  subject: varchar("subject").notNull(),
  teacherId: varchar("teacher_id").references(() => users.id),
  room: varchar("room"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exam Schedule
export const examSchedule = pgTable("exam_schedule", {
  id: serial("id").primaryKey(),
  examName: varchar("exam_name").notNull(),
  subject: varchar("subject").notNull(),
  class: varchar("class").notNull(),
  section: varchar("section"),
  date: date("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  room: varchar("room"),
  maxMarks: integer("max_marks"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invigilation Duties
export const invigilationDuties = pgTable("invigilation_duties", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => examSchedule.id),
  teacherId: varchar("teacher_id").references(() => users.id),
  room: varchar("room").notNull(),
  date: date("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  isExempted: boolean("is_exempted").default(false),
  exemptionReason: text("exemption_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Behavior Records
export const behaviorRecords = pgTable("behavior_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  teacherId: varchar("teacher_id").references(() => users.id),
  type: varchar("type").notNull(), // positive, warning, disciplinary
  category: varchar("category"), // academic, behavior, attendance
  description: text("description").notNull(),
  severity: varchar("severity"), // low, medium, high
  actionTaken: text("action_taken"),
  parentNotified: boolean("parent_notified").default(false),
  followUpRequired: boolean("follow_up_required").default(false),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Substitution Log
export const substitutionLog = pgTable("substitution_log", {
  id: serial("id").primaryKey(),
  absentTeacherId: varchar("absent_teacher_id").references(() => users.id),
  substituteTeacherId: varchar("substitute_teacher_id").references(() => users.id),
  class: varchar("class").notNull(),
  section: varchar("section").notNull(),
  subject: varchar("subject").notNull(),
  period: integer("period").notNull(),
  date: date("date").notNull(),
  reason: text("reason"),
  status: varchar("status").default("assigned"), // assigned, completed, cancelled
  notificationSent: boolean("notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// WhatsApp Notifications
export const whatsappNotifications = pgTable("whatsapp_notifications", {
  id: serial("id").primaryKey(),
  recipientPhone: varchar("recipient_phone").notNull(),
  recipientName: varchar("recipient_name"),
  messageType: varchar("message_type").notNull(), // fee_reminder, attendance_alert, report_card, etc.
  message: text("message").notNull(),
  status: varchar("status").default("pending"), // pending, sent, failed, delivered
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  relatedEntityId: integer("related_entity_id"), // ID of related student, fee, etc.
  relatedEntityType: varchar("related_entity_type"), // student, fee_record, attendance, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Chat History
export const aiChatHistory = pgTable("ai_chat_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // can be null for anonymous chats
  sessionId: varchar("session_id").notNull(),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  intent: varchar("intent"), // fee_inquiry, attendance_check, exam_schedule, etc.
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  responseTime: integer("response_time"), // in milliseconds
  feedbackRating: integer("feedback_rating"), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow(),
});

// Question Papers
export const questionPapers = pgTable("question_papers", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  subject: varchar("subject").notNull(),
  class: varchar("class").notNull(),
  examType: varchar("exam_type"), // unit_test, mid_term, final, etc.
  duration: integer("duration"), // in minutes
  maxMarks: integer("max_marks"),
  instructions: text("instructions"),
  questions: jsonb("questions"), // structured question data
  createdBy: varchar("created_by").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics and Reports
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  metricType: varchar("metric_type").notNull(), // attendance_rate, fee_collection, student_performance, etc.
  entityType: varchar("entity_type"), // school, class, student, teacher
  entityId: varchar("entity_id"),
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  metadata: jsonb("metadata"), // additional context data
  period: varchar("period"), // daily, weekly, monthly, yearly
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  employeeId: true,
  subjects: true,
  classes: true,
  department: true,
});

export const insertStudentSchema = createInsertSchema(students);
export const insertTeacherSchema = createInsertSchema(teachers);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertFeeRecordSchema = createInsertSchema(feeRecords);
export const insertTimetableSchema = createInsertSchema(timetable);
export const insertExamScheduleSchema = createInsertSchema(examSchedule);
export const insertInvigilationDutySchema = createInsertSchema(invigilationDuties);
export const insertBehaviorRecordSchema = createInsertSchema(behaviorRecords);
export const insertSubstitutionLogSchema = createInsertSchema(substitutionLog);
export const insertWhatsappNotificationSchema = createInsertSchema(whatsappNotifications);
export const insertAiChatHistorySchema = createInsertSchema(aiChatHistory);
export const insertQuestionPaperSchema = createInsertSchema(questionPapers);
export const insertAnalyticsDataSchema = createInsertSchema(analyticsData);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type FeeRecord = typeof feeRecords.$inferSelect;
export type Timetable = typeof timetable.$inferSelect;
export type ExamSchedule = typeof examSchedule.$inferSelect;
export type InvigilationDuty = typeof invigilationDuties.$inferSelect;
export type BehaviorRecord = typeof behaviorRecords.$inferSelect;
export type SubstitutionLog = typeof substitutionLog.$inferSelect;
export type WhatsappNotification = typeof whatsappNotifications.$inferSelect;
export type AiChatHistory = typeof aiChatHistory.$inferSelect;
export type QuestionPaper = typeof questionPapers.$inferSelect;
export type AnalyticsData = typeof analyticsData.$inferSelect;
