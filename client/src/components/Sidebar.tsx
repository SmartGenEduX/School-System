import { cn } from "@/lib/utils";

interface SidebarProps {
  currentModule: string | null;
  onModuleSelect: (module: string) => void;
  userRole: string;
}

interface MenuItem {
  name: string;
  icon: string;
  key: string;
  roles: string[];
}

const MENU_SECTIONS = {
  MAIN: [
    { name: "Dashboard", icon: "fas fa-chart-line", key: "dashboard", roles: ["admin", "principal", "vice_principal", "teacher", "class_teacher"] },
    { name: "Report Tracker", icon: "fas fa-chart-bar", key: "report-tracker", roles: ["admin", "principal", "vice_principal", "teacher", "class_teacher"] },
    { name: "Fee Management", icon: "fas fa-money-bill-wave", key: "fee-management", roles: ["admin", "principal", "vice_principal"] },
    { name: "Timetable", icon: "fas fa-calendar-alt", key: "timetable", roles: ["admin", "principal", "vice_principal", "teacher", "class_teacher"] },
    { name: "Substitution Log", icon: "fas fa-user-check", key: "substitution-log", roles: ["admin", "principal", "vice_principal"] },
    { name: "Invigilation Duty", icon: "fas fa-shield-alt", key: "invigilation-duty", roles: ["admin", "principal", "vice_principal", "teacher"] },
  ],
  STUDENTS: [
    { name: "Student Distribution", icon: "fas fa-users", key: "student-distribution", roles: ["admin", "principal", "vice_principal", "class_teacher"] },
    { name: "Behavior Tracker", icon: "fas fa-clipboard-list", key: "behavior-tracker", roles: ["admin", "principal", "vice_principal", "teacher", "class_teacher"] },
    { name: "Attendance", icon: "fas fa-user-clock", key: "attendance", roles: ["admin", "principal", "vice_principal", "teacher", "class_teacher"] },
  ],
  ACADEMIC: [
    { name: "Question Paper", icon: "fas fa-file-alt", key: "question-paper", roles: ["admin", "principal", "vice_principal", "teacher"] },
    { name: "AI Smart Modules", icon: "fas fa-robot", key: "ai-smart-modules", roles: ["admin", "principal", "vice_principal"] },
    { name: "Settings", icon: "fas fa-cog", key: "settings", roles: ["admin", "principal"] },
  ],
};

export default function Sidebar({ currentModule, onModuleSelect, userRole }: SidebarProps) {
  const hasAccess = (item: MenuItem) => {
    return item.roles.includes(userRole);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.key === "dashboard") {
      onModuleSelect(""); // Go back to main dashboard
    } else {
      onModuleSelect(item.key);
    }
  };

  const isActive = (item: MenuItem) => {
    if (item.key === "dashboard") {
      return currentModule === null;
    }
    return currentModule === item.key;
  };

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    const accessibleItems = items.filter(hasAccess);
    
    if (accessibleItems.length === 0) {
      return null;
    }

    return (
      <div key={title}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {title}
        </p>
        <ul className="space-y-2">
          {accessibleItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                  isActive(item)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <i className={`${item.icon} w-5 h-5`}></i>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-lg"></i>
          </div>
          <span className="text-xl font-bold">EduManage Pro</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {renderMenuSection("MAIN", MENU_SECTIONS.MAIN)}
        {renderMenuSection("STUDENTS", MENU_SECTIONS.STUDENTS)}
        {renderMenuSection("ACADEMIC", MENU_SECTIONS.ACADEMIC)}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="text-xs text-gray-400 text-center">
          <p>SmartGenEduX</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
