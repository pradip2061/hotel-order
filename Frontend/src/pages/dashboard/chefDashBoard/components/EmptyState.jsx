export default function EmptyState() {
  return (
    <div className="border border-[#D6B894] rounded-xl py-24 text-center bg-[#FBF7F1] shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E3E8E1] flex items-center justify-center">
        <span className="text-[#2F5D3A] text-3xl">✓</span>
      </div>
      <h2 className="text-2xl font-semibold text-[#6B3E1E] mb-2">
        All Caught Up!
      </h2>
      <p className="text-[#8A6A4F]">
        No pending orders in the kitchen
      </p>
    </div>
  );
}
