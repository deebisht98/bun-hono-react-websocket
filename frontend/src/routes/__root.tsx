import { WebSocketProvider } from "@/contexts/webSocketProvider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <WebSocketProvider>
      <div className="flex h-screen w-screen items-center justify-center">
        <Outlet />
        <Toaster />
        {/* <TanStackRouterDevtools /> */}
      </div>
    </WebSocketProvider>
  ),
});
