// tailwind.config.js (Tailwind v4)
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F2",
        card: "#EFE2CF",
        border: "#D2B48C",
        brown: "#6B3E1E",
        accent: "#C97A2B",
        green: "#2F5D3A",
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)",
      },
    },
  },
};
