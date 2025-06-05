import {
  users,
  students,
  teachers,
  attendance,
  feeRecords,
  timetable,
  examSchedule,
  invigilationDuties,
  behaviorRecords,
  substitutionLog,
  whatsappNotifications,
  aiChatHistory,
  questionPapers,
  analyticsData,
  type User,
  type UpsertUser,
  type Student,
  type Teacher,
  type Attendance,
  type FeeRecord,
  type Timetable,
  type ExamSchedule,
  type InvigilationDuty,
  type BehaviorRecord,
  type SubstitutionLog,
  type WhatsappNotification,
  type AiChatHistory,
  type QuestionPaper,
  type AnalyticsData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudentById(id: number): Promise<Student | undefined>;
  getStudentsByClass(className: string, section?: string): Promise<Student[]>;
  createStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student>;
  
  // Teacher operations
  getTeachers(): Promise<Teacher[]>;
  getTeacherById(id: number): Promise<Teacher | undefined>;
  getTeacherByUserId(userId: string): Promise<Teacher | undefined>;
  createTeacher(teacher: Omit<Teacher, 'id' | 'createdAt'>): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<Teacher>): Promise<Teacher>;
  
  // Attendance operations
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: number, startDate?: string, endDate?: string): Promise<Attendance[]>;
  markAttendance(attendance: Omit<Attendance, 'id' | 'createdAt'>): Promise<Attendance>;
  getAttendanceStats(className?: string, section?: string): Promise<any>;
  
  // Fee operations
  getFeeRecords(): Promise<FeeRecord[]>;
  getFeeRecordsByStudent(studentId: number): Promise<FeeRecord[]>;
  createFeeRecord(feeRecord: Omit<FeeRecord, 'id' | 'createdAt'>): Promise<FeeRecord>;
  updateFeeRecord(id: number, feeRecord: Partial<FeeRecord>): Promise<FeeRecord>;
  getFeeCollectionStats(): Promise<any>;
  
  // Timetable operations
  getTimetable(className?: string, section?: string): Promise<Timetable[]>;
  createTimetableEntry(entry: Omit<Timetable, 'id' | 'createdAt'>): Promise<Timetable>;
  updateTimetableEntry(id: number, entry: Partial<Timetable>): Promise<Timetable>;
  deleteTimetableEntry(id: number): Promise<void>;
  
  // Exam and Invigilation operations
  getExamSchedule(): Promise<ExamSchedule[]>;
  createExamSchedule(exam: Omit<ExamSchedule, 'id' | 'createdAt'>): Promise<ExamSchedule>;
  getInvigilationDuties(teacherId?: string): Promise<InvigilationDuty[]>;
  assignInvigilationDuty(duty: Omit<InvigilationDuty, 'id' | 'createdAt'>): Promise<InvigilationDuty>;
  
  // Behavior tracking
  getBehaviorRecords(studentId?: number): Promise<BehaviorRecord[]>;
  createBehaviorRecord(record: Omit<BehaviorRecord, 'id' | 'createdAt'>): Promise<BehaviorRecord>;
  
  // Substitution operations
  getSubstitutionLog(date?: string): Promise<SubstitutionLog[]>;
  createSubstitution(substitution: Omit<SubstitutionLog, 'id' | 'createdAt'>): Promise<SubstitutionLog>;
  
  // WhatsApp operations
  createWhatsappNotification(notification: Omit<WhatsappNotification, 'id' | 'createdAt'>): Promise<WhatsappNotification>;
  getWhatsappNotifications(status?: string): Promise<WhatsappNotification[]>;
  updateWhatsappNotification(id: number, notification: Partial<WhatsappNotification>): Promise<WhatsappNotification>;
  
  // AI Chat operations
  saveChatHistory(chat: Omit<AiChatHistory, 'id' | 'createdAt'>): Promise<AiChatHistory>;
  getChatHistory(sessionId: string): Promise<AiChatHistory[]>;
  
  // Question Paper operations
  getQuestionPapers(): Promise<QuestionPaper[]>;
  createQuestionPaper(paper: Omit<QuestionPaper, 'id' | 'createdAt'>): Promise<QuestionPaper>;
  
  // Analytics operations
  saveAnalyticsData(data: Omit<AnalyticsData, 'id' | 'createdAt'>): Promise<AnalyticsData>;
  getAnalyticsData(metricType: string, startDate?: string, endDate?: string): Promise<AnalyticsData[]>;
  getDashboardMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.isActive, true));
  }

  async getStudentById(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentsByClass(className: string, section?: string): Promise<Student[]> {
    const conditions = [eq(students.class, className), eq(students.isActive, true)];
    if (section) {
      conditions.push(eq(students.section, section));
    }
    return await db.select().from(students).where(and(...conditions));
  }

  async createStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<Student>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set(student)
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  // Teacher operations
  async getTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers);
  }

  async getTeacherById(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
    return teacher;
  }

  async createTeacher(teacher: Omit<Teacher, 'id' | 'createdAt'>): Promise<Teacher> {
    const [newTeacher] = await db.insert(teachers).values(teacher).returning();
    return newTeacher;
  }

  async updateTeacher(id: number, teacher: Partial<Teacher>): Promise<Teacher> {
    const [updatedTeacher] = await db
      .update(teachers)
      .set(teacher)
      .where(eq(teachers.id, id))
      .returning();
    return updatedTeacher;
  }

  // Attendance operations
  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.date, date));
  }

  async getAttendanceByStudent(studentId: number, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const conditions = [eq(attendance.studentId, studentId)];
    if (startDate) conditions.push(gte(attendance.date, startDate));
    if (endDate) conditions.push(lte(attendance.date, endDate));
    
    return await db.select().from(attendance).where(and(...conditions)).orderBy(desc(attendance.date));
  }

  async markAttendance(attendanceData: Omit<Attendance, 'id' | 'createdAt'>): Promise<Attendance> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  async getAttendanceStats(className?: string, section?: string): Promise<any> {
    // Implementation for attendance statistics
    const query = db
      .select({
        total: count(),
        present: sql<number>`COUNT(CASE WHEN ${attendance.status} = 'present' THEN 1 END)`,
        absent: sql<number>`COUNT(CASE WHEN ${attendance.status} = 'absent' THEN 1 END)`,
      })
      .from(attendance);
    
    if (className || section) {
      // Join with students table to filter by class/section
      // This would need proper implementation with joins
    }
    
    const [stats] = await query;
    return {
      total: stats.total,
      present: stats.present,
      absent: stats.absent,
      attendanceRate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
    };
  }

  // Fee operations
  async getFeeRecords(): Promise<FeeRecord[]> {
    return await db.select().from(feeRecords).orderBy(desc(feeRecords.createdAt));
  }

  async getFeeRecordsByStudent(studentId: number): Promise<FeeRecord[]> {
    return await db
      .select()
      .from(feeRecords)
      .where(eq(feeRecords.studentId, studentId))
      .orderBy(desc(feeRecords.createdAt));
  }

  async createFeeRecord(feeRecord: Omit<FeeRecord, 'id' | 'createdAt'>): Promise<FeeRecord> {
    const [newFeeRecord] = await db.insert(feeRecords).values(feeRecord).returning();
    return newFeeRecord;
  }

  async updateFeeRecord(id: number, feeRecord: Partial<FeeRecord>): Promise<FeeRecord> {
    const [updatedFeeRecord] = await db
      .update(feeRecords)
      .set(feeRecord)
      .where(eq(feeRecords.id, id))
      .returning();
    return updatedFeeRecord;
  }

  async getFeeCollectionStats(): Promise<any> {
    const [stats] = await db
      .select({
        totalCollected: sql<number>`COALESCE(SUM(CASE WHEN ${feeRecords.status} = 'paid' THEN ${feeRecords.amount} END), 0)`,
        totalPending: sql<number>`COALESCE(SUM(CASE WHEN ${feeRecords.status} = 'pending' THEN ${feeRecords.amount} END), 0)`,
        totalOverdue: sql<number>`COALESCE(SUM(CASE WHEN ${feeRecords.status} = 'overdue' THEN ${feeRecords.amount} END), 0)`,
        recordCount: count(),
      })
      .from(feeRecords);
    
    return stats;
  }

  // Timetable operations
  async getTimetable(className?: string, section?: string): Promise<Timetable[]> {
    const conditions = [eq(timetable.isActive, true)];
    if (className) conditions.push(eq(timetable.class, className));
    if (section) conditions.push(eq(timetable.section, section));
    
    return await db.select().from(timetable).where(and(...conditions));
  }

  async createTimetableEntry(entry: Omit<Timetable, 'id' | 'createdAt'>): Promise<Timetable> {
    const [newEntry] = await db.insert(timetable).values(entry).returning();
    return newEntry;
  }

  async updateTimetableEntry(id: number, entry: Partial<Timetable>): Promise<Timetable> {
    const [updatedEntry] = await db
      .update(timetable)
      .set(entry)
      .where(eq(timetable.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteTimetableEntry(id: number): Promise<void> {
    await db.update(timetable).set({ isActive: false }).where(eq(timetable.id, id));
  }

  // Exam and Invigilation operations
  async getExamSchedule(): Promise<ExamSchedule[]> {
    return await db.select().from(examSchedule).where(eq(examSchedule.isActive, true));
  }

  async createExamSchedule(exam: Omit<ExamSchedule, 'id' | 'createdAt'>): Promise<ExamSchedule> {
    const [newExam] = await db.insert(examSchedule).values(exam).returning();
    return newExam;
  }

  async getInvigilationDuties(teacherId?: string): Promise<InvigilationDuty[]> {
    const conditions = [];
    if (teacherId) conditions.push(eq(invigilationDuties.teacherId, teacherId));
    
    return await db
      .select()
      .from(invigilationDuties)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(invigilationDuties.date));
  }

  async assignInvigilationDuty(duty: Omit<InvigilationDuty, 'id' | 'createdAt'>): Promise<InvigilationDuty> {
    const [newDuty] = await db.insert(invigilationDuties).values(duty).returning();
    return newDuty;
  }

  // Behavior tracking
  async getBehaviorRecords(studentId?: number): Promise<BehaviorRecord[]> {
    const conditions = [];
    if (studentId) conditions.push(eq(behaviorRecords.studentId, studentId));
    
    return await db
      .select()
      .from(behaviorRecords)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(behaviorRecords.date));
  }

  async createBehaviorRecord(record: Omit<BehaviorRecord, 'id' | 'createdAt'>): Promise<BehaviorRecord> {
    const [newRecord] = await db.insert(behaviorRecords).values(record).returning();
    return newRecord;
  }

  // Substitution operations
  async getSubstitutionLog(date?: string): Promise<SubstitutionLog[]> {
    const conditions = [];
    if (date) conditions.push(eq(substitutionLog.date, date));
    
    return await db
      .select()
      .from(substitutionLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(substitutionLog.date));
  }

  async createSubstitution(substitution: Omit<SubstitutionLog, 'id' | 'createdAt'>): Promise<SubstitutionLog> {
    const [newSubstitution] = await db.insert(substitutionLog).values(substitution).returning();
    return newSubstitution;
  }

  // WhatsApp operations
  async createWhatsappNotification(notification: Omit<WhatsappNotification, 'id' | 'createdAt'>): Promise<WhatsappNotification> {
    const [newNotification] = await db.insert(whatsappNotifications).values(notification).returning();
    return newNotification;
  }

  async getWhatsappNotifications(status?: string): Promise<WhatsappNotification[]> {
    const conditions = [];
    if (status) conditions.push(eq(whatsappNotifications.status, status));
    
    return await db
      .select()
      .from(whatsappNotifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(whatsappNotifications.createdAt));
  }

  async updateWhatsappNotification(id: number, notification: Partial<WhatsappNotification>): Promise<WhatsappNotification> {
    const [updatedNotification] = await db
      .update(whatsappNotifications)
      .set(notification)
      .where(eq(whatsappNotifications.id, id))
      .returning();
    return updatedNotification;
  }

  // AI Chat operations
  async saveChatHistory(chat: Omit<AiChatHistory, 'id' | 'createdAt'>): Promise<AiChatHistory> {
    const [newChat] = await db.insert(aiChatHistory).values(chat).returning();
    return newChat;
  }

  async getChatHistory(sessionId: string): Promise<AiChatHistory[]> {
    return await db
      .select()
      .from(aiChatHistory)
      .where(eq(aiChatHistory.sessionId, sessionId))
      .orderBy(aiChatHistory.createdAt);
  }

  // Question Paper operations
  async getQuestionPapers(): Promise<QuestionPaper[]> {
    return await db.select().from(questionPapers).orderBy(desc(questionPapers.createdAt));
  }

  async createQuestionPaper(paper: Omit<QuestionPaper, 'id' | 'createdAt'>): Promise<QuestionPaper> {
    const [newPaper] = await db.insert(questionPapers).values(paper).returning();
    return newPaper;
  }

  // Analytics operations
  async saveAnalyticsData(data: Omit<AnalyticsData, 'id' | 'createdAt'>): Promise<AnalyticsData> {
    const [newData] = await db.insert(analyticsData).values(data).returning();
    return newData;
  }

  async getAnalyticsData(metricType: string, startDate?: string, endDate?: string): Promise<AnalyticsData[]> {
    const conditions = [eq(analyticsData.metricType, metricType)];
    if (startDate) conditions.push(gte(analyticsData.date, startDate));
    if (endDate) conditions.push(lte(analyticsData.date, endDate));
    
    return await db
      .select()
      .from(analyticsData)
      .where(and(...conditions))
      .orderBy(desc(analyticsData.date));
  }

  async getDashboardMetrics(): Promise<any> {
    // Get total students
    const [studentCount] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.isActive, true));

    // Get attendance rate for today
    const today = new Date().toISOString().split('T')[0];
    const [attendanceStats] = await db
      .select({
        total: count(),
        present: sql<number>`COUNT(CASE WHEN ${attendance.status} = 'present' THEN 1 END)`,
      })
      .from(attendance)
      .where(eq(attendance.date, today));

    // Get fee collection stats
    const feeStats = await this.getFeeCollectionStats();

    // Get pending tasks (behavior records requiring follow-up)
    const [pendingTasks] = await db
      .select({ count: count() })
      .from(behaviorRecords)
      .where(eq(behaviorRecords.followUpRequired, true));

    return {
      totalStudents: studentCount.count,
      attendanceRate: attendanceStats.total > 0 ? ((attendanceStats.present / attendanceStats.total) * 100).toFixed(1) : '0.0',
      feeCollection: feeStats.totalCollected,
      pendingTasks: pendingTasks.count,
    };
  }
}

export const storage = new DatabaseStorage();
