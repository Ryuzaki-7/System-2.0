// src/components/StatRadar.tsx
import React from "react";
import Svg, { Polygon, Line, Text as SvgText } from "react-native-svg";
import { PlayerStats } from "../types/system";

interface StatRadarProps {
  stats: PlayerStats;
  maxStat?: number;
  size?: number;
}

export const StatRadar: React.FC<StatRadarProps> = ({
  stats,
  maxStat = 50,
  size = 220,
}) => {
  const center = size / 2;
  const radius = size * 0.35;

  // The 5 stat axes
  const statKeys: (keyof PlayerStats)[] = ["STR", "AGI", "VIT", "INT", "PER"];

  // Calculate coordinates for a given value and axis index
  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const distance = (value / maxStat) * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    };
  };

  // Generate the points for the outer pentagon grid
  const outerPoints = statKeys.map((_, i) => getCoordinates(maxStat, i));
  const outerPath = outerPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Generate the points for the player's actual stats
  const playerPoints = statKeys.map((key, i) =>
    getCoordinates(Math.min(stats[key], maxStat), i),
  );
  const playerPath = playerPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={size} height={size}>
      {/* Draw the outer grid and axis lines */}
      <Polygon
        points={outerPath}
        fill="rgba(0, 212, 255, 0.05)"
        stroke="rgba(0, 212, 255, 0.3)"
        strokeWidth="1"
      />
      {outerPoints.map((p, i) => (
        <Line
          key={`line-${i}`}
          x1={center}
          y1={center}
          x2={p.x}
          y2={p.y}
          stroke="rgba(0, 212, 255, 0.3)"
          strokeWidth="1"
        />
      ))}

      {/* Draw the dynamic player stat polygon */}
      <Polygon
        points={playerPath}
        fill="rgba(0, 212, 255, 0.4)"
        stroke="#00d4ff"
        strokeWidth="2"
      />

      {/* Render Stat Labels */}
      {statKeys.map((key, i) => {
        const labelPos = getCoordinates(maxStat * 1.25, i);
        return (
          <SvgText
            key={`label-${i}`}
            x={labelPos.x}
            y={labelPos.y}
            fill="#8892b0"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {key}
          </SvgText>
        );
      })}
    </Svg>
  );
};
