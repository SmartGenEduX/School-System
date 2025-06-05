import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ModuleHeader } from "@/components/ModuleHeader";

interface AttendanceProps {
  onBack: () => void;
}

export default function Attendance({ onBack }: AttendanceProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>("10A");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["/api/attendance", { date: selectedDate, class: selectedClass }],
  });

  const { data: students } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ["/api/attendance/stats"],
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecord: any) => {
      return apiRequest('POST', '/api/attendance', attendanceRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/stats"] });
      toast({
        title: "Attendance Marked",
        description: "Attendance has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark attendance.",
        variant: "destructive",
      });
    }
  });

  // Sample student data for the selected class
  const classStudents = [
    { id: 1, rollNumber: 1, firstName: "Aarav", lastName: "Sharma", status: "present" },
    { id: 2, rollNumber: 2, firstName: "Vivaan", lastName: "Kumar", status: "present" },
    { id: 3, rollNumber: 3, firstName: "Aditya", lastName: "Singh", status: "absent" },
    { id: 4, rollNumber: 4, firstName: "Vihaan", lastName: "Patel", status: "present" },
    { id: 5, rollNumber: 5, firstName: "Arjun", lastName: "Gupta", status: "late" },
    { id: 6, rollNumber: 6, firstName: "Sai", lastName: "Verma", status: "present" },
    { id: 7, rollNumber: 7, firstName: "Reyansh", lastName: "Agarwal", status: "present" },
    { id: 8, rollNumber: 8, firstName: "Ayaan", lastName: "Joshi", status: "excused" },
  ];

  const filteredStudents = classStudents.filter(student => 
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toString().includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      excused: "bg-blue-100 text-blue-800"
    };
    return variants[status as keyof typeof variants] || variants.absent;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      present: "fas fa-check-circle text-green-600",
      absent: "fas fa-times-circle text-red-600", 
      late: "fas fa-clock text-yellow-600",
      excused: "fas fa-info-circle text-blue-600"
    };
    return icons[status as keyof typeof icons] || icons.absent;
  };

  const handleStatusChange = (studentId: number, status: string) => {
    const attendanceRecord = {
      studentId,
      date: selectedDate,
      status,
    };
    
    markAttendanceMutation.mutate(attendanceRecord);
  };

  const handleBulkAction = (action: string) => {
    if (action === "mark_all_present") {
      filteredStudents.forEach(student => {
        if (student.status !== "present") {
          handleStatusChange(student.id, "present");
        }
      });
    }
  };

  const calculateStats = () => {
    const total = filteredStudents.length;
    const present = filteredStudents.filter(s => s.status === "present").length;
    const absent = filteredStudents.filter(s => s.status === "absent").length;
    const late = filteredStudents.filter(s => s.status === "late").length;
    const excused = filteredStudents.filter(s => s.status === "excused").length;
    
    return { total, present, absent, late, excused, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
            <p className="text-gray-600">Mark and track student attendance</p>
          </div>
          <Button onClick={onBack} variant="outline">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Mark and track student attendance</p>
        </div>
        <Button onClick={onBack} variant="outline">
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-gray-600">Present</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-sm text-gray-600">Late</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.rate}%</div>
            <div className="text-sm text-gray-600">Attendance Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-48"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9A">9A</SelectItem>
                  <SelectItem value="9B">9B</SelectItem>
                  <SelectItem value="10A">10A</SelectItem>
                  <SelectItem value="10B">10B</SelectItem>
                  <SelectItem value="11A">11A</SelectItem>
                  <SelectItem value="11B">11B</SelectItem>
                  <SelectItem value="12A">12A</SelectItem>
                  <SelectItem value="12B">12B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 items-end">
              <Button 
                onClick={() => handleBulkAction("mark_all_present")}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <i className="fas fa-check-double mr-2"></i>
                Mark All Present
              </Button>
              <Button variant="outline">
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Class {selectedClass} - {new Date(selectedDate).toLocaleDateString()}
            </h3>
            <div className="text-sm text-gray-600">
              {stats.present}/{stats.total} students present
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-clock text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "No students match your search criteria."
                  : "No students found for this class."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-medium text-blue-600">{student.rollNumber}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">Roll No: {student.rollNumber}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <i className={getStatusIcon(student.status)}></i>
                    <Badge className={getStatusBadge(student.status)}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant={student.status === "present" ? "default" : "outline"}
                        onClick={() => handleStatusChange(student.id, "present")}
                        className="w-8 h-8 p-0"
                      >
                        <i className="fas fa-check text-xs"></i>
                      </Button>
                      <Button
                        size="sm" 
                        variant={student.status === "absent" ? "default" : "outline"}
                        onClick={() => handleStatusChange(student.id, "absent")}
                        className="w-8 h-8 p-0"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant={student.status === "late" ? "default" : "outline"}
                        onClick={() => handleStatusChange(student.id, "late")}
                        className="w-8 h-8 p-0"
                      >
                        <i className="fas fa-clock text-xs"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant={student.status === "excused" ? "default" : "outline"}
                        onClick={() => handleStatusChange(student.id, "excused")}
                        className="w-8 h-8 p-0"
                      >
                        <i className="fas fa-info text-xs"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
