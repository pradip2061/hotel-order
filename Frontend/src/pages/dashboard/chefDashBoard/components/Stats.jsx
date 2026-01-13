export  default function Stats() {
  const data = [
    { label: "Active Orders", value: 1, color: "#C97A2B" },
    { label: "Items Ready", value: 0, color: "#2F5D3A" },
    { label: "Items Pending", value: 1, color: "#C97A2B" },
    { label: "Total Items", value: 1, color: "#C97A2B" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
      {data.map((item, i) => (
        <div
          key={i}
          className="border border-[#D6B894] rounded-xl py-6 text-center bg-[#FBF7F1] shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
        >
          <p
            className="text-2xl font-semibold"
            style={{ color: item.color }}
          >
            {item.value}
          </p>
          <p className="text-[#6B3E1E] mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
