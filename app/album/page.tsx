// app/album/page.tsx
import { redirect } from "next/navigation";

export default function AlbumIndexPage() {
  redirect("/albums"); // on renvoie vers la liste des albums
}
