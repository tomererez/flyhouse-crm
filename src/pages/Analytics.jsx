import React, { useState, useEffect } from "react";
import { Lead, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Plane,
  Calendar,
  ArrowLeft,
  Target,
  Clock,
  BarChart3,
  Activity,
  Percent,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, isWithinInterval } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from "recharts";
import { motion } from "framer-motion";
import LeadsListModal from "../components/analytics/LeadsListModal";

const CHART_COLORS = {
  primary: '#1A1A1A',
  gold: '#C9A96E',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  cyan: '#06B6D4'
};

const STATUS_COLORS = {
  new: '#3B82F6',
  contacted: '#F59E0B',
  qualified: '#8B5CF6',
  quoted: '#6366F1',
  pending_client: '#F97316',
  booked: '#10B981',
  flown: '#059669',
  lost: '#6B7280'
};

export default function Analytics() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedMember, setSelectedMember] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [modalData, setModalData] = useState({ isOpen: false, leads: [], title: '', subtitle: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leadsData, usersData, me] = await Promise.all([
        Lead.list('-created_date'),
        User.list(),
        User.currentUser()
      ]);
      setCurrentUser(me);
      setLeads(leadsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoading && currentUser?.role !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to view analytics.</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getFilteredLeads = () => {
    const startDate = subDays(new Date(), parseInt(dateRange));
    return leads.filter(lead => {
      if (new Date(lead.created_date) < startDate) return false;
      if (selectedMember !== 'all' && lead.owner_email !== selectedMember) return false;
      if (selectedSource !== 'all' && lead.source !== selectedSource) return false;
      return true;
    });
  };

  const filteredLeads = getFilteredLeads();

  const calculateMetrics = () => {
    const bookedLeadsList = filteredLeads.filter(l => l.status === 'booked' || l.status === 'flown');
    const totalRevenue = bookedLeadsList.reduce((sum, l) => sum + (l.client_closing_price || 0), 0);
    const totalCost = bookedLeadsList.reduce((sum, l) => sum + (l.operator_closing_price || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgDealSize = bookedLeadsList.length > 0 ? totalRevenue / bookedLeadsList.length : 0;
    const conversionRate = filteredLeads.length > 0 ? (bookedLeadsList.length / filteredLeads.length) * 100 : 0;
    const lostLeadsList = filteredLeads.filter(l => l.status === 'lost');
    const activeLeadsList = filteredLeads.filter(l => !['booked', 'flown', 'lost'].includes(l.status));
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculate previous period for comparison
    const prevStartDate = subDays(new Date(), parseInt(dateRange) * 2);
    const prevEndDate = subDays(new Date(), parseInt(dateRange));
    const prevLeads = leads.filter(l => {
      const date = new Date(l.created_date);
      return date >= prevStartDate && date < prevEndDate;
    });
    const prevBooked = prevLeads.filter(l => l.status === 'booked' || l.status === 'flown');
    const prevRevenue = prevBooked.reduce((sum, l) => sum + (l.client_closing_price || 0), 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const leadsChange = prevLeads.length > 0 ? ((filteredLeads.length - prevLeads.length) / prevLeads.length) * 100 : 0;

    return {
      totalRevenue, totalCost, totalProfit, avgDealSize, conversionRate,
      bookedLeads: bookedLeadsList.length, bookedLeadsList,
      lostLeads: lostLeadsList.length, lostLeadsList,
      activeLeads: activeLeadsList.length, activeLeadsList,
      profitMargin, revenueChange, leadsChange
    };
  };

  const metrics = calculateMetrics();

  const getRevenueOverTime = () => {
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);
    const interval = { start: startDate, end: new Date() };

    const daysList = eachDayOfInterval(interval);
    let cumulative = 0;

    return daysList.map(day => {
      const dayLeads = filteredLeads.filter(l =>
        format(new Date(l.created_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
        (l.status === 'booked' || l.status === 'flown')
      );
      const revenue = dayLeads.reduce((sum, l) => sum + (l.client_closing_price || 0), 0);
      const profit = dayLeads.reduce((sum, l) => sum + ((l.client_closing_price || 0) - (l.operator_closing_price || 0)), 0);
      cumulative += revenue;
      return {
        date: format(day, 'MMM d'),
        revenue,
        profit,
        cumulative,
        leads: dayLeads.length
      };
    });
  };

  const getLeadsByStatus = () => {
    const statusGroups = {};
    filteredLeads.forEach(lead => {
      if (!statusGroups[lead.status]) {
        statusGroups[lead.status] = [];
      }
      statusGroups[lead.status].push(lead);
    });

    const statusOrder = ['new', 'contacted', 'qualified', 'quoted', 'pending_client', 'booked', 'flown', 'lost'];
    return statusOrder
      .filter(status => statusGroups[status])
      .map(status => ({
        name: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
        value: statusGroups[status].length,
        leads: statusGroups[status],
        status,
        color: STATUS_COLORS[status]
      }));
  };

  const openLeadsModal = (leads, title, subtitle = '') => {
    setModalData({ isOpen: true, leads, title, subtitle });
  };

  const closeLeadsModal = () => {
    setModalData({ isOpen: false, leads: [], title: '', subtitle: '' });
  };

  const getLeadsBySource = () => {
    const sourceGroups = {};
    filteredLeads.forEach(lead => {
      const source = lead.source || 'Direct';
      if (!sourceGroups[source]) {
        sourceGroups[source] = [];
      }
      sourceGroups[source].push(lead);
    });
    return Object.entries(sourceGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6)
      .map(([source, leads], i) => ({
        name: source,
        value: leads.length,
        leads,
        fill: [CHART_COLORS.primary, CHART_COLORS.gold, CHART_COLORS.info, CHART_COLORS.purple, CHART_COLORS.success, CHART_COLORS.warning][i]
      }));
  };

  const getTeamPerformance = () => {
    const teamStats = {};
    filteredLeads.forEach(lead => {
      const owner = lead.owner_email || 'Unassigned';
      if (!teamStats[owner]) {
        teamStats[owner] = {
          name: lead.owner_name || owner.split('@')[0],
          leads: 0,
          booked: 0,
          revenue: 0,
          profit: 0
        };
      }
      teamStats[owner].leads++;
      if (lead.status === 'booked' || lead.status === 'flown') {
        teamStats[owner].booked++;
        teamStats[owner].revenue += (lead.client_closing_price || 0);
        teamStats[owner].profit += ((lead.client_closing_price || 0) - (lead.operator_closing_price || 0));
      }
    });
    return Object.values(teamStats)
      .sort((a, b) => b.revenue - a.revenue)
      .map((member, i) => ({
        ...member,
        conversion: member.leads > 0 ? (member.booked / member.leads * 100) : 0,
        fill: [CHART_COLORS.gold, CHART_COLORS.primary, CHART_COLORS.info, CHART_COLORS.purple, CHART_COLORS.success][i % 5]
      }));
  };

  const getConversionFunnel = () => {
    const stages = ['new', 'contacted', 'qualified', 'quoted', 'booked'];
    const total = filteredLeads.length;

    return stages.map((stage, i) => {
      const count = filteredLeads.filter(l => {
        const stageIndex = stages.indexOf(l.status);
        return stageIndex >= i || (l.status === 'flown' && i <= 4) || (l.status === 'pending_client' && i <= 3);
      }).length;
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
        percentage: total > 0 ? (count / total * 100) : 0,
        fill: [CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.purple, CHART_COLORS.gold, CHART_COLORS.success][i]
      };
    });
  };

  const uniqueSources = [...new Set(leads.map(l => l.source).filter(Boolean))];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-[#E5DFD5] rounded-xl p-3 shadow-xl">
          <p className="font-medium text-[#1A1A1A] mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Profit') || entry.name.includes('revenue') || entry.name.includes('profit')
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#C9A96E] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("AdminDashboard")}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#1A1A1A] hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Analytics</h1>
            <p className="text-[#6B6B6B]">Deep dive into your performance metrics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 border-[#E5DFD5] bg-white rounded-xl">
              <Calendar className="w-4 h-4 mr-2 text-[#C9A96E]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-44 border-[#E5DFD5] bg-white rounded-xl">
              <Users className="w-4 h-4 mr-2 text-[#C9A96E]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.email}>{user.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-40 border-[#E5DFD5] bg-white rounded-xl">
              <Activity className="w-4 h-4 mr-2 text-[#C9A96E]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => openLeadsModal(metrics.bookedLeadsList, 'Revenue Breakdown', `${metrics.bookedLeads} deals closed`)}
          className="cursor-pointer"
        >
          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm font-medium">Total Revenue</span>
                <div className={`flex items-center gap-1 text-xs ${metrics.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.revenueChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(metrics.revenueChange).toFixed(1)}%
                </div>
              </div>
              <p className="text-3xl font-bold">${(metrics.totalRevenue / 1000).toFixed(0)}k</p>
              <div className="mt-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-white/60 text-xs">{metrics.bookedLeads} deals closed • Click to view</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => openLeadsModal(metrics.bookedLeadsList, 'Profit Details', `${metrics.bookedLeads} profitable deals`)}
          className="cursor-pointer"
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">Net Profit</span>
                <Badge className="bg-white/20 text-white border-0">{metrics.profitMargin.toFixed(1)}% margin</Badge>
              </div>
              <p className="text-3xl font-bold">${(metrics.totalProfit / 1000).toFixed(0)}k</p>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-white/80 text-xs">Avg ${(metrics.avgDealSize / 1000).toFixed(0)}k per deal • Click to view</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => openLeadsModal(filteredLeads, 'All Leads', `${filteredLeads.length} total leads`)}
          className="cursor-pointer"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">Total Leads</span>
                <div className={`flex items-center gap-1 text-xs ${metrics.leadsChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {metrics.leadsChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(metrics.leadsChange).toFixed(1)}%
                </div>
              </div>
              <p className="text-3xl font-bold">{filteredLeads.length}</p>
              <div className="mt-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-white/80 text-xs">{metrics.activeLeads} active, {metrics.lostLeads} lost • Click to view</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => openLeadsModal(metrics.bookedLeadsList, 'Converted Leads', `${metrics.conversionRate.toFixed(1)}% conversion rate`)}
          className="cursor-pointer"
        >
          <Card className="bg-gradient-to-br from-[#C9A96E] to-[#B8985D] border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">Conversion Rate</span>
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-3xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
              <div className="mt-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="text-white/80 text-xs">{metrics.bookedLeads} of {filteredLeads.length} • Click to view</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Large */}
        <Card className="lg:col-span-2 bg-white border-[#E5DFD5] rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#E5DFD5]/50 bg-gradient-to-r from-[#F9F7F4] to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
                <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Revenue & Profit Trend
              </CardTitle>
              <Badge className="bg-[#F5F2EC] text-[#6B6B6B] border-[#E5DFD5]">Last {dateRange} days</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={getRevenueOverTime()}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.gold}
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                  dot={{ fill: CHART_COLORS.gold, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke={CHART_COLORS.success}
                  strokeWidth={3}
                  fill="url(#profitGradient)"
                  name="Profit"
                  dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="bg-white border-[#E5DFD5] rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#E5DFD5]/50 bg-gradient-to-r from-[#F9F7F4] to-white">
            <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
              <div className="w-8 h-8 bg-[#C9A96E] rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {getConversionFunnel().map((stage, i) => {
                const stageLeads = filteredLeads.filter(l => {
                  const stageName = stage.stage.toLowerCase();
                  if (stageName === 'booked') return l.status === 'booked' || l.status === 'flown';
                  return l.status === stageName;
                });
                return (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative cursor-pointer group"
                    onClick={() => openLeadsModal(stageLeads, `${stage.stage} Leads`, `${stageLeads.length} leads at this stage`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#C9A96E] transition-colors">{stage.stage}</span>
                      <span className="text-sm font-bold" style={{ color: stage.fill }}>{stage.count}</span>
                    </div>
                    <div className="h-8 bg-[#F5F2EC] rounded-lg overflow-hidden relative group-hover:bg-[#E5DFD5] transition-colors">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-lg flex items-center justify-end pr-2"
                        style={{ backgroundColor: stage.fill }}
                      >
                        <span className="text-xs font-bold text-white">{stage.percentage.toFixed(0)}%</span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline Status */}
        <Card className="bg-white border-[#E5DFD5] rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#E5DFD5]/50 bg-gradient-to-r from-[#F9F7F4] to-white">
            <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
              <div className="w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Pipeline Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={getLeadsByStatus()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  onClick={(data) => openLeadsModal(data.leads, `${data.name} Leads`, `${data.value} leads in this status`)}
                  style={{ cursor: 'pointer' }}
                >
                  {getLeadsByStatus().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {getLeadsByStatus().map((entry, i) => (
                <button
                  key={i}
                  onClick={() => openLeadsModal(entry.leads, `${entry.name} Leads`, `${entry.value} leads`)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#F5F2EC] transition-colors"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A]">{entry.name} ({entry.value})</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="bg-white border-[#E5DFD5] rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#E5DFD5]/50 bg-gradient-to-r from-[#F9F7F4] to-white">
            <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {getLeadsBySource().map((source, i) => {
                const maxValue = Math.max(...getLeadsBySource().map(s => s.value));
                const percentage = (source.value / maxValue) * 100;
                return (
                  <motion.div
                    key={source.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => openLeadsModal(source.leads, `${source.name} Leads`, `${source.value} leads from this source`)}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1A1A1A] truncate max-w-[120px] group-hover:text-[#C9A96E] transition-colors">{source.name}</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{source.value}</span>
                    </div>
                    <div className="h-6 bg-[#F5F2EC] rounded-lg overflow-hidden group-hover:bg-[#E5DFD5] transition-colors">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full rounded-lg"
                        style={{ backgroundColor: source.fill }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-white border-[#E5DFD5] rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#E5DFD5]/50 bg-gradient-to-r from-[#F9F7F4] to-white">
            <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
              <div className="w-8 h-8 bg-[#C9A96E] rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {getTeamPerformance().slice(0, 5).map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-[#F9F7F4] rounded-xl hover:bg-[#F5F2EC] transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: member.fill }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A1A] truncate">{member.name}</p>
                    <p className="text-xs text-[#6B6B6B]">{member.booked} closed • {member.conversion.toFixed(0)}% conv.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1A1A1A]">${(member.revenue / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-green-600">+${(member.profit / 1000).toFixed(0)}k</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card className="bg-white border-[#E5DFD5] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-[#E5DFD5]/50 bg-gradient-to-r from-[#F9F7F4] to-white">
          <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            Team Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9F7F4]">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Team Member</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Leads</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Booked</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Conversion</th>
                  <th className="text-right py-4 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-4 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Profit</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Margin</th>
                </tr>
              </thead>
              <tbody>
                {getTeamPerformance().map((member, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#E5DFD5]/50 hover:bg-[#F9F7F4]/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: member.fill }}>
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-[#1A1A1A]">{member.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="font-semibold text-[#1A1A1A]">{member.leads}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge className="bg-green-100 text-green-700 border-0">{member.booked}</Badge>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-[#E5DFD5] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(member.conversion, 100)}%`,
                              backgroundColor: member.conversion >= 20 ? CHART_COLORS.success : member.conversion >= 10 ? CHART_COLORS.warning : CHART_COLORS.danger
                            }}
                          />
                        </div>
                        <span className="font-medium text-sm" style={{
                          color: member.conversion >= 20 ? CHART_COLORS.success : member.conversion >= 10 ? CHART_COLORS.warning : CHART_COLORS.danger
                        }}>
                          {member.conversion.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 font-bold text-[#1A1A1A]">
                      ${member.revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4 font-bold text-green-600">
                      ${member.profit.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-6">
                      <Badge className={`border-0 ${member.revenue > 0 && (member.profit / member.revenue) >= 0.15 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {member.revenue > 0 ? ((member.profit / member.revenue) * 100).toFixed(1) : 0}%
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Leads Modal */}
      <LeadsListModal
        isOpen={modalData.isOpen}
        onClose={closeLeadsModal}
        leads={modalData.leads}
        title={modalData.title}
        subtitle={modalData.subtitle}
        users={users}
        showAssign={true}
        onLeadUpdate={loadData}
      />
    </div>
  );
}