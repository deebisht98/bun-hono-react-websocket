import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";

import {
  Message,
  MessageFormSchema,
  DataToSend,
  Room,
  RoomFormSchema,
  RoomFormValues,
} from "../shared/types";
import {
  FRONTEND_DEV_URL,
  BACKEND_DEV_URL,
  publishActions,
  trackerActions,
} from "../shared/constants";

const app = new Hono();
app.use("*", cors({ origin: FRONTEND_DEV_URL }));

const { upgradeWebSocket, websocket } = createBunWebSocket();
const server = Bun.serve({
  fetch: app.fetch,
  port: BACKEND_DEV_URL.split(":")[2],
  //// No// No
  //@ts-ignore
  websocket,
});

const topic = "anonymous-chat-room";
const messages: Message[] = [];
const rooms: Room[] = ["new123"];

const messagesRoute = app
  .get("/messages", (c) => {
    return c.json(messages);
  })
  .post(
    "/messages",
    zValidator("form", MessageFormSchema, (result, c) => {
      if (!result.success) {
        return c.json({ ok: false }, 400);
      }
    }),
    async (c) => {
      const param = c.req.valid("form");
      const currentDateTime = new Date();
      const message: Message = {
        id: Number(currentDateTime),
        date: currentDateTime.toLocaleString(),
        ...param,
      };
      const data: DataToSend = {
        action: publishActions.UPDATE_CHAT,
        message: message,
      };

      messages.push(message);
      server.publish(topic, JSON.stringify(data));

      return c.json({ ok: true });
    }
  )
  .delete("/messages/:id", (c) => {
    const messageId = parseInt(c.req.param("id"));
    const index = messages.findIndex((message) => message.id === messageId);

    if (index === -1) {
      return c.json({ ok: false, error: "Message not found" }, 404);
    }

    const data: DataToSend = {
      action: publishActions.DELETE_CHAT,
      message: messages[index],
    };

    messages.splice(index, 1);
    server.publish(topic, JSON.stringify(data));

    return c.json({ ok: true });
  });

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(_, ws) {
        console.log("WebSocket socket connection opened.");
      },
      onMessage(_, ws) {
        const rawWs = ws.raw as ServerWebSocket;
        const data: RoomFormValues = JSON.parse(_.data.toString());
        if (!rooms.includes(data.roomKey)) {
          ws.send(
            JSON.stringify({
              action: trackerActions.ERROR,
              title: "Invalid secret key!",
              description: "Please enter a valid secret key.",
            })
          );
          return;
        }
        rawWs.subscribe(data.roomKey);
        console.log(
          `Username ${data.userName} and subscribed to topic '${data.roomKey}'`
        );
        server.publish(
          data.roomKey,
          JSON.stringify({
            action: trackerActions.ADD_USER,
            title: "User joined",
            description: `${data.userName} joined the room`,
            sender: data.userName,
          })
        );
      },
      onClose(_, ws) {
        console.log("WebSocket socket connection closed.");
      },
    };
  })
);

const roomsRoute = app
  .get("/rooms", (c) => {
    return c.json(rooms);
  })
  .post(
    "/rooms",
    zValidator("form", RoomFormSchema, (result, c) => {
      if (!result.success) {
        return c.json({ ok: false }, 400);
      }
    }),
    async (c) => {
      // const param = c.req.valid("form");
      // const { roomKey, userName } = param;
      // const data: TrackerDetails = {
      //   action: trackerActions.ADD_USER,
      //   userName,
      // };

      // rooms.push(roomKey);
      // server.publish(roomKey, JSON.stringify(data));

      return c.json({ ok: true });
    }
  );

export default app;
export type AppType = typeof messagesRoute & typeof roomsRoute;
