import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AddBotModal from "@/components/add-bot-modal";
import BotCard from "@/components/bot-card";
import { Bot } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false);
  
  const { data: bots, isLoading, isError, error, refetch } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
    enabled: !!user,
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const ws = new WebSocket(`${protocol}//${hostname}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'BOTS_UPDATE') {
        queryClient.setQueryData(['/api/bots'], message.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect in 2 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        window.location.reload();
      }, 2000);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Calculate stats
  const totalBots = bots?.length || 0;
  const activeBots = bots?.filter(bot => bot.status === "connected").length || 0;
  
  // Calculate total uptime (just a sample calculation for display)
  const calculateTotalUptime = () => {
    if (!bots || bots.length === 0) return { hours: 0, minutes: 0 };
    
    let totalMinutes = 0;
    const now = new Date();
    
    bots.forEach(bot => {
      if (bot.status === "connected" && bot.lastConnection) {
        const lastConnection = new Date(bot.lastConnection);
        const diffMinutes = Math.floor((now.getTime() - lastConnection.getTime()) / (1000 * 60));
        totalMinutes += diffMinutes;
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes };
  };
  
  const uptime = calculateTotalUptime();

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button 
            className="mt-3 md:mt-0"
            onClick={() => setIsAddBotModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Bot</span>
          </Button>
        </div>
        
        {/* Bot Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-primary"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2" />
                    <path d="M14 5h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8.5" />
                    <path d="M4 14h.01" />
                    <path d="M4 18h.01" />
                    <path d="M8 17h4" />
                    <path d="M11 14h1" />
                    <path d="M18 12v8" />
                    <path d="M9 18v2" />
                    <path d="M12 18v2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Bots</h3>
                  <p className="text-2xl font-semibold">{totalBots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-secondary/10 rounded-full p-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-secondary"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Active Bots</h3>
                  <p className="text-2xl font-semibold">{activeBots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-accent/10 rounded-full p-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-accent"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Uptime</h3>
                  <p className="text-2xl font-semibold">{uptime.hours}h {uptime.minutes}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Bots List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Bots</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your bots...</p>
          </div>
        ) : isError ? (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-6">
              <div className="flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-destructive mr-3"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <h3 className="font-medium">Error Loading Bots</h3>
                  <p className="text-sm">{error?.message || "An error occurred while loading your bots."}</p>
                  <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : bots && bots.length > 0 ? (
          <div className="space-y-4">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} onUpdate={refetch} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-muted-foreground"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2" />
                  <path d="M14 5h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8.5" />
                  <path d="M4 14h.01" />
                  <path d="M4 18h.01" />
                  <path d="M8 17h4" />
                  <path d="M11 14h1" />
                  <path d="M18 12v8" />
                  <path d="M9 18v2" />
                  <path d="M12 18v2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No Bots Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any bots yet. Get started by adding your first bot.
              </p>
              <Button onClick={() => setIsAddBotModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Your First Bot</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <AddBotModal 
        isOpen={isAddBotModalOpen} 
        onClose={() => setIsAddBotModalOpen(false)}
        onBotAdded={refetch}
      />
    </MainLayout>
  );
}
