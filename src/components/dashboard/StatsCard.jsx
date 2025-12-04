import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  gradient,
  color = "#1A1A1A",
  onClick
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <Card 
      className="bg-white border-[#E5DFD5] rounded-xl relative overflow-hidden transition-all duration-300 hover:border-[#1A1A1A] hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-semibold text-[#1A1A1A]">{value}</p>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {change}
              </span>
            </div>
          </div>
          
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}