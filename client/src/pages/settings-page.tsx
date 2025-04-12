import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Check, Copy, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  // Account settings state
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [connectionAlerts, setConnectionAlerts] = useState(true);
  const [errorAlerts, setErrorAlerts] = useState(true);
  
  // API Key for demonstration purposes
  const [apiKey] = useState("mc_bt_" + Math.random().toString(36).substring(2, 15));
  
  const saveAccountSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call the API to update the user's settings
    toast({
      title: "Settings Saved",
      description: "Your account settings have been updated",
    });
  };
  
  const saveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call the API to update notification settings
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated",
    });
  };
  
  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard",
    });
  };
  
  const regenerateApiKey = () => {
    toast({
      title: "API Key Regenerated",
      description: "A new API key has been generated",
    });
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your personal information and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveAccountSettings} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                      />
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-sm text-destructive mt-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveNotificationSettings} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications about important events
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="connection-alerts" className="text-base">Connection Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when bots connect or disconnect
                      </p>
                    </div>
                    <Switch
                      id="connection-alerts"
                      checked={connectionAlerts}
                      onCheckedChange={setConnectionAlerts}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="error-alerts" className="text-base">Error Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when bots encounter errors
                      </p>
                    </div>
                    <Switch
                      id="error-alerts"
                      checked={errorAlerts}
                      onCheckedChange={setErrorAlerts}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    Save Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="theme" className="text-base block mb-2">Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                        theme === "light" ? "border-primary bg-primary/5" : "border-muted"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="bg-background border rounded-full p-4 mb-3">
                        <Sun className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-medium">Light</span>
                      {theme === "light" && (
                        <div className="absolute top-3 right-3 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    
                    <div
                      className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                        theme === "dark" ? "border-primary bg-primary/5" : "border-muted"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="bg-background border rounded-full p-4 mb-3">
                        <Moon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-medium">Dark</span>
                      {theme === "dark" && (
                        <div className="absolute top-3 right-3 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* API Settings */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access to the bot platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-base">Your API Key</Label>
                  <div className="flex">
                    <Input
                      id="api-key"
                      value={apiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={copyApiKey}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This key grants full access to your account. Keep it secure and never share it.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="destructive"
                    onClick={regenerateApiKey}
                  >
                    Regenerate Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
