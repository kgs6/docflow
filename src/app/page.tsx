import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getSession();

  if (user) {
    if (user.role === "MANAGER") {
      redirect("/inbox");
    } else {
      redirect("/my-documents");
    }
  }

  redirect("/login");
}
