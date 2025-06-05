import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricsCards from "@/components/MetricsCards";
import ModuleCards from "@/components/ModuleCards";
import QuickActions from "@/components/QuickActions";
import RecentActivity from "@/components/RecentActivity";
import VipuAI from "@/components/VipuAI";

// Module components
import ReportTracker from "@/pages/modules/ReportTracker";
import FeeManagement from "@/pages/modules/FeeManagement";
import Timetable from "@/pages/modules/Timetable";
import InvigilationDuty from "@/pages/modules/InvigilationDuty";
import StudentDistribution from "@/pages/modules/StudentDistribution";
import Attendance from "@/pages/modules/Attendance";
import BehaviorTracker from "@/pages/modules/BehaviorTracker";
import QuestionPaper from "@/pages/modules/QuestionPaper";

export default function Dashboard() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [isVipuAIOpen, setIsVipuAIOpen] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Extract module from URL
  useEffect(() => {
    const pathParts = location.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'dashboard') {
      setCurrentModule(pathParts[2]);
    } else {
      setCurrentModule(null);
    }
  }, [location]);

  // Setup WebSocket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        // Authenticate the connection
        ws.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id,
          role: user.role
        }));
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [isAuthenticated, user]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'dashboard_metrics':
        // Update dashboard metrics in real-time
        console.log('Dashboard metrics updated:', data.data);
        break;
      
      case 'attendance_update':
        toast({
          title: "Attendance Updated",
          description: "New attendance record has been marked.",
          variant: "default",
        });
        break;
      
      case 'fee_update':
        toast({
          title: "Fee Payment Received",
          description: "A new fee payment has been processed.",
          variant: "default",
        });
        break;
      
      case 'timetable_update':
        toast({
          title: "Timetable Updated",
          description: "The timetable has been modified.",
          variant: "default",
        });
        break;
      
      case 'invigilation_update':
        toast({
          title: "Invigilation Duty Assigned",
          description: "A new invigilation duty has been assigned.",
          variant: "default",
        });
        break;
      
      case 'substitution_update':
        toast({
          title: "Substitution Assigned",
          description: "A new substitution has been scheduled.",
          variant: "default",
        });
        break;
      
      case 'behavior_update':
        toast({
          title: "Behavior Record Added",
          description: "A new behavior record has been created.",
          variant: "default",
        });
        break;
      
      default:
        console.log('Unknown WebSocket message:', data);
    }
  };

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleModuleSelect = (module: string) => {
    setCurrentModule(module);
    // Update URL without page reload
    window.history.pushState(null, '', `/dashboard/${module.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleBackToDashboard = () => {
    setCurrentModule(null);
    window.history.pushState(null, '', '/dashboard');
  };

  const renderModuleContent = () => {
    if (!currentModule) {
      return (
        <>
          <MetricsCards />
          <ModuleCards onModuleSelect={handleModuleSelect} />
          <QuickActions onOpenVipuAI={() => setIsVipuAIOpen(true)} />
          <RecentActivity />
        </>
      );
    }

    // Render specific module based on currentModule
    switch (currentModule.toLowerCase().replace(/-/g, '')) {
      case 'reporttracker':
        return <ReportTracker onBack={handleBackToDashboard} />;
      case 'feemanagement':
        return <FeeManagement onBack={handleBackToDashboard} />;
      case 'timetable':
        return <Timetable onBack={handleBackToDashboard} />;
      case 'invigilationduty':
        return <InvigilationDuty onBack={handleBackToDashboard} />;
      case 'studentdistribution':
        return <StudentDistribution onBack={handleBackToDashboard} />;
      case 'attendance':
        return <Attendance onBack={handleBackToDashboard} />;
      case 'behaviortracker':
        return <BehaviorTracker onBack={handleBackToDashboard} />;
      case 'questionpaper':
        return <QuestionPaper onBack={handleBackToDashboard} />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Module Not Found</h2>
            <p className="text-gray-600 mb-6">The requested module is not available or you don't have access to it.</p>
            <button 
              onClick={handleBackToDashboard}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        currentModule={currentModule} 
        onModuleSelect={handleModuleSelect}
        userRole={user?.role || 'teacher'}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          currentModule={currentModule}
          onBackToDashboard={handleBackToDashboard}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {!currentModule && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName || 'User'}!
              </h2>
              <p className="text-gray-600">Here's what's happening in your school today.</p>
            </div>
          )}
          
          {renderModuleContent()}
        </main>
      </div>

      {/* Floating Vipu AI Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsVipuAIOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center relative"
        >
          <i className="fas fa-comments text-xl"></i>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            AI
          </div>
        </button>
      </div>

      {/* Vipu AI Modal */}
      {isVipuAIOpen && (
        <VipuAI
          isOpen={isVipuAIOpen}
          onClose={() => setIsVipuAIOpen(false)}
          userId={user?.id}
        />
      )}
    </div>
  );
}
