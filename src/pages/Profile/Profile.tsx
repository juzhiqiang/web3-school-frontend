import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Link as LinkIcon,
  Save,
  Award,
  TrendingUp,
  BookOpen,
  Users
} from 'lucide-react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useRewardTracking } from '../../hooks/useRewardTracking';
import { formatDisplayBalance } from '../../utils/formatBalance';
import toast from 'react-hot-toast';

interface UserProfile {
  displayName: string;
  email: string;
  bio: string;
  website: string;
  location: string;
  twitter: string;
  github: string;
  joinDate: Date;
  avatar?: string;
}

const Profile: React.FC = () => {
  const { address } = useAccount();
  const { ydBalance, ethBalance } = useWeb3();
  const { rewards, totalUnclaimed } = useRewardTracking();
  
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    twitter: '',
    github: '',
    joinDate: new Date(),
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 加载用户资料
  useEffect(() => {
    const loadProfile = () => {
      if (!address) return;
      
      try {
        const savedProfile = localStorage.getItem(`profile_${address}`);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfile({
            ...parsed,
            joinDate: parsed.joinDate ? new Date(parsed.joinDate) : new Date()
          });
        } else {
          // 设置默认值
          setProfile(prev => ({
            ...prev,
            displayName: `用户 ${address.slice(0, 6)}...${address.slice(-4)}`,
            joinDate: new Date()
          }));
        }
      } catch (error) {
        console.error('加载用户资料失败:', error);
      }
    };

    loadProfile();
  }, [address]);

  // 保存用户资料
  const saveProfile = async () => {
    if (!address) return;
    
    try {
      setIsSaving(true);
      
      const profileToSave = {
        ...profile,
        joinDate: profile.joinDate ? profile.joinDate.toISOString() : new Date().toISOString()
      };
      
      localStorage.setItem(`profile_${address}`, JSON.stringify(profileToSave));
      
      toast.success('资料保存成功！');
      setIsEditing(false);
    } catch (error) {
      console.error('保存用户资料失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditing(false);
    // 重新加载资料
    if (address) {
      const savedProfile = localStorage.getItem(`profile_${address}`);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          ...parsed,
          joinDate: parsed.joinDate ? new Date(parsed.joinDate) : new Date()
        });
      }
    }
  };

  // 更新资料字段
  const updateField = (field: keyof UserProfile, value: string | Date) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">需要连接钱包</h3>
            <p className="text-gray-500 mb-4">请先连接您的钱包来查看个人资料</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">个人资料</h1>
        <p className="text-gray-600">管理您的账户信息和偏好设置</p>
      </div>

      {/* 资产概览 */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YD 余额</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDisplayBalance(ydBalance || '0')}</div>
            <p className="text-xs text-muted-foreground">一灯币</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH 余额</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDisplayBalance(ethBalance || '0')}</div>
            <p className="text-xs text-muted-foreground">以太币</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未领取奖励</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDisplayBalance(totalUnclaimed)}</div>
            <p className="text-xs text-muted-foreground">YD 奖励</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">加入时间</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {profile.joinDate.toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">注册日期</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">基本信息</TabsTrigger>
          <TabsTrigger value="rewards">奖励记录</TabsTrigger>
          <TabsTrigger value="settings">账户设置</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>个人信息</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    编辑资料
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={cancelEdit} variant="outline">
                      取消
                    </Button>
                    <Button onClick={saveProfile} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 钱包地址 */}
              <div>
                <Label>钱包地址</Label>
                <Input value={address} disabled className="mt-1 font-mono" />
              </div>

              {/* 显示名称 */}
              <div>
                <Label htmlFor="displayName">显示名称</Label>
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <Label htmlFor="email">邮箱地址</Label>
                <div className="mt-1 relative">
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* 个人简介 */}
              <div>
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="介绍一下您自己..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* 位置 */}
              <div>
                <Label htmlFor="location">所在地区</Label>
                <div className="mt-1 relative">
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="例如：北京，中国"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* 网站 */}
              <div>
                <Label htmlFor="website">个人网站</Label>
                <div className="mt-1 relative">
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="https://yourwebsite.com"
                  />
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* 社交媒体 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => updateField('twitter', e.target.value)}
                    disabled={!isEditing}
                    placeholder="@username"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={profile.github}
                    onChange={(e) => updateField('github', e.target.value)}
                    disabled={!isEditing}
                    placeholder="username"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 奖励记录 */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                奖励记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无奖励记录</h3>
                  <p className="text-gray-500 mb-4">完成任务来获得奖励吧！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{reward.description}</p>
                        <p className="text-sm text-gray-600">{reward.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reward.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{reward.amount} YD</p>
                        <p className={`text-sm ${
                          reward.claimed ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {reward.claimed ? '已领取' : '待领取'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 账户设置 */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>账户设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">隐私设置</h3>
                  <p className="text-gray-600 mb-4">控制您的信息可见性</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>公开显示邮箱地址</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>允许其他用户联系我</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>显示我的学习进度</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-2">通知设置</h3>
                  <p className="text-gray-600 mb-4">选择您希望接收的通知类型</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>新课程推荐</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>课程更新提醒</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>奖励到账通知</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-2 text-red-600">危险操作</h3>
                  <p className="text-gray-600 mb-4">这些操作无法撤销，请谨慎操作</p>
                  
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    清除所有数据
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;