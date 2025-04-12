import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Bot } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw } from "lucide-react";

export default function LogsPage() {
  const [selectedBot, setSelectedBot] = useState<string>("all");
  const [logType, setLogType] = useState<string>("chat");

  // Get all bots to populate the filter dropdown
  const { data: bots } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
  });

  // Simulated logs data - in a real app, this would come from an API
  const [logs, setLogs] = useState<Array<{
    timestamp: Date;
    botId: number;
    botName: string;
    type: string;
    message: string;
  }>>([]);

  useEffect(() => {
    // Generate some demo log entries when bots data changes
    if (bots && bots.length > 0) {
      const demoLogs = [];
      
      // Connection logs
      for (const bot of bots) {
        if (bot.lastConnection) {
          demoLogs.push({
            timestamp: new Date(bot.lastConnection),
            botId: bot.id,
            botName: bot.name,
            type: "connection",
            message: `Connected to ${bot.serverAddress}:${bot.serverPort}`
          });
        }
        
        if (bot.lastDisconnection) {
          demoLogs.push({
            timestamp: new Date(bot.lastDisconnection),
            botId: bot.id,
            botName: bot.name,
            type: "connection",
            message: `Disconnected from ${bot.serverAddress}:${bot.serverPort}`
          });
        }
        
        // Add error logs if there are any
        if (bot.error) {
          demoLogs.push({
            timestamp: new Date(bot.lastDisconnection || new Date()),
            botId: bot.id,
            botName: bot.name,
            type: "error",
            message: bot.error
          });
        }
        
        // Add some chat logs
        if (bot.status === "connected" && bot.recordChat) {
          const playerNames = ["Steve", "Alex", "Notch", "Herobrine", "Creeper123"];
          const chatMessages = [
            "Hello everyone!",
            "Anyone want to trade?",
            "Watch out, there's a creeper behind you!",
            "I found diamonds!",
            "Who built that amazing castle?",
            "Can someone help me with my farm?"
          ];
          
          // Add 3-5 chat messages for each connected bot
          const chatCount = Math.floor(Math.random() * 3) + 3;
          for (let i = 0; i < chatCount; i++) {
            const playerIndex = Math.floor(Math.random() * playerNames.length);
            const messageIndex = Math.floor(Math.random() * chatMessages.length);
            
            demoLogs.push({
              timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time in the last hour
              botId: bot.id,
              botName: bot.name,
              type: "chat",
              message: `<${playerNames[playerIndex]}> ${chatMessages[messageIndex]}`
            });
          }
        }
      }
      
      // Sort logs by timestamp, newest first
      demoLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setLogs(demoLogs);
    }
  }, [bots]);

  // Filter logs based on selected bot and log type
  const filteredLogs = logs.filter(log => {
    if (selectedBot !== "all" && log.botId !== parseInt(selectedBot)) {
      return false;
    }
    
    if (logType !== "all" && log.type !== logType) {
      return false;
    }
    
    return true;
  });

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Bot Logs</h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Select value={selectedBot} onValueChange={setSelectedBot}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Bot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bots</SelectItem>
                {bots?.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id.toString()}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={logType} onValueChange={setLogType} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Logs</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="connection">Connections</TabsTrigger>
              <TabsTrigger value="error">Errors</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Logs Panel */}
      <Card>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg">Log Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`p-3 flex flex-col md:flex-row md:items-center ${
                    log.type === 'error' ? 'bg-destructive/5' : 
                    log.type === 'connection' ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="md:w-48 flex-shrink-0 text-sm text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className="md:w-32 flex-shrink-0 font-medium">
                    {log.botName}
                  </div>
                  <div className="flex-grow">
                    <span className={`${
                      log.type === 'error' ? 'text-destructive' : 
                      log.type === 'connection' ? 'text-secondary' : ''
                    }`}>
                      {log.message}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="rounded-full bg-muted w-12 h-12 mx-auto flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No logs found</h3>
                <p className="text-muted-foreground">
                  {selectedBot !== "all" || logType !== "all" 
                    ? "Try changing your filter settings" 
                    : "There are no logs to display yet"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
