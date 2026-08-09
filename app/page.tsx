import { redirect } from "next/navigation";

// Ish qidiruvchi uchun bosh ekran — vakansiyalar ro'yxati.
export default function Home() {
  redirect("/jobs");
}
