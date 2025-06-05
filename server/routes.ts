import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { whatsappService } from "./whatsapp";
import { vipuAI } from "./openai";
import { setupWebSocket, getWebSocketService } from "./websocket";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Student routes
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudentById(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post('/api/students', isAuthenticated, async (req, res) => {
    try {
      const studentData = req.body;
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Teacher routes
  app.get('/api/teachers', isAuthenticated, async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  // Attendance routes
  app.get('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const { date, studentId } = req.query;
      let attendance;
      
      if (studentId) {
        attendance = await storage.getAttendanceByStudent(parseInt(studentId as string));
      } else if (date) {
        attendance = await storage.getAttendanceByDate(date as string);
      } else {
        // Get today's attendance
        const today = new Date().toISOString().split('T')[0];
        attendance = await storage.getAttendanceByDate(today);
      }
      
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const attendanceData = {
        ...req.body,
        markedBy: req.user.claims.sub,
      };
      
      const attendance = await storage.markAttendance(attendanceData);
      
      // Send WhatsApp notification if absent
      if (attendance.status === 'absent') {
        const student = await storage.getStudentById(attendance.studentId!);
        if (student && student.parentPhone) {
          await whatsappService.sendAttendanceAlert(
            `${student.firstName} ${student.lastName}`,
            student.parentPhone,
            attendance.status,
            attendance.date!
          );
        }
      }
      
      // Broadcast real-time update
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcastAttendanceUpdate(attendance);
      }
      
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  app.get('/api/attendance/stats', isAuthenticated, async (req, res) => {
    try {
      const { class: className, section } = req.query;
      const stats = await storage.getAttendanceStats(
        className as string,
        section as string
      );
      res.json(stats);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  // Fee Management routes
  app.get('/api/fees', isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.query;
      let feeRecords;
      
      if (studentId) {
        feeRecords = await storage.getFeeRecordsByStudent(parseInt(studentId as string));
      } else {
        feeRecords = await storage.getFeeRecords();
      }
      
      res.json(feeRecords);
    } catch (error) {
      console.error("Error fetching fee records:", error);
      res.status(500).json({ message: "Failed to fetch fee records" });
    }
  });

  app.post('/api/fees', isAuthenticated, async (req, res) => {
    try {
      const feeRecord = await storage.createFeeRecord(req.body);
      res.status(201).json(feeRecord);
    } catch (error) {
      console.error("Error creating fee record:", error);
      res.status(500).json({ message: "Failed to create fee record" });
    }
  });

  app.put('/api/fees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const feeRecord = await storage.updateFeeRecord(id, req.body);
      
      // Send WhatsApp receipt if payment is completed
      if (req.body.status === 'paid') {
        const student = await storage.getStudentById(feeRecord.studentId!);
        if (student && student.parentPhone) {
          await whatsappService.sendMessage(
            student.parentPhone,
            `Payment of ₹${feeRecord.amount} received for ${student.firstName} ${student.lastName}. Transaction ID: ${feeRecord.transactionId}`,
            'fee_payment'
          );
        }
      }
      
      // Broadcast real-time update
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcastFeeUpdate(feeRecord);
      }
      
      res.json(feeRecord);
    } catch (error) {
      console.error("Error updating fee record:", error);
      res.status(500).json({ message: "Failed to update fee record" });
    }
  });

  app.get('/api/fees/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getFeeCollectionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching fee stats:", error);
      res.status(500).json({ message: "Failed to fetch fee stats" });
    }
  });

  // Timetable routes
  app.get('/api/timetable', isAuthenticated, async (req, res) => {
    try {
      const { class: className, section } = req.query;
      const timetable = await storage.getTimetable(
        className as string,
        section as string
      );
      res.json(timetable);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.post('/api/timetable', isAuthenticated, async (req, res) => {
    try {
      const entry = await storage.createTimetableEntry(req.body);
      
      // Broadcast real-time update
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcastTimetableUpdate(entry);
      }
      
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating timetable entry:", error);
      res.status(500).json({ message: "Failed to create timetable entry" });
    }
  });

  // Exam Schedule routes
  app.get('/api/exams', isAuthenticated, async (req, res) => {
    try {
      const exams = await storage.getExamSchedule();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exam schedule:", error);
      res.status(500).json({ message: "Failed to fetch exam schedule" });
    }
  });

  app.post('/api/exams', isAuthenticated, async (req, res) => {
    try {
      const exam = await storage.createExamSchedule(req.body);
      res.status(201).json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  // Invigilation Duty routes
  app.get('/api/invigilation', isAuthenticated, async (req: any, res) => {
    try {
      const { teacherId } = req.query;
      const userId = teacherId || req.user.claims.sub;
      const duties = await storage.getInvigilationDuties(userId);
      res.json(duties);
    } catch (error) {
      console.error("Error fetching invigilation duties:", error);
      res.status(500).json({ message: "Failed to fetch invigilation duties" });
    }
  });

  app.post('/api/invigilation', isAuthenticated, async (req, res) => {
    try {
      const duty = await storage.assignInvigilationDuty(req.body);
      
      // Send WhatsApp notification to teacher
      const teacher = await storage.getUser(duty.teacherId!);
      if (teacher) {
        // Here you would get teacher's phone number from a separate teacher profile
        // await whatsappService.sendInvigilationDuty(teacher.firstName!, teacherPhone, duty);
      }
      
      // Broadcast real-time update
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcastInvigilationUpdate(duty);
      }
      
      res.status(201).json(duty);
    } catch (error) {
      console.error("Error assigning invigilation duty:", error);
      res.status(500).json({ message: "Failed to assign invigilation duty" });
    }
  });

  // Behavior Tracker routes
  app.get('/api/behavior', isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.query;
      const records = await storage.getBehaviorRecords(
        studentId ? parseInt(studentId as string) : undefined
      );
      res.json(records);
    } catch (error) {
      console.error("Error fetching behavior records:", error);
      res.status(500).json({ message: "Failed to fetch behavior records" });
    }
  });

  app.post('/api/behavior', isAuthenticated, async (req: any, res) => {
    try {
      const recordData = {
        ...req.body,
        teacherId: req.user.claims.sub,
      };
      
      const record = await storage.createBehaviorRecord(recordData);
      
      // Broadcast real-time update
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcastBehaviorUpdate(record);
      }
      
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating behavior record:", error);
      res.status(500).json({ message: "Failed to create behavior record" });
    }
  });

  // Substitution routes
  app.get('/api/substitutions', isAuthenticated, async (req, res) => {
    try {
      const { date } = req.query;
      const substitutions = await storage.getSubstitutionLog(date as string);
      res.json(substitutions);
    } catch (error) {
      console.error("Error fetching substitutions:", error);
      res.status(500).json({ message: "Failed to fetch substitutions" });
    }
  });

  app.post('/api/substitutions', isAuthenticated, async (req, res) => {
    try {
      const substitution = await storage.createSubstitution(req.body);
      
      // Send WhatsApp notification to substitute teacher
      // const substituteTeacher = await storage.getUser(substitution.substituteTeacherId!);
      // if (substituteTeacher) {
      //   await whatsappService.sendSubstitutionNotification(...);
      // }
      
      // Broadcast real-time update
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcastSubstitutionUpdate(substitution);
      }
      
      res.status(201).json(substitution);
    } catch (error) {
      console.error("Error creating substitution:", error);
      res.status(500).json({ message: "Failed to create substitution" });
    }
  });

  // WhatsApp routes
  app.post('/api/whatsapp/send', isAuthenticated, async (req, res) => {
    try {
      const { to, message, messageType } = req.body;
      
      const result = await whatsappService.sendMessage(to, message, messageType);
      
      // Save notification record
      await storage.createWhatsappNotification({
        recipientPhone: to,
        messageType,
        message,
        status: 'sent',
        sentAt: new Date(),
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });

  app.get('/api/whatsapp/notifications', isAuthenticated, async (req, res) => {
    try {
      const { status } = req.query;
      const notifications = await storage.getWhatsappNotifications(status as string);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching WhatsApp notifications:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp notifications" });
    }
  });

  // WhatsApp webhook
  app.get('/api/whatsapp/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    const result = whatsappService.verifyWebhook(mode as string, token as string, challenge as string);
    
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(403).send('Forbidden');
    }
  });

  app.post('/api/whatsapp/webhook', async (req, res) => {
    try {
      await whatsappService.processWebhook(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      res.status(500).send('Error');
    }
  });

  // Vipu AI routes
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, sessionId, userId } = req.body;
      
      const response = await vipuAI.processQuery(message, userId, sessionId);
      
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to process AI query" });
    }
  });

  app.get('/api/ai/chat/history/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const history = await storage.getChatHistory(sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  app.post('/api/ai/generate-question-paper', isAuthenticated, async (req, res) => {
    try {
      const { subject, className, examType, duration } = req.body;
      
      const questionPaper = await vipuAI.generateQuestionPaper(
        subject,
        className,
        examType,
        duration
      );
      
      res.json(questionPaper);
    } catch (error) {
      console.error("Error generating question paper:", error);
      res.status(500).json({ message: "Failed to generate question paper" });
    }
  });

  app.post('/api/ai/analyze-behavior/:studentId', isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const analysis = await vipuAI.analyzeBehaviorPattern(studentId);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing behavior:", error);
      res.status(500).json({ message: "Failed to analyze behavior" });
    }
  });

  // Question Paper routes
  app.get('/api/question-papers', isAuthenticated, async (req, res) => {
    try {
      const papers = await storage.getQuestionPapers();
      res.json(papers);
    } catch (error) {
      console.error("Error fetching question papers:", error);
      res.status(500).json({ message: "Failed to fetch question papers" });
    }
  });

  app.post('/api/question-papers', isAuthenticated, async (req: any, res) => {
    try {
      const paperData = {
        ...req.body,
        createdBy: req.user.claims.sub,
      };
      
      const paper = await storage.createQuestionPaper(paperData);
      res.status(201).json(paper);
    } catch (error) {
      console.error("Error creating question paper:", error);
      res.status(500).json({ message: "Failed to create question paper" });
    }
  });

  // PowerBI Export routes
  app.get('/api/analytics/export', isAuthenticated, async (req, res) => {
    try {
      const { metricType, startDate, endDate } = req.query;
      
      const data = await storage.getAnalyticsData(
        metricType as string,
        startDate as string,
        endDate as string
      );
      
      // Format data for PowerBI consumption
      const powerBIData = data.map(item => ({
        MetricType: item.metricType,
        EntityType: item.entityType,
        EntityId: item.entityId,
        Value: parseFloat(item.value),
        Date: item.date,
        Metadata: item.metadata,
        Period: item.period,
      }));
      
      res.json(powerBIData);
    } catch (error) {
      console.error("Error exporting analytics data:", error);
      res.status(500).json({ message: "Failed to export analytics data" });
    }
  });

  // Create HTTP server and setup WebSocket
  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}
