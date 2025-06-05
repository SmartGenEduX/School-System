import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
              <i className="fas fa-graduation-cap text-white text-2xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">SmartGenEduX</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">EduManage Pro</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive school management platform with AI-powered features, WhatsApp integration, 
            and real-time analytics for modern educational institutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <i className="fab fa-whatsapp text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">WhatsApp Integration</h3>
              <p className="text-gray-600">
                Automated notifications for fees, attendance, reports, and exam schedules. 
                Direct communication with parents and teachers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-robot text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Vipu AI Assistant</h3>
              <p className="text-gray-600">
                24/7 AI chatbot for parent queries, automated question paper generation, 
                and intelligent behavior pattern analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-chart-bar text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">PowerBI Analytics</h3>
              <p className="text-gray-600">
                Real-time dashboard metrics, performance analytics, and comprehensive 
                reporting for data-driven decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
              <p className="text-gray-600">
                Customized dashboards for Admin, Principal, Teachers, and Class Teachers 
                with appropriate access controls.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-4">Ready to Transform Your School?</h3>
              <p className="text-gray-600 mb-6">
                Join hundreds of educational institutions already using EduManage Pro 
                for streamlined administration and enhanced communication.
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In to Dashboard
              </Button>
              <div className="mt-4 text-sm text-gray-500">
                <p>Demo credentials available for testing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <div className="font-semibold text-blue-600">1000+</div>
              <div>Students Managed</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">95%</div>
              <div>Parent Satisfaction</div>
            </div>
            <div>
              <div className="font-semibold text-purple-600">24/7</div>
              <div>AI Support</div>
            </div>
            <div>
              <div className="font-semibold text-orange-600">100%</div>
              <div>Real-time Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
