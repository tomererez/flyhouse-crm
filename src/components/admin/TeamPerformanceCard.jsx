import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Plane,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TeamPerformanceCard({ teamPerformance, leads }) {
  const maxRevenue = Math.max(...teamPerformance.map(t => t.revenue), 1);

  return (
    <Card className="bg-white border-[#E5DFD5] rounded-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-[#1A1A1A]">
          <BarChart3 className="w-5 h-5 text-[#1A1A1A]" />
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamPerformance.length === 0 ? (
          <div className="text-center py-8 text-[#6B6B6B]">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No assigned leads yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamPerformance.map((member, index) => (
              <div key={member.id} className="border border-[#E5DFD5] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-[#1A1A1A]'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">{member.full_name}</p>
                      <p className="text-xs text-[#6B6B6B]">{member.email}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {member.conversionRate}% conversion
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center mb-3">
                  <div>
                    <p className="text-lg font-bold text-[#1A1A1A]">{member.totalLeads}</p>
                    <p className="text-xs text-[#6B6B6B]">Leads</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{member.bookedLeads}</p>
                    <p className="text-xs text-[#6B6B6B]">Booked</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">${member.revenue.toLocaleString()}</p>
                    <p className="text-xs text-[#6B6B6B]">Revenue</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">${member.profit.toLocaleString()}</p>
                    <p className="text-xs text-[#6B6B6B]">Profit</p>
                  </div>
                </div>

                <div className="relative">
                  <Progress 
                    value={(member.revenue / maxRevenue) * 100} 
                    className="h-2 bg-[#E5DFD5]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}