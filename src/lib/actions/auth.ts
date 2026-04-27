"use server";

import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password");
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  if (user.role === "MANAGER") {
    redirect("/inbox");
  } else {
    redirect("/my-documents");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
  });
}
