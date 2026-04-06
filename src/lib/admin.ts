import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }
}
