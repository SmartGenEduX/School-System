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

interface QuestionPaperProps {
  onBack: () => void;
}

interface QuestionPaper {
  id: number;
  title: string;
  subject: string;
  class: string;
  examType: string;
  duration: number;
  maxMarks: number;
  instructions: string;
  questions: any;
  createdBy: string;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
}

export default function QuestionPaper({ onBack }: QuestionPaperProps) {
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterExamType, setFilterExamType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for manual question paper creation
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    class: "",
    examType: "",
    duration: 180,
    maxMarks: 100,
    instructions: "",
    tags: ""
  });

  // Form state for AI generation
  const [aiFormData, setAiFormData] = useState({
    subject: "",
    className: "",
    examType: "",
    duration: 180,
    topics: "",
    difficulty: "medium",
    questionTypes: "mixed"
  });

  const { data: questionPapers, isLoading } = useQuery({
    queryKey: ["/api/question-papers"],
  });

  const createPaperMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/question-papers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-papers"] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Question Paper Created",
        description: "Question paper has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create question paper.",
        variant: "destructive",
      });
    }
  });

  const generateAIPaperMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/ai/generate-question-paper', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-papers"] });
      setIsAIGenerateModalOpen(false);
      resetAiForm();
      toast({
        title: "AI Paper Generated",
        description: "Question paper has been generated using AI.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI question paper.",
        variant: "destructive",
      });
    }
  });

  const filteredPapers = questionPapers?.filter((paper: QuestionPaper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || paper.subject === filterSubject;
    const matchesClass = filterClass === "all" || paper.class === filterClass;
    const matchesExamType = filterExamType === "all" || paper.examType === filterExamType;
    
    return matchesSearch && matchesSubject && matchesClass && matchesExamType;
  }) || [];

  const getStatusBadge = (paper: QuestionPaper) => {
    if (paper.isPublished) {
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
  };

  const getExamTypeBadge = (examType: string) => {
    const variants = {
      "unit_test": "bg-blue-100 text-blue-800",
      "mid_term": "bg-purple-100 text-purple-800",
      "final": "bg-orange-100 text-orange-800",
      "practice": "bg-gray-100 text-gray-800"
    };
    return variants[examType as keyof typeof variants] || variants.practice;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      class: "",
      examType: "",
      duration: 180,
      maxMarks: 100,
      instructions: "",
      tags: ""
    });
  };

  const resetAiForm = () => {
    setAiFormData({
      subject: "",
      className: "",
      examType: "",
      duration: 180,
      topics: "",
      difficulty: "medium",
      questionTypes: "mixed"
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subject || !formData.class) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPaperMutation.mutate({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      questions: { sections: [] } // Empty structure for manual creation
    });
  };

  const handleAIGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFormData.subject || !aiFormData.className || !aiFormData.examType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    generateAIPaperMutation.mutate(aiFormData);
  };

  const handleViewPaper = (paper: QuestionPaper) => {
    setSelectedPaper(paper);
    setIsViewModalOpen(true);
  };

  const calculateStats = () => {
    const total = filteredPapers.length;
    const published = filteredPapers.filter((p: QuestionPaper) => p.isPublished).length;
    const drafts = total - published;
    const subjects = new Set(filteredPapers.map((p: QuestionPaper) => p.subject)).size;
    
    return { total, published, drafts, subjects };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Question Paper Management</h2>
            <p className="text-gray-600">Create and manage examination question papers</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Question Paper Management</h2>
          <p className="text-gray-600">Create and manage examination question papers</p>
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
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Papers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.drafts}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.subjects}</div>
            <div className="text-sm text-gray-600">Subjects</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Geography">Geography</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="9">Class 9</SelectItem>
                <SelectItem value="10">Class 10</SelectItem>
                <SelectItem value="11">Class 11</SelectItem>
                <SelectItem value="12">Class 12</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterExamType} onValueChange={setFilterExamType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="unit_test">Unit Test</SelectItem>
                <SelectItem value="mid_term">Mid Term</SelectItem>
                <SelectItem value="final">Final Exam</SelectItem>
                <SelectItem value="practice">Practice</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Dialog open={isAIGenerateModalOpen} onOpenChange={setIsAIGenerateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    <i className="fas fa-robot mr-2"></i>
                    AI Generate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Generate Question Paper with AI</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAIGenerateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                        <Select value={aiFormData.subject} onValueChange={(value) => setAiFormData({...aiFormData, subject: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Geography">Geography</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                        <Select value={aiFormData.className} onValueChange={(value) => setAiFormData({...aiFormData, className: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">Class 9</SelectItem>
                            <SelectItem value="10">Class 10</SelectItem>
                            <SelectItem value="11">Class 11</SelectItem>
                            <SelectItem value="12">Class 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
                        <Select value={aiFormData.examType} onValueChange={(value) => setAiFormData({...aiFormData, examType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unit_test">Unit Test</SelectItem>
                            <SelectItem value="mid_term">Mid Term</SelectItem>
                            <SelectItem value="final">Final Exam</SelectItem>
                            <SelectItem value="practice">Practice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={aiFormData.duration}
                          onChange={(e) => setAiFormData({...aiFormData, duration: parseInt(e.target.value)})}
                          min="30"
                          max="300"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                        <Select value={aiFormData.difficulty} onValueChange={(value) => setAiFormData({...aiFormData, difficulty: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Types</label>
                        <Select value={aiFormData.questionTypes} onValueChange={(value) => setAiFormData({...aiFormData, questionTypes: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed">Mixed (MCQ + Short + Long)</SelectItem>
                            <SelectItem value="objective">Only Objective (MCQ)</SelectItem>
                            <SelectItem value="subjective">Only Subjective</SelectItem>
                            <SelectItem value="short_answers">Short Answers Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topics to Cover</label>
                      <Textarea
                        value={aiFormData.topics}
                        onChange={(e) => setAiFormData({...aiFormData, topics: e.target.value})}
                        placeholder="Enter specific topics or chapters to include (optional)..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAIGenerateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={generateAIPaperMutation.isPending}>
                        {generateAIPaperMutation.isPending ? "Generating..." : "Generate with AI"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <i className="fas fa-plus mr-2"></i>
                    Create Manual
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Question Paper Manually</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Mathematics Unit Test 1 - Class 10"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                        <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Geography">Geography</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                        <Select value={formData.class} onValueChange={(value) => setFormData({...formData, class: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">Class 9</SelectItem>
                            <SelectItem value="10">Class 10</SelectItem>
                            <SelectItem value="11">Class 11</SelectItem>
                            <SelectItem value="12">Class 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                        <Select value={formData.examType} onValueChange={(value) => setFormData({...formData, examType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unit_test">Unit Test</SelectItem>
                            <SelectItem value="mid_term">Mid Term</SelectItem>
                            <SelectItem value="final">Final Exam</SelectItem>
                            <SelectItem value="practice">Practice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          min="30"
                          max="300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                        <Input
                          type="number"
                          value={formData.maxMarks}
                          onChange={(e) => setFormData({...formData, maxMarks: parseInt(e.target.value)})}
                          min="10"
                          max="200"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                      <Textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        placeholder="Enter exam instructions for students..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="e.g., algebra, geometry, unit1"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPaperMutation.isPending}>
                        {createPaperMutation.isPending ? "Creating..." : "Create Paper"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Papers List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Question Papers</h3>
            <Button variant="outline">
              <i className="fas fa-download mr-2"></i>
              Export List
            </Button>
          </div>

          {filteredPapers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-alt text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Papers Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterSubject !== "all" || filterClass !== "all" || filterExamType !== "all"
                  ? "No question papers match your current filters."
                  : "Start by creating your first question paper."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPapers.map((paper: QuestionPaper) => (
                <div key={paper.id} className="border rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{paper.title}</h4>
                        {getStatusBadge(paper)}
                        <Badge className={getExamTypeBadge(paper.examType)}>
                          {paper.examType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Subject:</span> {paper.subject}
                        </div>
                        <div>
                          <span className="font-medium">Class:</span> {paper.class}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {paper.duration} min
                        </div>
                        <div>
                          <span className="font-medium">Max Marks:</span> {paper.maxMarks}
                        </div>
                      </div>
                      
                      {paper.tags && paper.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {paper.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        Created {new Date(paper.createdAt).toLocaleDateString()} by {paper.createdBy}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPaper(paper)}
                      >
                        <i className="fas fa-eye mr-1"></i>
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <i className="fas fa-print mr-1"></i>
                        Print
                      </Button>
                      <Button size="sm" variant="outline">
                        <i className="fas fa-copy mr-1"></i>
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Paper Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPaper?.title}</DialogTitle>
          </DialogHeader>
          {selectedPaper && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Subject:</span> {selectedPaper.subject}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Class:</span> {selectedPaper.class}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span> {selectedPaper.duration} minutes
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Marks:</span> {selectedPaper.maxMarks}
                </div>
              </div>
              
              {selectedPaper.instructions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedPaper.instructions}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Questions</h4>
                {selectedPaper.questions && selectedPaper.questions.sections ? (
                  <div className="space-y-4">
                    {selectedPaper.questions.sections.map((section: any, sectionIndex: number) => (
                      <div key={sectionIndex} className="border rounded p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{section.name}</h5>
                        {section.instructions && (
                          <p className="text-sm text-gray-600 mb-3">{section.instructions}</p>
                        )}
                        <div className="space-y-2">
                          {section.questions?.map((question: any, questionIndex: number) => (
                            <div key={questionIndex} className="flex">
                              <span className="font-medium text-gray-700 mr-2">
                                {question.questionNumber}.
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-900">{question.question}</p>
                                <div className="text-sm text-gray-500 mt-1">
                                  [{question.marks} marks] • {question.type}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded">
                    <p className="text-gray-600">No questions added yet. Edit this paper to add questions.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
