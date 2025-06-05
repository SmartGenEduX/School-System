import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export class VipuAIService {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
    });
    
    this.systemPrompt = `You are Vipu, an AI assistant for EduManage Pro school management system. You help parents, teachers, and administrators with school-related queries.

You can provide information about:
- Student fees and payment status
- Attendance records and statistics
- Exam schedules and timetables
- Academic performance and reports
- School events and announcements
- Teacher duty assignments
- Student behavior records
- General school policies and procedures

Always be helpful, professional, and provide accurate information. When you don't have specific information, offer to help the user find the right person to contact.

For fee queries, attendance, or specific student information, always ask for verification details like student ID or roll number for security.

Keep responses concise but informative. Use emojis appropriately to make responses friendly.`;
  }

  async processQuery(userMessage: string, userId?: string, sessionId?: string): Promise<string> {
    try {
      const startTime = Date.now();
      
      // Analyze intent first
      const intent = await this.analyzeIntent(userMessage);
      
      // Get contextual information based on intent
      const context = await this.getContextualInformation(intent, userMessage, userId);
      
      // Generate response
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.systemPrompt + (context ? `\n\nRelevant Information:\n${context}` : ''),
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0].message.content || "I'm sorry, I couldn't process your request at the moment.";
      const responseTime = Date.now() - startTime;

      // Save chat history
      if (sessionId) {
        await storage.saveChatHistory({
          userId: userId || null,
          sessionId,
          userMessage,
          aiResponse,
          intent: intent.name,
          confidence: intent.confidence,
          responseTime,
        });
      }

      return aiResponse;
    } catch (error) {
      console.error('Vipu AI error:', error);
      return "I'm experiencing technical difficulties. Please try again later or contact school support.";
    }
  }

  private async analyzeIntent(userMessage: string): Promise<{ name: string; confidence: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze the user's message and classify the intent. Respond with JSON in this format: { "intent": "intent_name", "confidence": 0.95 }

Possible intents:
- fee_inquiry: Questions about fees, payments, due dates
- attendance_check: Questions about attendance records
- exam_schedule: Questions about exams, dates, timetables
- academic_performance: Questions about grades, reports
- general_info: General school information
- behavior_inquiry: Questions about student behavior
- contact_info: Requesting contact information
- other: Anything else`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 100,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"intent": "other", "confidence": 0.5}');
      return {
        name: result.intent,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error('Intent analysis error:', error);
      return { name: 'other', confidence: 0.5 };
    }
  }

  private async getContextualInformation(intent: { name: string; confidence: number }, userMessage: string, userId?: string): Promise<string | null> {
    try {
      switch (intent.name) {
        case 'fee_inquiry':
          return await this.getFeeContext(userId);
        
        case 'attendance_check':
          return await this.getAttendanceContext(userId);
        
        case 'exam_schedule':
          return await this.getExamContext();
        
        case 'academic_performance':
          return await this.getAcademicContext(userId);
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Context retrieval error:', error);
      return null;
    }
  }

  private async getFeeContext(userId?: string): Promise<string> {
    // Get general fee collection statistics
    const feeStats = await storage.getFeeCollectionStats();
    
    return `Current Fee Collection Statistics:
- Total Collected: ₹${feeStats.totalCollected}
- Total Pending: ₹${feeStats.totalPending}
- Total Overdue: ₹${feeStats.totalOverdue}

For specific student fee information, please provide the student ID or roll number.`;
  }

  private async getAttendanceContext(userId?: string): Promise<string> {
    const attendanceStats = await storage.getAttendanceStats();
    
    return `Current Attendance Statistics:
- Overall Attendance Rate: ${attendanceStats.attendanceRate.toFixed(1)}%
- Students Present Today: ${attendanceStats.present}
- Students Absent Today: ${attendanceStats.absent}

For specific student attendance, please provide the student ID or roll number.`;
  }

  private async getExamContext(): Promise<string> {
    const exams = await storage.getExamSchedule();
    const upcomingExams = exams.slice(0, 5); // Get next 5 exams
    
    if (upcomingExams.length === 0) {
      return "No upcoming exams scheduled at the moment.";
    }

    const examList = upcomingExams.map(exam => 
      `- ${exam.subject} (${exam.class}${exam.section ? ' ' + exam.section : ''}): ${exam.date} at ${exam.startTime}`
    ).join('\n');

    return `Upcoming Exams:\n${examList}`;
  }

  private async getAcademicContext(userId?: string): Promise<string> {
    // Get general academic information
    const totalStudents = await storage.getStudents();
    
    return `Academic Overview:
- Total Active Students: ${totalStudents.length}

For specific student performance reports, please provide the student ID or roll number.`;
  }

  async generateQuestionPaper(subject: string, className: string, examType: string, duration: number): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert educator creating examination question papers. Generate a comprehensive question paper in JSON format with the following structure:

{
  "title": "Question Paper Title",
  "instructions": ["Instruction 1", "Instruction 2"],
  "sections": [
    {
      "name": "Section A",
      "instructions": "Section specific instructions",
      "questions": [
        {
          "questionNumber": 1,
          "question": "Question text",
          "marks": 2,
          "type": "objective/short/long"
        }
      ]
    }
  ]
}

Create questions appropriate for the grade level with proper mark distribution.`,
          },
          {
            role: "user",
            content: `Create a ${examType} question paper for ${subject} subject for Class ${className}. Duration: ${duration} minutes. Include a mix of objective, short answer, and long answer questions with appropriate mark distribution.`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const questionPaper = JSON.parse(response.choices[0].message.content || '{}');
      
      // Save to database
      await storage.createQuestionPaper({
        title: questionPaper.title,
        subject,
        class: className,
        examType,
        duration,
        maxMarks: this.calculateTotalMarks(questionPaper),
        instructions: questionPaper.instructions?.join('\n') || '',
        questions: questionPaper,
        createdBy: 'vipu-ai',
        isPublished: false,
        tags: [subject, className, examType],
      });

      return questionPaper;
    } catch (error) {
      console.error('Question paper generation error:', error);
      throw error;
    }
  }

  private calculateTotalMarks(questionPaper: any): number {
    let total = 0;
    if (questionPaper.sections) {
      for (const section of questionPaper.sections) {
        if (section.questions) {
          for (const question of section.questions) {
            total += question.marks || 0;
          }
        }
      }
    }
    return total;
  }

  async generateInvitationText(eventType: string, eventDetails: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating formal school event invitations. Create professional, warm, and engaging invitation text for school events.",
          },
          {
            role: "user",
            content: `Create an invitation for a ${eventType} with the following details: ${JSON.stringify(eventDetails)}`,
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content || "Unable to generate invitation text.";
    } catch (error) {
      console.error('Invitation generation error:', error);
      throw error;
    }
  }

  async analyzeBehaviorPattern(studentId: number): Promise<any> {
    try {
      const behaviorRecords = await storage.getBehaviorRecords(studentId);
      
      if (behaviorRecords.length === 0) {
        return { analysis: "No behavior records found for this student.", recommendations: [] };
      }

      const recordsSummary = behaviorRecords.map(record => 
        `${record.date}: ${record.type} - ${record.category} - ${record.description}`
      ).join('\n');

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an educational psychologist analyzing student behavior patterns. Provide insights and recommendations in JSON format:

{
  "analysis": "Overall behavior analysis",
  "patterns": ["Pattern 1", "Pattern 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "riskLevel": "low/medium/high"
}`,
          },
          {
            role: "user",
            content: `Analyze the following behavior records for a student:\n\n${recordsSummary}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Behavior analysis error:', error);
      throw error;
    }
  }
}

export const vipuAI = new VipuAIService();
