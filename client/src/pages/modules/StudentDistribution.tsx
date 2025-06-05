import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentDistributionProps {
  onBack: () => void;
}

export default function StudentDistribution({ onBack }: StudentDistributionProps) {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [distributionMode, setDistributionMode] = useState<string>("HALF_ROLL_SPREAD");

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
  });

  // Sample distribution data
  const sampleDistribution = [
    {
      room: "Room 101",
      capacity: 40,
      assignments: [
        { class: "IX", section: "A", rollNumbers: "1-13", count: 13 },
        { class: "X", section: "A", rollNumbers: "1-15", count: 15 },
        { class: "IX", section: "B", rollNumbers: "1-12", count: 12 }
      ],
      totalCount: 40
    },
    {
      room: "Room 102", 
      capacity: 40,
      assignments: [
        { class: "IX", section: "A", rollNumbers: "14-26", count: 13 },
        { class: "X", section: "A", rollNumbers: "16-30", count: 15 },
        { class: "IX", section: "B", rollNumbers: "13-24", count: 12 }
      ],
      totalCount: 40
    },
    {
      room: "Library",
      capacity: 60,
      assignments: [
        { class: "IX", section: "A", rollNumbers: "27-38", count: 12 },
        { class: "X", section: "A", rollNumbers: "31-38", count: 8 },
        { class: "IX", section: "B", rollNumbers: "25-38", count: 14 },
        { class: "X", section: "B", rollNumbers: "1-26", count: 26 }
      ],
      totalCount: 60
    }
  ];

  const handleGenerateDistribution = () => {
    console.log("Generating student distribution...");
    // This would call the Google Apps Script functions
  };

  const handlePrintInvigilatorReference = () => {
    console.log("Printing invigilator reference...");
    window.print();
  };

  const handlePrintClassTeacherReference = () => {
    console.log("Printing class teacher reference...");
    // Generate class teacher view
  };

  const getClassColor = (className: string) => {
    const colors = {
      "IX": "bg-blue-100 text-blue-800",
      "X": "bg-green-100 text-green-800",
      "XI": "bg-purple-100 text-purple-800",
      "XII": "bg-orange-100 text-orange-800"
    };
    return colors[className as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (examsLoading || studentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Distribution</h2>
            <p className="text-gray-600">Manage exam seating arrangements</p>
          </div>
          <Button onClick={onBack} variant="outline">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </Button>
        </div>
        
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Distribution</h2>
          <p className="text-gray-600">Manage exam seating arrangements</p>
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
            <div className="text-2xl font-bold text-blue-600">248</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Available Rooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">320</div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">72</div>
            <div className="text-sm text-gray-600">Extra Seats</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose exam to distribute students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math-unit1">Mathematics - Unit Test 1</SelectItem>
                  <SelectItem value="science-mid">Science - Mid Term</SelectItem>
                  <SelectItem value="english-final">English - Final Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Distribution Mode</label>
              <Select value={distributionMode} onValueChange={setDistributionMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HALF_ROLL_SPREAD">Half Roll Spread</SelectItem>
                  <SelectItem value="GROUPS_OF_THREE">Groups of Three</SelectItem>
                  <SelectItem value="BALANCED">Balanced Distribution</SelectItem>
                  <SelectItem value="STRATIFIED">Stratified Mixing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateDistribution}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!selectedExam}
              >
                <i className="fas fa-magic mr-2"></i>
                Generate Distribution
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Results */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribution Results</h3>
            <div className="flex gap-2">
              <Button 
                onClick={handlePrintInvigilatorReference}
                variant="outline"
              >
                <i className="fas fa-print mr-2"></i>
                Invigilator Reference
              </Button>
              <Button 
                onClick={handlePrintClassTeacherReference}
                variant="outline"
              >
                <i className="fas fa-print mr-2"></i>
                Class Teacher Reference
              </Button>
              <Button variant="outline">
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
            </div>
          </div>

          {selectedExam ? (
            <div className="space-y-4">
              {sampleDistribution.map((room, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{room.room}</h4>
                      <p className="text-sm text-gray-600">
                        Capacity: {room.capacity} | Assigned: {room.totalCount} | 
                        Available: {room.capacity - room.totalCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{room.totalCount}/{room.capacity}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {room.assignments.map((assignment, assignIndex) => (
                      <div key={assignIndex} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getClassColor(assignment.class)}`}>
                            {assignment.class} {assignment.section}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{assignment.count} students</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Roll Numbers: {assignment.rollNumbers}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Room Utilization</span>
                      <span>{Math.round((room.totalCount / room.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(room.totalCount / room.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Distribution Generated</h3>
              <p className="text-gray-600">
                Select an exam and click "Generate Distribution" to create seating arrangements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Mixing Strategy</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="strategy" value="STRATIFIED" className="mr-2" />
                  <span className="text-sm">Stratified (IX & X classes mixed)</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="strategy" value="BY_CLASS" className="mr-2" />
                  <span className="text-sm">By Class (Same class together)</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="strategy" value="RANDOM" className="mr-2" />
                  <span className="text-sm">Random Distribution</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Advanced Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Leave gaps between sections</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Maintain roll number sequence</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Auto-generate seating chart</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
