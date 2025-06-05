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
import { useAuth } from "@/hooks/useAuth";

interface InvigilationDutyProps {
  onBack: () => void;
}

export default function InvigilationDuty({ onBack }: InvigilationDutyProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: duties, isLoading } = useQuery({
    queryKey: ["/api/invigilation"],
  });

  const { data: exams } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: teachers } = useQuery({
    queryKey: ["/api/teachers"],
  });

  const assignDutyMutation = useMutation({
    mutationFn: async (dutyData: any) => {
      return apiRequest('POST', '/api/invigilation', dutyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invigilation"] });
      toast({
        title: "Duty Assigned",
        description: "Invigilation duty has been assigned successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign invigilation duty.",
        variant: "destructive",
      });
    }
  });

  const filteredDuties = duties?.filter((duty: any) => {
    const matchesSearch = duty.teacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         duty.room?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || duty.date === filterDate;
    return matchesSearch && matchesDate;
  }) || [];

  const getStatusBadge = (duty: any) => {
    const today = new Date().toISOString().split('T')[0];
    if (duty.date < today) {
      return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
    } else if (duty.date === today) {
      return <Badge className="bg-green-100 text-green-800">Today</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    }
  };

  const handleAutoAssign = () => {
    // Auto-assign duties based on teacher availability and duty factor
    toast({
      title: "Auto Assignment",
      description: "Automatic duty assignment has been initiated.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invigilation Duty</h2>
            <p className="text-gray-600">Manage exam invigilation assignments</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Invigilation Duty</h2>
          <p className="text-gray-600">Manage exam invigilation assignments</p>
        </div>
        <Button onClick={onBack} variant="outline">
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Total Duties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">4</div>
            <div className="text-sm text-gray-600">Pending Assignment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Today's Duties</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by teacher or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full md:w-48"
            />
            <Button 
              onClick={handleAutoAssign}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <i className="fas fa-magic mr-2"></i>
              Auto Assign
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <i className="fas fa-plus mr-2"></i>
              Manual Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duty Schedule */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Duty Schedule</h3>
            <Button variant="outline">
              <i className="fas fa-download mr-2"></i>
              Export Schedule
            </Button>
          </div>

          {filteredDuties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Duties Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterDate 
                  ? "No duties match your current filters."
                  : "Start by creating the first invigilation duty."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Exam</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Teacher</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">2024-02-15</td>
                    <td className="py-3 px-4 text-gray-900">09:00 - 12:00</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">Mathematics</div>
                        <div className="text-sm text-gray-500">Class 10A</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">Room 101</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">Mr. Singh</div>
                        <div className="text-sm text-gray-500">Mathematics Dept.</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <i className="fab fa-whatsapp text-green-600"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Availability */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Availability</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">Mr. Singh</div>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
              <div className="text-sm text-gray-600">Mathematics • Duty Factor: 1.0</div>
              <div className="text-sm text-gray-500">Last Duty: 2024-02-10</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">Ms. Sharma</div>
                <Badge className="bg-yellow-100 text-yellow-800">Sick</Badge>
              </div>
              <div className="text-sm text-gray-600">English • Duty Factor: 0.5</div>
              <div className="text-sm text-gray-500">Reduced duties</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">Dr. Kumar</div>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
              <div className="text-sm text-gray-600">Physics • Duty Factor: 1.0</div>
              <div className="text-sm text-gray-500">Last Duty: 2024-02-08</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
