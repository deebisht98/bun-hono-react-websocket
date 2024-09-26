import { z } from "zod";
import { publishActions, trackerActions } from "./constants";

export const MessageFormSchema = z.object({
  userId: z.string().min(1),
  text: z.string().trim().min(1),
});
export const RoomFormSchema = z.object({
  userName: z.string().min(1),
  roomKey: z.string().trim().min(1),
});

export type MessageFormValues = z.infer<typeof MessageFormSchema>;
export type RoomFormValues = z.infer<typeof RoomFormSchema>;

type PublishAction = (typeof publishActions)[keyof typeof publishActions];
type TrackerAction = (typeof trackerActions)[keyof typeof trackerActions];

export type Message = { id: number; date: string } & MessageFormValues;
export type Room = string;

export type DataToSend = {
  action: PublishAction;
  message: Message;
};

export type TrackerDetails = {
  action: TrackerAction;
  title: string;
  description: string;
  sender: string;
};

export interface WebSocketContextType {
  socket: WebSocket | null;
}
