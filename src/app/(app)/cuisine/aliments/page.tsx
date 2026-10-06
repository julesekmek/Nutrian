import type { Metadata } from "next";
import { getFoods } from "@/lib/data/foods";
import { CuisineHeader } from "../CuisineHeader";
import { FoodBrowser } from "./FoodBrowser";

export const metadata: Metadata = { title: "Aliments" };

export default async function FoodsPage() {
  const foods = await getFoods();
  return (
    <>
      <CuisineHeader />
      <FoodBrowser foods={foods} />
    </>
  );
}
