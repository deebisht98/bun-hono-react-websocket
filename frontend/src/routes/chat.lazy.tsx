import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { hc } from "hono/client";

import {
  Message,
  MessageFormSchema,
  MessageFormValues,
  DataToSend,
} from "@shared/types";
import {
  BACKEND_DEV_WS_URL,
  BACKEND_DEV_URL,
  publishActions,
} from "@shared/constants";
import type { AppType } from "@server/index";

export const Route = createLazyFileRoute("/chat")({
  component: App,
});

const honoClient = hc<AppType>(BACKEND_DEV_URL);
const initialValues: MessageFormValues = {
  userId: Math.random().toString(36).slice(-8),
  text: "",
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [formValues, setFormValues] =
    useState<MessageFormValues>(initialValues);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await honoClient.messages.$get();
      if (!response.ok) {
        console.error("Failed to fetch messages");
        return;
      }
      const messages: Message[] = await response.json();
      setMessages(messages);
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`${BACKEND_DEV_WS_URL}/ws`);

    socket.onopen = (event) => {
      console.log("WebSocket client opened", event);
    };

    socket.onmessage = (event) => {
      try {
        const data: DataToSend = JSON.parse(event.data.toString());
        switch (data.action) {
          case publishActions.UPDATE_CHAT:
            setMessages((prev) => [...prev, data.message]);
            break;
          case publishActions.DELETE_CHAT:
            setMessages((prev) =>
              prev.filter((message) => message.id !== data.message.id),
            );
            break;
          default:
            console.error("Unknown data:", data);
        }
      } catch (_) {
        console.log("Message from server:", event.data);
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket client closed", event);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const validatedValues = MessageFormSchema.parse(formValues);
      const response = await honoClient.messages.$post({
        form: validatedValues,
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setFormValues(initialValues);
      setFormErrors([]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Form validation errors:", error.issues);
        setFormErrors(error.issues);
      } else {
        console.error("Error:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await honoClient.messages[":id"].$delete({
        param: { id: id.toString() },
      });
      if (!response.ok) {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-lg bg-gray-900 text-white">
      <div className="flex h-screen flex-col">
        <div className="mb-4 flex-grow overflow-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className="rounded-md border border-gray-800 p-2"
            >
              <div className="flex justify-between">
                <strong className="text-left">{message.userId}:</strong>
                <span className="text-right text-sm text-gray-500">
                  {message.date}
                </span>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="ml-2 rounded-md bg-red-500 p-1 text-xs text-white"
                >
                  Delete
                </button>
              </div>
              <div>{message.text}</div>
            </div>
          ))}
        </div>
        <div className="flex-none px-2 py-5">
          <form
            method="post"
            onSubmit={handleSubmit}
            className="flex items-center space-x-2"
          >
            <input name="userId" defaultValue={formValues.userId} hidden />
            <input
              name="text"
              value={formValues.text}
              onChange={handleInputChange}
              className="flex-grow rounded-md border border-gray-800 bg-gray-800 p-2 text-white"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-white"
            >
              Send
            </button>
          </form>
          {formErrors.length > 0 && (
            <>
              {formErrors.map((error) => (
                <div
                  key={error.path.join("-")}
                  className="mt-2 rounded-md border border-red-500 p-2 text-red-500"
                >
                  {error.message}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
