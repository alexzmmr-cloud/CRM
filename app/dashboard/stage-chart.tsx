"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { OPPORTUNITY_STAGES, OPPORTUNITY_STAGE_LABELS } from "@/lib/opportunity";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function StageChart({
  data,
}: {
  data: Record<(typeof OPPORTUNITY_STAGES)[number], number>;
}) {
  return (
    <Bar
      data={{
        labels: OPPORTUNITY_STAGES.map((stage) => OPPORTUNITY_STAGE_LABELS[stage]),
        datasets: [
          {
            label: "Сделок",
            data: OPPORTUNITY_STAGES.map((stage) => data[stage]),
            backgroundColor: "#5b8cff",
            borderRadius: 6,
            maxBarThickness: 40,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: "#8b8da3" },
            grid: { color: "#2b2d3d" },
          },
          x: {
            ticks: { color: "#8b8da3" },
            grid: { display: false },
          },
        },
      }}
    />
  );
}
