import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useEffect, useState } from "react";
import { TrackerDetails } from "@shared/types";
import { useWebSocket } from "@/contexts/webSocketProvider";
import { useToast } from "@/hooks/use-toast";
import { trackerActions } from "@shared/constants";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const [roomKey, setRoomKey] = useState("");
  const [userName, setUserName] = useState("");

  const { socket } = useWebSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      try {
        const data: TrackerDetails = JSON.parse(event.data.toString());
        switch (data.action) {
          case trackerActions.ADD_USER:
            console.log({ sender: data.sender, userName });
            if (data.sender !== userName) {
              toast({
                title: data.title,
                description: data.description,
              });
            }
            setRoomKey("");
            setUserName("");
            navigate({ to: "/lobby" });
            break;
          case trackerActions.ERROR:
            toast({
              variant: "destructive",
              title: data.title,
              description: data.description,
            });
            setRoomKey("");
            setUserName("");
            break;
          default:
            console.error("Unknown data:", data);
        }
      } catch (_) {
        console.error(_);
        console.log("Message from server:", event.data);
      }
    };
  }, [socket, userName]);

  const hanldeRoomJoin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket &&
      socket.send(
        JSON.stringify({
          userName,
          roomKey,
        }),
      );
  };

  return (
    <form onSubmit={hanldeRoomJoin} method="post">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Hello there!</CardTitle>
          <CardDescription>
            Welcome! Track your loved ones easily here!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="room">Username</Label>
            <Input
              id="room"
              type="text"
              value={userName}
              placeholder="*********"
              required
              onChange={(e) => setUserName(e.target.value.trim())}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room">Secret Key</Label>
            <Input
              id="room"
              type="text"
              value={roomKey}
              placeholder="*********"
              required
              onChange={(e) => setRoomKey(e.target.value.trim())}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Join
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
