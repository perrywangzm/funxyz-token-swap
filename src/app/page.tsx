import { TokenPriceExplorer } from "@/modules/tokens";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <TokenPriceExplorer />
    </div>
  );
}
