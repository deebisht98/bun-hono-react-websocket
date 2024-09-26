import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/lobby")({
  component: () => <Lobby />,
});

function Lobby() {
  return <h1>Lobby</h1>;
}
