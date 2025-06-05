import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  role?: string;
  lastSeen: Date;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Add authentication verification here if needed
        return true;
      }
    });

    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws, request) => {
      const clientId = this.generateClientId();
      
      const client: ClientConnection = {
        ws,
        lastSeen: new Date(),
      };

      this.clients.set(clientId, client);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(clientId, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
          this.sendToClient(clientId, {
            type: 'error',
            message: 'Invalid message format'
          });
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Client ${clientId} disconnected`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(clientId);
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        message: 'Connected to EduManage Pro WebSocket'
      });

      console.log(`Client ${clientId} connected`);
    });
  }

  private async handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastSeen = new Date();

    switch (message.type) {
      case 'authenticate':
        await this.handleAuthentication(clientId, message);
        break;
      
      case 'subscribe':
        await this.handleSubscription(clientId, message);
        break;
      
      case 'ping':
        this.sendToClient(clientId, { type: 'pong' });
        break;
      
      case 'dashboard_metrics_request':
        await this.sendDashboardMetrics(clientId);
        break;
      
      default:
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Unknown message type'
        });
    }
  }

  private async handleAuthentication(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // In a real implementation, verify the token/session
    const { userId, role } = message;
    
    client.userId = userId;
    client.role = role;

    this.sendToClient(clientId, {
      type: 'authenticated',
      userId,
      role
    });

    // Send initial dashboard data
    await this.sendDashboardMetrics(clientId);
  }

  private async handleSubscription(clientId: string, message: any) {
    const { channels } = message;
    
    // Store subscription preferences
    // In a real implementation, you'd track which channels each client is subscribed to
    
    this.sendToClient(clientId, {
      type: 'subscribed',
      channels
    });
  }

  private async sendDashboardMetrics(clientId: string) {
    try {
      const metrics = await storage.getDashboardMetrics();
      
      this.sendToClient(clientId, {
        type: 'dashboard_metrics',
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending dashboard metrics:', error);
    }
  }

  private sendToClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private startHeartbeat() {
    setInterval(() => {
      const now = new Date();
      const timeoutThreshold = 30 * 1000; // 30 seconds

      this.clients.forEach((client, clientId) => {
        if (now.getTime() - client.lastSeen.getTime() > timeoutThreshold) {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.ping();
          } else {
            this.clients.delete(clientId);
          }
        }
      });
    }, 15000); // Check every 15 seconds
  }

  // Broadcast methods for different types of notifications
  public broadcastAttendanceUpdate(data: any) {
    this.broadcast({
      type: 'attendance_update',
      data,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastFeeUpdate(data: any) {
    this.broadcast({
      type: 'fee_update',
      data,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastTimetableUpdate(data: any) {
    this.broadcast({
      type: 'timetable_update',
      data,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastInvigilationUpdate(data: any) {
    this.broadcast({
      type: 'invigilation_update',
      data,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastSubstitutionUpdate(data: any) {
    this.broadcast({
      type: 'substitution_update',
      data,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastBehaviorUpdate(data: any) {
    this.broadcast({
      type: 'behavior_update',
      data,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastWhatsAppUpdate(data: any) {
    this.broadcast({
      type: 'whatsapp_update',
      data,
      timestamp: new Date().toISOString()
    });
  }

  private broadcast(data: any, roleFilter?: string[]) {
    this.clients.forEach((client, clientId) => {
      if (roleFilter && client.role && !roleFilter.includes(client.role)) {
        return; // Skip clients not in the role filter
      }
      
      this.sendToClient(clientId, data);
    });
  }

  public broadcastToRole(data: any, roles: string[]) {
    this.broadcast(data, roles);
  }

  public sendToUser(userId: string, data: any) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId) {
        this.sendToClient(clientId, data);
      }
    });
  }
}

let wsService: WebSocketService | null = null;

export function setupWebSocket(server: Server): WebSocketService {
  wsService = new WebSocketService(server);
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}
