export class WhatsAppService {
  private apiKey: string;
  private businessNumber: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '';
    this.baseUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
  }

  async sendMessage(to: string, message: string, messageType: string = 'text'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.businessNumber}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendFeeReminder(studentName: string, parentPhone: string, amount: number, dueDate: string): Promise<any> {
    const message = `🎓 *EduManage Pro Fee Reminder*

Dear Parent,

This is a friendly reminder that the fee payment for *${studentName}* is due.

📋 *Details:*
Amount: ₹${amount}
Due Date: ${dueDate}

💳 *Payment Options:*
- Online: Visit our payment portal
- Bank Transfer: Account details shared earlier
- Cash: Pay at school office

For any queries, please contact the school office.

Thank you for your cooperation.

*EduManage Pro School Management*`;

    return this.sendMessage(parentPhone, message, 'fee_reminder');
  }

  async sendAttendanceAlert(studentName: string, parentPhone: string, status: string, date: string): Promise<any> {
    const emoji = status === 'absent' ? '❌' : status === 'late' ? '⏰' : '✅';
    const message = `🎓 *EduManage Pro Attendance Update*

Dear Parent,

Attendance update for *${studentName}*:

📅 Date: ${date}
${emoji} Status: ${status.toUpperCase()}

${status === 'absent' ? 'Please ensure regular attendance for better academic performance.' : 
  status === 'late' ? 'Please ensure timely arrival to school.' : 
  'Thank you for ensuring regular attendance.'}

For any concerns, please contact the class teacher.

*EduManage Pro School Management*`;

    return this.sendMessage(parentPhone, message, 'attendance_alert');
  }

  async sendReportCard(studentName: string, parentPhone: string, reportUrl: string): Promise<any> {
    const message = `🎓 *EduManage Pro Report Card*

Dear Parent,

The report card for *${studentName}* is now available.

📊 *Download Report:*
${reportUrl}

The report includes:
✓ Subject-wise marks
✓ Overall performance
✓ Teacher comments
✓ Attendance summary

Please review and discuss with your child. For any queries, contact the class teacher.

*EduManage Pro School Management*`;

    return this.sendMessage(parentPhone, message, 'report_card');
  }

  async sendInvigilationDuty(teacherName: string, teacherPhone: string, examDetails: any): Promise<any> {
    const message = `🎓 *EduManage Pro Invigilation Duty*

Dear ${teacherName},

You have been assigned invigilation duty:

📋 *Exam Details:*
Subject: ${examDetails.subject}
Class: ${examDetails.class}
Date: ${examDetails.date}
Time: ${examDetails.startTime} - ${examDetails.endTime}
Room: ${examDetails.room}

Please be present 15 minutes before the exam starts.

For any changes or queries, contact the exam coordinator.

*EduManage Pro School Management*`;

    return this.sendMessage(teacherPhone, message, 'invigilation_duty');
  }

  async sendTimetableUpdate(recipientPhone: string, recipientName: string, changes: string): Promise<any> {
    const message = `🎓 *EduManage Pro Timetable Update*

Dear ${recipientName},

There has been an update to the timetable:

📅 *Changes:*
${changes}

Please check the updated timetable in the EduManage Pro system.

For any queries, contact the academic coordinator.

*EduManage Pro School Management*`;

    return this.sendMessage(recipientPhone, message, 'timetable_update');
  }

  async sendSubstitutionNotification(teacherName: string, teacherPhone: string, substitutionDetails: any): Promise<any> {
    const message = `🎓 *EduManage Pro Substitution Assignment*

Dear ${teacherName},

You have been assigned a substitution class:

📋 *Details:*
Class: ${substitutionDetails.class} ${substitutionDetails.section}
Subject: ${substitutionDetails.subject}
Period: ${substitutionDetails.period}
Date: ${substitutionDetails.date}
Absent Teacher: ${substitutionDetails.absentTeacher}

Please check your schedule and confirm availability.

*EduManage Pro School Management*`;

    return this.sendMessage(teacherPhone, message, 'substitution_notification');
  }

  async processWebhook(webhookData: any): Promise<void> {
    try {
      // Process incoming WhatsApp messages
      if (webhookData.entry && webhookData.entry[0] && webhookData.entry[0].changes) {
        const changes = webhookData.entry[0].changes[0];
        
        if (changes.value && changes.value.messages) {
          const message = changes.value.messages[0];
          const from = message.from;
          const text = message.text?.body || '';
          
          // Process the message with Vipu AI
          // This would integrate with the OpenAI service
          console.log(`Received WhatsApp message from ${from}: ${text}`);
          
          // Route to AI processing
          // await this.processAIQuery(from, text);
        }
      }
    } catch (error) {
      console.error('WhatsApp webhook processing error:', error);
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    
    return null;
  }
}

export const whatsappService = new WhatsAppService();
