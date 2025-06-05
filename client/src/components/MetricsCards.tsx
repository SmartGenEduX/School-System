import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Students",
      value: metrics?.totalStudents || 0,
      icon: "fas fa-users",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+3.2%",
      trendDirection: "up",
      description: "from last month"
    },
    {
      title: "Attendance Rate",
      value: `${metrics?.attendanceRate || '0.0'}%`,
      icon: "fas fa-check-circle",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "+1.8%",
      trendDirection: "up",
      description: "from last week"
    },
    {
      title: "Pending Tasks",
      value: metrics?.pendingTasks || 0,
      icon: "fas fa-exclamation-triangle",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      trend: "2",
      trendDirection: "down",
      description: "more than yesterday"
    },
    {
      title: "Fee Collection",
      value: `₹${((metrics?.feeCollection || 0) / 100000).toFixed(1)}L`,
      icon: "fas fa-chart-line",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "+12.5%",
      trendDirection: "up",
      description: "from last month"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <Card key={index} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-10 h-10 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                    <i className={`${metric.icon} ${metric.iconColor}`}></i>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="flex items-center space-x-1 text-sm">
                  <i className={`fas fa-arrow-${metric.trendDirection} ${
                    metric.trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}></i>
                  <span className={`font-medium ${
                    metric.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend}
                  </span>
                  <span className="text-gray-500">{metric.description}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
