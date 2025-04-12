import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AddBotModal from "@/components/add-bot-modal";
import BotCard from "@/components/bot-card";
import { Bot } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BotsPage() {
  const { user } = useAuth();
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, connected, disconnected, error
  
  const { data: bots, isLoading, isError, error, refetch } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
    enabled: !!user,
  });

  // Filter and search bots
  const filteredBots = bots?.filter(bot => {
    // Apply status filter
    if (filter === "connected" && bot.status !== "connected") return false;
    if (filter === "disconnected" && bot.status !== "disconnected") return false;
    if (filter === "error" && bot.status !== "error") return false;
    
    // Apply search filter
    if (searchTerm && !bot.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !bot.serverAddress.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">My Bots</h1>
          <Button 
            className="mt-3 md:mt-0"
            onClick={() => setIsAddBotModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Bot</span>
          </Button>
        </div>
        
        {/* Filters and Search */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bots by name or server"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="connected">Connected</TabsTrigger>
              <TabsTrigger value="disconnected">Disconnected</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Bots List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your bots...</p>
          </div>
        ) : isError ? (
          <div className="bg-destructive/10 border border-destructive rounded-md p-4">
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
          </div>
        ) : filteredBots && filteredBots.length > 0 ? (
          filteredBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} onUpdate={refetch} />
          ))
        ) : bots && bots.length > 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Matching Bots</h3>
            <p className="text-muted-foreground">
              No bots match your current filters. Try adjusting your search or filter criteria.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md">
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
          </div>
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
