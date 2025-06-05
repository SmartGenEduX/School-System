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
import { Download, FileText, MessageSquare } from "lucide-react";

interface FeeManagementProps {
  onBack: () => void;
}

export default function FeeManagement({ onBack }: FeeManagementProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feeRecords, isLoading } = useQuery({
    queryKey: ["/api/fees"],
  });

  const { data: feeStats } = useQuery({
    queryKey: ["/api/fees/stats"],
  });

  const updateFeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/fees/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fees/stats"] });
      toast({
        title: "Fee Updated",
        description: "Fee record has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update fee record.",
        variant: "destructive",
      });
    }
  });

  const filteredFeeRecords = feeRecords?.filter((record: any) => {
    const studentName = `${record.student?.firstName} ${record.student?.lastName}`.toLowerCase();
    const matchesSearch = studentName.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const handlePayment = (feeId: number) => {
    updateFeeMutation.mutate({
      id: feeId,
      data: {
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        transactionId: `TXN${Date.now()}`
      }
    });
  };

  const handleSendReminder = async (studentId: number) => {
    try {
      await apiRequest('POST', '/api/whatsapp/send', {
        to: '+1234567890', // This would come from student data
        message: 'Fee payment reminder',
        messageType: 'fee_reminder'
      });
      
      toast({
        title: "Reminder Sent",
        description: "WhatsApp reminder has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Class,Fee Amount,Status,Due Date\n"
      + filteredFeeRecords?.map((record: any) => 
          `${record.studentName},${record.class},${record.amount},${record.status},${record.dueDate}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fee_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    handleExportExcel();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Fee Management Report',
        text: 'SmartGenEduX Fee Management Report',
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ModuleHeader 
          title="Fee Management"
          description="Track and manage student fee payments with WhatsApp integration"
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
          onPrint={handleExportPDF}
          onShare={handleShare}
        />
        
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
      <ModuleHeader 
        title="Fee Management"
        description="Track and manage student fee payments with WhatsApp integration"
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onPrint={handleExportPDF}
        onShare={handleShare}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ₹{((feeStats?.totalCollected || 0) / 100000).toFixed(1)}L
            </div>
            <div className="text-sm text-gray-600">Total Collected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              ₹{((feeStats?.totalPending || 0) / 100000).toFixed(1)}L
            </div>
            <div className="text-sm text-gray-600">Pending Collection</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              ₹{((feeStats?.totalOverdue || 0) / 100000).toFixed(1)}L
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(((feeStats?.totalCollected || 0) / ((feeStats?.totalCollected || 0) + (feeStats?.totalPending || 0))) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">Collection Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <i className="fas fa-plus mr-2"></i>
              Add Fee Record
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <i className="fab fa-whatsapp mr-2"></i>
              Bulk Reminders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fee Records Table */}
      <Card>
        <CardContent className="p-6">
          {filteredFeeRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-money-bill-wave text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Records Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "No fee records match your current filters."
                  : "Start by adding the first fee record."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Fee Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">Sample Student</div>
                        <div className="text-sm text-gray-500">Class 10A • STU001</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">Tuition Fee</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">₹15,000</td>
                    <td className="py-3 px-4 text-gray-900">2024-02-15</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handlePayment(1)}
                        >
                          Mark Paid
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendReminder(1)}
                        >
                          <i className="fab fa-whatsapp mr-1"></i>
                          Remind
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
    </div>
  );
}
