export default function Squiggle({
  width = 220,
  color = "#fa7e19",
}: {
  width?: number;
  color?: string;
}) {
  return (
    <svg
      width={width}
      height="14"
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <path
        d="M3 9 C 30 2, 55 13, 85 7 S 140 3, 165 9 S 200 6, 217 8"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
