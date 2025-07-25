import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  DollarSign, 
  Activity, 
  Settings, 
  Shield, 
  BarChart3, 
  AlertTriangle,
  UserCheck,
  UserX,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Bell,
  Server,
  Database,
  Wifi,
  WifiOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { adminApi } from '@/api/admin';
import { useVoiceCommentary } from '@/hooks/useVoiceCommentary';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageParticipants: number;
  topPerformers: any[];
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
  lastActive: string;
  kycStatus: string;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  startDate: string;
  endDate: string;
}

const AdminDashboard: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Voice Commentary Integration
  const voiceCommentary = useVoiceCommentary();

  // Mock data for demonstration
  useEffect(() => {
    const loadMockData = () => {
      setStats({
        totalUsers: 2847,
        activeUsers: 156,
        totalTournaments: 78,
        activeTournaments: 12,
        totalRevenue: 485000,
        monthlyRevenue: 89420,
        averageParticipants: 78,
        topPerformers: [
          { id: '1', username: 'TradeMaster_Pro', profit: 45820 },
          { id: '2', username: 'BullRunner2024', profit: 42350 },
          { id: '3', username: 'MarketWizard', profit: 38200 },
          { id: '4', username: 'CryptoKing', profit: 35850 },
          { id: '5', username: 'ForexQueen', profit: 33900 },
          { id: '6', username: 'AlgoTrader_Elite', profit: 31750 },
          { id: '7', username: 'DayTradeKing', profit: 29600 },
          { id: '8', username: 'QuantumTrader', profit: 27450 },
          { id: '9', username: 'SwingMaster', profit: 25300 },
          { id: '10', username: 'ScalpingPro', profit: 23150 }
        ]
      });

      setUsers([
        {
          id: '1',
          username: 'demo_trader',
          email: 'demo@dayrade.com',
          role: 'user',
          status: 'active',
          joinedAt: '2024-01-15',
          lastActive: '5 minutes ago',
          kycStatus: 'approved'
        },
        {
          id: '2',
          username: 'sarah_investor',
          email: 'sarah@example.com',
          role: 'user',
          status: 'active',
          joinedAt: '2024-01-10',
          lastActive: '2 hours ago',
          kycStatus: 'pending'
        },
        {
          id: '3',
          username: 'admin_user',
          email: 'admin@dayrade.com',
          role: 'admin',
          status: 'active',
          joinedAt: '2023-12-01',
          lastActive: '1 minute ago',
          kycStatus: 'approved'
        },
        {
          id: '4',
          username: 'pro_trader_mike',
          email: 'mike@trading.com',
          role: 'user',
          status: 'active',
          joinedAt: '2024-01-08',
          lastActive: '30 minutes ago',
          kycStatus: 'approved'
        },
        {
          id: '5',
          username: 'crypto_enthusiast',
          email: 'crypto@example.com',
          role: 'user',
          status: 'inactive',
          joinedAt: '2024-01-05',
          lastActive: '3 days ago',
          kycStatus: 'rejected'
        },
        {
          id: '6',
          username: 'forex_master',
          email: 'forex@trading.com',
          role: 'moderator',
          status: 'active',
          joinedAt: '2023-12-15',
          lastActive: '1 hour ago',
          kycStatus: 'approved'
        }
      ]);

      setTournaments([
        {
          id: '1',
          name: 'Winter Championship 2024',
          status: 'active',
          participants: 127,
          maxParticipants: 150,
          entryFee: 250,
          prizePool: 31750,
          startDate: '2024-01-15',
          endDate: '2024-01-29'
        },
        {
          id: '2',
          name: 'Daily Power Hour',
          status: 'active',
          participants: 84,
          maxParticipants: 100,
          entryFee: 50,
          prizePool: 4200,
          startDate: '2024-01-25',
          endDate: '2024-01-25'
        },
        {
          id: '3',
          name: 'New Year Trading Challenge',
          status: 'active',
          participants: 189,
          maxParticipants: 200,
          entryFee: 100,
          prizePool: 18900,
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        },
        {
          id: '4',
          name: 'Crypto Masters Weekly',
          status: 'active',
          participants: 95,
          maxParticipants: 120,
          entryFee: 75,
          prizePool: 7125,
          startDate: '2024-01-22',
          endDate: '2024-01-28'
        },
        {
          id: '5',
          name: 'Forex Elite Tournament',
          status: 'active',
          participants: 78,
          maxParticipants: 100,
          entryFee: 200,
          prizePool: 15600,
          startDate: '2024-01-20',
          endDate: '2024-02-03'
        },
        {
          id: '6',
          name: 'February Mega Championship',
          status: 'scheduled',
          participants: 67,
          maxParticipants: 200,
          entryFee: 500,
          prizePool: 33500,
          startDate: '2024-02-01',
          endDate: '2024-02-28'
        },
        {
          id: '7',
          name: 'Weekend Warrior Challenge',
          status: 'active',
          participants: 58,
          maxParticipants: 80,
          entryFee: 30,
          prizePool: 1740,
          startDate: '2024-01-27',
          endDate: '2024-01-28'
        },
        {
          id: '8',
          name: 'January Rookie Tournament',
          status: 'completed',
          participants: 156,
          maxParticipants: 200,
          entryFee: 25,
          prizePool: 3900,
          startDate: '2024-01-01',
          endDate: '2024-01-14'
        },
        {
          id: '9',
          name: 'Scalping Masters Pro',
          status: 'active',
          participants: 73,
          maxParticipants: 100,
          entryFee: 150,
          prizePool: 10950,
          startDate: '2024-01-23',
          endDate: '2024-01-30'
        },
        {
          id: '10',
          name: 'Swing Trading Elite',
          status: 'active',
          participants: 91,
          maxParticipants: 120,
          entryFee: 180,
          prizePool: 16380,
          startDate: '2024-01-20',
          endDate: '2024-02-05'
        },
        {
          id: '11',
          name: 'Options Trading Championship',
          status: 'active',
          participants: 64,
          maxParticipants: 90,
          entryFee: 300,
          prizePool: 19200,
          startDate: '2024-01-24',
          endDate: '2024-02-07'
        },
        {
          id: '12',
          name: 'Algorithmic Trading Contest',
          status: 'active',
          participants: 52,
          maxParticipants: 75,
          entryFee: 400,
          prizePool: 20800,
          startDate: '2024-01-26',
          endDate: '2024-02-09'
        }
      ]);

      setSystemHealth({
        status: 'healthy',
        uptime: '99.97%',
        responseTime: '89ms',
        activeConnections: 456,
        memoryUsage: 72,
        cpuUsage: 38,
        services: {
          database: 'online',
          redis: 'online',
          api: 'online',
          websocket: 'online',
          email: 'online',
          payments: 'online'
        }
      });

      setLoading(false);
    };

    loadMockData();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      banned: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout
        sidebarExpanded={sidebarExpanded}
        onSidebarExpandedChange={setSidebarExpanded}
        isAuthenticated={true}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your trading platform</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={systemHealth?.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              <Activity className="h-3 w-3 mr-1" />
              System {systemHealth?.status}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats?.totalUsers.toLocaleString()}
                icon={Users}
                trend={12}
                color="blue"
              />
              <StatCard
                title="Active Users"
                value={stats?.activeUsers}
                icon={Activity}
                trend={8}
                color="green"
              />
              <StatCard
                title="Active Tournaments"
                value={stats?.activeTournaments}
                icon={Trophy}
                trend={-5}
                color="yellow"
              />
              <StatCard
                title="Monthly Revenue"
                value={`$${stats?.monthlyRevenue.toLocaleString()}`}
                icon={DollarSign}
                trend={15}
                color="green"
              />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topPerformers.map((performer, index) => (
                      <div key={performer.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                          </div>
                          <span className="font-medium">{performer.username}</span>
                        </div>
                        <span className="text-green-600 font-medium">
                          +${performer.profit.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Uptime</span>
                      <span className="font-medium">{systemHealth?.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Response Time</span>
                      <span className="font-medium">{systemHealth?.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Connections</span>
                      <span className="font-medium">{systemHealth?.activeConnections}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>{systemHealth?.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${systemHealth?.memoryUsage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex items-center space-x-2">
                <Input placeholder="Search users..." className="w-64" />
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{getStatusBadge(user.kycStatus)}</TableCell>
                      <TableCell>{user.joinedAt}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <UserX className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tournament Management</h2>
              <Button>
                <Trophy className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Entry Fee</TableHead>
                    <TableHead>Prize Pool</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell className="font-medium">{tournament.name}</TableCell>
                      <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                      <TableCell>
                        {tournament.participants}/{tournament.maxParticipants}
                      </TableCell>
                      <TableCell>${tournament.entryFee}</TableCell>
                      <TableCell>${tournament.prizePool.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{tournament.startDate}</div>
                          <div className="text-gray-500">to {tournament.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {tournament.status === 'scheduled' && (
                            <Button size="sm" variant="outline">
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {tournament.status === 'active' && (
                            <Button size="sm" variant="outline">
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Voice Commentary Tab */}
          <TabsContent value="voice" className="space-y-6">
            <h2 className="text-xl font-semibold">Voice Commentary Control</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Main Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-5 w-5" />
                    <span>Commentary Controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Voice Commentary</h4>
                      <p className="text-sm text-gray-500">Enable live commentary</p>
                    </div>
                    <Switch 
                      checked={voiceCommentary.isActive} 
                      onCheckedChange={voiceCommentary.isActive ? voiceCommentary.stopCommentary : voiceCommentary.startCommentary}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Emergency Stop</h4>
                      <p className="text-sm text-gray-500">Disable all commentary</p>
                    </div>
                    <Switch 
                      checked={voiceCommentary.config.emergencyStop}
                      onCheckedChange={(checked) => checked ? voiceCommentary.emergencyStop() : voiceCommentary.resetEmergencyStop()}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Volume</span>
                      <span>{Math.round(voiceCommentary.config.voiceSettings.volume * 100)}%</span>
                    </div>
                    <Slider
                      value={[voiceCommentary.config.voiceSettings.volume * 100]}
                      onValueChange={(value) => voiceCommentary.updateConfig({ 
                        voiceSettings: { 
                          ...voiceCommentary.config.voiceSettings, 
                          volume: value[0] / 100 
                        } 
                      })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Speed</span>
                      <span>{voiceCommentary.config.voiceSettings.speed}x</span>
                    </div>
                    <Slider
                      value={[voiceCommentary.config.voiceSettings.speed * 100]}
                      onValueChange={(value) => voiceCommentary.updateConfig({ 
                        voiceSettings: { 
                          ...voiceCommentary.config.voiceSettings, 
                          speed: value[0] / 100 
                        } 
                      })}
                      min={50}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Budget Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Budget Tracking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Budget</span>
                      <span>${voiceCommentary.config.budget}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Used Today</span>
                      <span className={voiceCommentary.config.usedBudget > voiceCommentary.config.budget * 0.8 ? 'text-red-600' : 'text-green-600'}>
                        ${voiceCommentary.config.usedBudget.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          voiceCommentary.config.usedBudget > voiceCommentary.config.budget * 0.8 
                            ? 'bg-red-600' 
                            : 'bg-green-600'
                        }`}
                        style={{ 
                          width: `${Math.min((voiceCommentary.config.usedBudget / voiceCommentary.config.budget) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cost per Minute</span>
                      <span>${voiceCommentary.config.costPerMinute}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Minutes</span>
                      <span>{voiceCommentary.stats.totalMinutesUsed.toFixed(1)}</span>
                    </div>
                  </div>

                  {voiceCommentary.config.usedBudget > voiceCommentary.config.budget * 0.9 && (
                    <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Budget limit approaching</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Emergency Controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={voiceCommentary.emergencyStop}
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    Emergency Stop
                  </Button>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice Selection</label>
                    <select 
                      value={voiceCommentary.config.voiceSettings.voice}
                      onChange={(e) => voiceCommentary.updateConfig({ 
                        voiceSettings: { 
                          ...voiceCommentary.config.voiceSettings, 
                          voice: e.target.value 
                        } 
                      })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="en-US-Neural2-D">Professional (US)</option>
                      <option value="en-US-Neural2-A">Energetic (US)</option>
                      <option value="en-GB-Neural2-B">Calm (UK)</option>
                      <option value="en-US-Neural2-C">Authoritative (US)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pitch</span>
                      <span>{voiceCommentary.config.voiceSettings.pitch}</span>
                    </div>
                    <Slider
                      value={[voiceCommentary.config.voiceSettings.pitch + 20]}
                      onValueChange={(value) => voiceCommentary.updateConfig({ 
                        voiceSettings: { 
                          ...voiceCommentary.config.voiceSettings, 
                          pitch: value[0] - 20 
                        } 
                      })}
                      min={0}
                      max={40}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Auto Commentary</h4>
                      <p className="text-xs text-gray-500">Generate automatic commentary</p>
                    </div>
                    <Switch 
                      checked={voiceCommentary.config.autoCommentary}
                      onCheckedChange={(checked) => voiceCommentary.updateConfig({ autoCommentary: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commentary Status */}
            <Card>
              <CardHeader>
                <CardTitle>Commentary Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{voiceCommentary.stats.totalMinutesUsed.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Total Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${voiceCommentary.stats.totalCost.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Total Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{voiceCommentary.stats.sessionsToday}</div>
                    <div className="text-sm text-gray-500">Sessions Today</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${voiceCommentary.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {voiceCommentary.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                </div>
                
                {voiceCommentary.currentSession && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Current Session</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{voiceCommentary.currentSession.duration.toFixed(1)}m</div>
                        <div className="text-xs text-blue-700">Duration</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">${voiceCommentary.currentSession.cost.toFixed(2)}</div>
                        <div className="text-xs text-blue-700">Cost</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{voiceCommentary.currentSession.startTime.toLocaleTimeString()}</div>
                        <div className="text-xs text-blue-700">Started</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-xl font-semibold">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Financial Report</h3>
                      <p className="text-sm text-gray-500">Revenue and transaction analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium">User Activity</h3>
                      <p className="text-sm text-gray-500">User engagement and retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div>
                      <h3 className="font-medium">Tournament Analytics</h3>
                      <p className="text-sm text-gray-500">Performance and participation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <h2 className="text-xl font-semibold">System Monitoring</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(systemHealth?.services || {}).map(([service, status]) => (
                      <div key={service} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {(status as string) === 'online' ? (
                            <Wifi className="h-4 w-4 text-green-600" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-600" />
                          )}
                          <span className="capitalize">{service}</span>
                        </div>
                        <Badge className={(status as string) === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {status as string}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>{systemHealth?.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${systemHealth?.cpuUsage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{systemHealth?.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${systemHealth?.memoryUsage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Platform Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500">Temporarily disable platform access</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">User Registration</h4>
                      <p className="text-sm text-gray-500">Allow new user signups</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Bulk Email
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;