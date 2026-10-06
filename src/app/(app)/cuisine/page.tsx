import { redirect } from "next/navigation";

// Le stock arrive au bloc 5 ; en attendant, la section Cuisine ouvre la base d'aliments.
export default function CuisinePage() {
  redirect("/cuisine/aliments");
}
