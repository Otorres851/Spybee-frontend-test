import { redirect } from "next/navigation";
import { routes } from "@/router/routes";

export default function Home() {
  redirect(routes.login);
}
