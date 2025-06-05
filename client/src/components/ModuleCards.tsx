import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModuleCardsProps {
  onModuleSelect: (module: string) => void;
}

interface ModuleCard {
  title: string;
  icon: string;
  color: string;
  key: string;
  stats: {
    primary: { label: string; value: string | number };
    secondary: { label: string; value: string | number };
    progress?: { label: string; percentage: number; dueText: string };
  };
  buttonText: string;
  buttonAction: string;
}

export default function ModuleCards({ onModuleSelect }: ModuleCardsProps) {
  const moduleCards: ModuleCard[] = [
    {
      title: "Report Tracker",
      icon: "fas fa-chart-bar",
      color: "module-card-blue",
      key: "report-tracker",
      stats: {
        primary: { label: "Term Reports Due", value: 24 },
        secondary: { label: "Reports Completed", value: 18 },
        progress: { label: "75% Complete", percentage: 75, dueText: "Due in 3 days" }
      },
      buttonText: "View Reports",
      buttonAction: "handleViewReports"
    },
    {
      title: "Fee Management",
      icon: "fas fa-money-bill-wave",
      color: "module-card-green",
      key: "fee-management",
      stats: {
        primary: { label: "Total Fees Collected", value: "₹4,25,000" },
        secondary: { label: "Pending Fees", value: "₹1,75,000" },
        progress: { label: "70% Collected", percentage: 70, dueText: "42 students pending" }
      },
      buttonText: "Manage Fees",
      buttonAction: "handleManageFees"
    },
    {
      title: "Timetable",
      icon: "fas fa-calendar-alt",
      color: "module-card-purple",
      key: "timetable",
      stats: {
        primary: { label: "Current Schedule", value: "Active" },
        secondary: { label: "Last Updated", value: "2 days ago" },
        progress: { label: "Conflicts", percentage: 0, dueText: "3" }
      },
      buttonText: "View Timetable",
      buttonAction: "handleViewTimetable"
    },
    {
      title: "Substitution Log",
      icon: "fas fa-user-check",
      color: "module-card-orange",
      key: "substitution-log",
      stats: {
        primary: { label: "Today's Substitutions", value: 4 },
        secondary: { label: "Available Teachers", value: 12 }
      },
      buttonText: "View All Substitutions",
      buttonAction: "handleSubstitutionLog"
    },
    {
      title: "Attendance",
      icon: "fas fa-user-clock",
      color: "module-card-red",
      key: "attendance",
      stats: {
        primary: { label: "Today's Attendance", value: "94.2%" },
        secondary: { label: "Present", value: "1,175" }
      },
      buttonText: "Mark Attendance",
      buttonAction: "handleAttendance"
    },
    {
      title: "Behavior Tracker",
      icon: "fas fa-clipboard-list",
      color: "module-card-indigo",
      key: "behavior-tracker",
      stats: {
        primary: { label: "Incidents Today", value: 3 },
        secondary: { label: "Positive Notes", value: 12 }
      },
      buttonText: "View Records",
      buttonAction: "handleBehaviorTracker"
    }
  ];

  const handleModuleClick = (moduleKey: string) => {
    onModuleSelect(moduleKey);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {moduleCards.map((module) => (
        <Card key={module.key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className={`${module.color} p-4`}>
            <div className="flex items-center justify-between text-white">
              <h3 className="text-lg font-semibold">{module.title}</h3>
              <button className="text-white hover:text-gray-200 transition-colors">
                <i className="fas fa-ellipsis-h"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Primary Stat */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{module.stats.primary.label}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {module.stats.primary.value}
                </span>
              </div>

              {/* Secondary Stat */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{module.stats.secondary.label}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {module.stats.secondary.value}
                </span>
              </div>

              {/* Progress Bar (if applicable) */}
              {module.stats.progress && (
                <div className="pt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{module.stats.progress.label}</span>
                    <span>{module.stats.progress.dueText}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${module.color}`}
                      style={{ width: `${module.stats.progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={() => handleModuleClick(module.key)}
                className={`w-full ${module.color} text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
              >
                {module.buttonText}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
