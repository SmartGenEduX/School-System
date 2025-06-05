import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface BehaviorTrackerProps {
  onBack: () => void;
}

interface BehaviorRecord {
  id: number;
  studentId: number;
  teacherId: string;
  type: string;
  category: string;
  description: string;
  severity: string;
  actionTaken: string;
  parentNotified: boolean;
  followUpRequired: boolean;
  date: string;
  createdAt: string;
  student?: {
    firstName: string;
    lastName: string;
    class: string;
    section: string;
    rollNumber: number;
  };
}

export default function BehaviorTracker({ onBack }: BehaviorTrackerProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedRecordForAnalysis, setSelectedRecordForAnalysis] = useState<number | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for new behavior record
  const [formData, setFormData] = useState({
    studentId: "",
    type: "",
    category: "",
    description: "",
    severity: "",
    actionTaken: "",
    parentNotified: false,
    followUpRequired: false,
    date: new Date().toISOString().split('T')[0]
  });

  const { data: behaviorRecords, isLoading } = useQuery({
    queryKey: ["/api/behavior"],
  });

  const { data: students } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: aiAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/ai/analyze-behavior", selectedRecordForAnalysis],
    enabled: !!selectedRecordForAnalysis,
  });

  const createBehaviorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/behavior', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/behavior"] });
      setIsCreateModalOpen(false);
      setFormData({
        studentId: "",
        type: "",
        category: "",
        description: "",
        severity: "",
        actionTaken: "",
        parentNotified: false,
        followUpRequired: false,
        date: new Date().toISOString().split('T')[0]
      });
      toast({
        title: "Record Created",
        description: "Behavior record has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create behavior record.",
        variant: "destructive",
      });
    }
  });

  const filteredRecords = behaviorRecords?.filter((record: BehaviorRecord) => {
    const studentName = `${record.student?.firstName} ${record.student?.lastName}`.toLowerCase();
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || record.type === filterType;
    const matchesSeverity = filterSeverity === "all" || record.severity === filterSeverity;
    const matchesStudent = !selectedStudent || record.studentId.toString() === selectedStudent;
    
    return matchesSearch && matchesType && matchesSeverity && matchesStudent;
  }) || [];

  const getTypeBadge = (type: string) => {
    const variants = {
      positive: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      disciplinary: "bg-red-100 text-red-800"
    };
    return variants[type as keyof typeof variants] || variants.warning;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return variants[severity as keyof typeof variants] || variants.low;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      positive: "fas fa-thumbs-up text-green-600",
      warning: "fas fa-exclamation-triangle text-yellow-600",
      disciplinary: "fas fa-ban text-red-600"
    };
    return icons[type as keyof typeof icons] || icons.warning;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.type || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createBehaviorMutation.mutate({
      ...formData,
      studentId: parseInt(formData.studentId)
    });
  };

  const handleAnalyzeBehavior = (studentId: number) => {
    setSelectedRecordForAnalysis(studentId);
    setIsAnalysisModalOpen(true);
  };

  const calculateStats = () => {
    const total = filteredRecords.length;
    const positive = filteredRecords.filter((r: BehaviorRecord) => r.type === "positive").length;
    const warnings = filteredRecords.filter((r: BehaviorRecord) => r.type === "warning").length;
    const disciplinary = filteredRecords.filter((r: BehaviorRecord) => r.type === "disciplinary").length;
    const followUpNeeded = filteredRecords.filter((r: BehaviorRecord) => r.followUpRequired).length;
    
    return { total, positive, warnings, disciplinary, followUpNeeded };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Behavior Tracker</h2>
            <p className="text-gray-600">Monitor and manage student behavior records</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Behavior Tracker</h2>
          <p className="text-gray-600">Monitor and manage student behavior records</p>
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
            <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
            <div className="text-sm text-gray-600">Positive Notes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
            <div className="text-sm text-gray-600">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.disciplinary}</div>
            <div className="text-sm text-gray-600">Disciplinary</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.followUpNeeded}</div>
            <div className="text-sm text-gray-600">Follow-up Needed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by student name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Students</SelectItem>
                {students?.map((student: any) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.firstName} {student.lastName} ({student.class} {student.section})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="disciplinary">Disciplinary</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                  <i className="fas fa-plus mr-2"></i>
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Behavior Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                      <Select value={formData.studentId} onValueChange={(value) => setFormData({...formData, studentId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students?.map((student: any) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.firstName} {student.lastName} ({student.class} {student.section})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="disciplinary">Disciplinary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="behavior">Behavior</SelectItem>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="participation">Participation</SelectItem>
                          <SelectItem value="discipline">Discipline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the behavior incident or positive note..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                    <Textarea
                      value={formData.actionTaken}
                      onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
                      placeholder="Describe any actions taken or interventions applied..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="parentNotified"
                        checked={formData.parentNotified}
                        onChange={(e) => setFormData({...formData, parentNotified: e.target.checked})}
                      />
                      <label htmlFor="parentNotified" className="text-sm text-gray-700">Parent Notified</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="followUpRequired"
                        checked={formData.followUpRequired}
                        onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                      />
                      <label htmlFor="followUpRequired" className="text-sm text-gray-700">Follow-up Required</label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBehaviorMutation.isPending}>
                      {createBehaviorMutation.isPending ? "Creating..." : "Create Record"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Records */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Behavior Records</h3>
            <Button variant="outline">
              <i className="fas fa-download mr-2"></i>
              Export Records
            </Button>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clipboard-list text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== "all" || filterSeverity !== "all" || selectedStudent
                  ? "No behavior records match your current filters."
                  : "Start by creating the first behavior record."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record: BehaviorRecord) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <i className={getTypeIcon(record.type)}></i>
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.student?.firstName} {record.student?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Class {record.student?.class} {record.student?.section} • Roll No: {record.student?.rollNumber}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getTypeBadge(record.type)}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </Badge>
                          {record.severity && (
                            <Badge className={getSeverityBadge(record.severity)}>
                              {record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                            </Badge>
                          )}
                          {record.followUpRequired && (
                            <Badge className="bg-purple-100 text-purple-800">Follow-up Required</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-gray-900 mb-1">{record.description}</p>
                        {record.actionTaken && (
                          <p className="text-sm text-gray-600">
                            <strong>Action Taken:</strong> {record.actionTaken}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                          {record.category && <span>Category: {record.category}</span>}
                          {record.parentNotified && <span className="text-green-600">✓ Parent Notified</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyzeBehavior(record.studentId)}
                      >
                        <i className="fas fa-chart-line mr-1"></i>
                        Analyze
                      </Button>
                      <Button size="sm" variant="ghost">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI Behavior Pattern Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Analyzing behavior patterns...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Overall Analysis</h4>
                  <p className="text-gray-700">{aiAnalysis.analysis}</p>
                </div>
                
                {aiAnalysis.patterns && aiAnalysis.patterns.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Identified Patterns</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {aiAnalysis.patterns.map((pattern: string, index: number) => (
                        <li key={index} className="text-gray-700">{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {aiAnalysis.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="text-gray-700">{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiAnalysis.riskLevel && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Risk Assessment</h4>
                    <Badge className={
                      aiAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      aiAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {aiAnalysis.riskLevel.charAt(0).toUpperCase() + aiAnalysis.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No analysis available for this student.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
