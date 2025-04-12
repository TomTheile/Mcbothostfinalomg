import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const botSchema = z.object({
  name: z.string().min(3, "Bot name must be at least 3 characters").max(16, "Bot name must not exceed 16 characters"),
  serverAddress: z.string().min(1, "Server address is required"),
  serverPort: z.coerce.number().int().min(1).max(65535).default(25565),
  gameVersion: z.string().default("1.19.2"),
  behavior: z.enum(["passive", "active"]).default("passive"),
  autoReconnect: z.boolean().default(false),
  recordChat: z.boolean().default(false),
});

type BotFormValues = z.infer<typeof botSchema>;

interface AddBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBotAdded: () => void;
}

export default function AddBotModal({ isOpen, onClose, onBotAdded }: AddBotModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<BotFormValues>({
    resolver: zodResolver(botSchema),
    defaultValues: {
      name: "",
      serverAddress: "",
      serverPort: 25565,
      gameVersion: "1.21.4",
      behavior: "passive",
      autoReconnect: false,
      recordChat: false,
    },
  });

  const addBotMutation = useMutation({
    mutationFn: async (data: BotFormValues) => {
      const res = await apiRequest("POST", "/api/bots", {
        ...data,
        userId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot Added",
        description: "The bot has been added successfully",
      });
      onBotAdded();
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add bot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BotFormValues) => {
    addBotMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Bot</DialogTitle>
          <DialogDescription>
            Configure your bot to connect to a Minecraft server
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SurvivalBot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serverAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Address</FormLabel>
                  <FormControl>
                    <Input placeholder="play.server.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serverPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25565" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 25565)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gameVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Version</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1.21.4">1.21.4</SelectItem>
                        <SelectItem value="1.20.4">1.20.4</SelectItem>
                        <SelectItem value="1.20.2">1.20.2</SelectItem>
                        <SelectItem value="1.20.1">1.20.1</SelectItem>
                        <SelectItem value="1.19.4">1.19.4</SelectItem>
                        <SelectItem value="1.19.3">1.19.3</SelectItem>
                        <SelectItem value="1.19.2">1.19.2</SelectItem>
                        <SelectItem value="1.19.1">1.19.1</SelectItem>
                        <SelectItem value="1.19">1.19</SelectItem>
                        <SelectItem value="1.18.2">1.18.2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="behavior"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Bot Behavior</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-muted">
                        <FormControl>
                          <RadioGroupItem value="passive" id="passive" />
                        </FormControl>
                        <FormLabel className="cursor-pointer" htmlFor="passive">
                          <div className="font-medium">Passive</div>
                          <div className="text-xs text-muted-foreground">Will not attack entities</div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-muted">
                        <FormControl>
                          <RadioGroupItem value="active" id="active" />
                        </FormControl>
                        <FormLabel className="cursor-pointer" htmlFor="active">
                          <div className="font-medium">Active</div>
                          <div className="text-xs text-muted-foreground">Will defend itself</div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Advanced Options</h4>
              <div className="bg-muted rounded-md p-3 space-y-3">
                <FormField
                  control={form.control}
                  name="autoReconnect"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Auto-reconnect on disconnect</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordChat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Record chat messages</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addBotMutation.isPending}
              >
                {addBotMutation.isPending ? "Creating..." : "Create Bot"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}