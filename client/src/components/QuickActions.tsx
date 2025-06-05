import { Card, CardContent } from "@/components/ui/card";

interface QuickActionsProps {
  onOpenVipuAI: () => void;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export default function QuickActions({ onOpenVipuAI }: QuickActionsProps) {
  const handleWhatsAppAlert = () => {
    // Open WhatsApp integration modal or functionality
    console.log("Opening WhatsApp integration...");
    // This would typically open a modal to send bulk WhatsApp notifications
  };

  const handlePowerBIAnalytics = () => {
    // Open PowerBI analytics dashboard
    console.log("Opening PowerBI analytics...");
    // This would typically redirect to PowerBI dashboard or open embedded analytics
    window.open('/api/analytics/export', '_blank');
  };

  const handleGenerateExamPaper = () => {
    // Open AI-powered exam paper generation
    console.log("Opening exam paper generation...");
    // This would typically open a form to generate AI-powered question papers
  };

  const quickActions: QuickAction[] = [
    {
      title: "Send WhatsApp Alert",
      description: "Notify parents instantly",
      icon: "fab fa-whatsapp",
      color: "bg-blue-50 hover:bg-blue-100",
      action: handleWhatsAppAlert
    },
    {
      title: "PowerBI Analytics",
      description: "View detailed reports",
      icon: "fas fa-chart-bar",
      color: "bg-green-50 hover:bg-green-100",
      action: handlePowerBIAnalytics
    },
    {
      title: "Vipu AI Assistant",
      description: "Ask questions & get help",
      icon: "fas fa-robot",
      color: "bg-purple-50 hover:bg-purple-100",
      action: onOpenVipuAI
    },
    {
      title: "Generate Exam Paper",
      description: "AI-powered question papers",
      icon: "fas fa-file-alt",
      color: "bg-orange-50 hover:bg-orange-100",
      action: handleGenerateExamPaper
    }
  ];

  const getIconColor = (index: number): string => {
    const colors = [
      "bg-blue-500 text-white",
      "bg-green-500 text-white", 
      "bg-purple-500 text-white",
      "bg-orange-500 text-white"
    ];
    return colors[index] || "bg-gray-500 text-white";
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`flex items-center space-x-3 p-4 ${action.color} rounded-lg transition-colors text-left w-full`}
          >
            <div className={`w-10 h-10 ${getIconColor(index)} rounded-lg flex items-center justify-center`}>
              <i className={action.icon}></i>
            </div>
            <div>
              <div className="font-medium text-gray-900">{action.title}</div>
              <div className="text-sm text-gray-600">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
