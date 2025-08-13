// app/photos/page.tsx
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/galerie?tab=images");
}
