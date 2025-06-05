import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconColor: string;
}

export default function RecentActivity() {
  // In a real implementation, this would fetch from an API endpoint
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities/recent"],
    queryFn: () => {
      // Mock data for demonstration - replace with actual API call
      return Promise.resolve([
        {
          id: "1",
          type: "student_admission",
          title: "New student admission: Priya Sharma (Class 9A)",
          description: "Student ID: STU1249 | Fee payment: Completed",
          time: "2 hours ago",
          icon: "fas fa-user-graduate",
          iconColor: "bg-blue-100 text-blue-600"
        },
        {
          id: "2", 
          type: "fee_payment",
          title: "Fee payment received: ₹25,000 from Class 10B",
          description: "15 students | WhatsApp receipts sent automatically",
          time: "4 hours ago",
          icon: "fas fa-money-bill-wave",
          iconColor: "bg-green-100 text-green-600"
        },
        {
          id: "3",
          type: "substitution",
          title: "Teacher substitution needed: Period 5, Math Class 11A", 
          description: "Mr. Raj Kumar absent | Auto-assigned to Ms. Priya Singh",
          time: "6 hours ago",
          icon: "fas fa-exclamation-triangle",
          iconColor: "bg-yellow-100 text-yellow-600"
        },
        {
          id: "4",
          type: "ai_queries",
          title: "Vipu AI: 23 parent queries resolved automatically",
          description: "Fee inquiries, attendance reports, exam schedules",
          time: "1 day ago",
          icon: "fas fa-robot",
          iconColor: "bg-purple-100 text-purple-600"
        }
      ]);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleViewAll = () => {
    console.log("Opening complete activity log...");
    // This would typically navigate to a full activity log page
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-start space-x-4 p-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Button 
          variant="ghost"
          onClick={handleViewAll}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clock text-gray-400 text-xl"></i>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h4>
            <p className="text-gray-600">When activities occur, they will appear here.</p>
          </div>
        ) : (
          activities?.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 ${activity.iconColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={activity.icon}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-medium">{activity.title}</p>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
