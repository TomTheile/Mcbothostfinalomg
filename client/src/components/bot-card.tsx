import { useState } from "react";
import { Bot } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Play, RefreshCw, StopCircle } from "lucide-react";
import { formatDistance } from "date-fns";

interface BotCardProps {
  bot: Bot;
  onUpdate: () => void;
}

export default function BotCard({ bot, onUpdate }: BotCardProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Get bot detailed status if connected
  const { data: botStatus } = useQuery({
    queryKey: [`/api/bots/${bot.id}/status`],
    enabled: bot.status === "connected",
    refetchInterval: 10000, // Refresh every 10 seconds when connected
  });

  // Convert status to user-friendly display
  const getStatusDisplay = () => {
    switch (bot.status) {
      case "connected":
        return { 
          text: "Connected", 
          color: "text-secondary",
          indicatorColor: "bg-secondary"
        };
      case "connecting":
        return { 
          text: "Connecting", 
          color: "text-yellow-500",
          indicatorColor: "bg-yellow-500"
        };
      case "disconnected":
        return { 
          text: "Disconnected", 
          color: "text-muted-foreground",
          indicatorColor: "bg-gray-400"
        };
      case "error":
        return { 
          text: "Connection Error", 
          color: "text-destructive",
          indicatorColor: "bg-destructive"
        };
      default:
        return { 
          text: bot.status, 
          color: "text-muted-foreground",
          indicatorColor: "bg-gray-400"
        };
    }
  };
  
  const statusDisplay = getStatusDisplay();
  
  // Get time since last connection
  const getTimeSince = (dateString?: string | null) => {
    if (!dateString) return "Never";
    
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };
  
  // Format time online if connected
  const getTimeOnline = () => {
    if (bot.status !== "connected" || !bot.lastConnection) return null;
    
    try {
      const lastConnection = new Date(bot.lastConnection);
      return formatDistance(lastConnection, new Date(), { includeSeconds: true });
    } catch (error) {
      return null;
    }
  };

  // Connect the bot
  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/bots/${bot.id}/connect`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot Connected",
        description: `${bot.name} is now connecting to ${bot.serverAddress}`,
      });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disconnect the bot
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/bots/${bot.id}/disconnect`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot Disconnected",
        description: `${bot.name} has been disconnected from the server`,
      });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-600 dark:text-gray-300"
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
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusDisplay.indicatorColor} rounded-full border-2 border-background`}></span>
          </div>
          <div>
            <h3 className="font-medium">{bot.name}</h3>
            <div className="flex items-center text-sm">
              <span className={statusDisplay.color}>{statusDisplay.text}</span>
              {bot.serverAddress && (
                <>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="font-mono text-xs text-muted-foreground">{bot.serverAddress}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="icon" variant="outline" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          {bot.status === "connected" || bot.status === "connecting" ? (
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-8 w-8" 
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : bot.status === "error" ? (
            <Button 
              size="icon" 
              variant="outline" 
              className="h-8 w-8 text-primary" 
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${connectMutation.isPending ? "animate-spin" : ""}`} />
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="default" 
              className="h-8 w-8 bg-secondary hover:bg-secondary/90" 
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      {bot.status === "error" && bot.error && (
        <div className="p-4 bg-destructive/5">
          <div className="flex items-start">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0"
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
              <h4 className="font-medium text-destructive">Connection Failed</h4>
              <p className="text-sm mt-1">{bot.error}</p>
              <div className="mt-4 flex space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {bot.status === "disconnected" && (
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Server Address</label>
              <div className="text-sm font-mono bg-muted/50 p-2 rounded">
                {bot.serverAddress}:{bot.serverPort || 25565}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Game Version</label>
              <div className="text-sm font-mono bg-muted/50 p-2 rounded">
                {bot.gameVersion || "1.19.2"}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              className="w-full"
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              {connectMutation.isPending ? "Connecting..." : "Connect Bot"}
            </Button>
          </div>
        </CardContent>
      )}
      
      {(bot.status === "connected" || bot.status === "connecting") && (
        <CardContent className="p-4 bg-muted/30">
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">
                {bot.status === "connected" && getTimeOnline() 
                  ? `Online for ${getTimeOnline()}`
                  : statusDisplay.text}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Server:</span>
              <span className="font-mono text-xs">{bot.serverAddress}:{bot.serverPort || 25565}</span>
            </div>
            {botStatus?.playerCount && (
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Players Online:</span>
                <span>{botStatus.playerCount}</span>
              </div>
            )}
            {botStatus?.position && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position:</span>
                <span className="font-mono text-xs">
                  {botStatus.position.x}, {botStatus.position.y}, {botStatus.position.z}
                </span>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
          </div>
          
          {showDetails && (
            <div className="mt-4 bg-muted/50 p-3 rounded text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Bot Name:</span>
                <span>{bot.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Game Version:</span>
                <span>{bot.gameVersion || "1.19.2"}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Connected At:</span>
                <span>{getTimeSince(bot.lastConnection)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Behavior:</span>
                <span className="capitalize">{bot.behavior || "passive"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto Reconnect:</span>
                <span>{bot.autoReconnect ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
