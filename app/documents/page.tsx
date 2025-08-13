// app/documents/page.tsx  (ou /docs/page.tsx selon votre menu)
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/galerie?tab=documents");
}
