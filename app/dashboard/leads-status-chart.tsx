"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/lead";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#5b8cff", "#34d399", "#8b8da3"];

export function LeadsStatusChart({
  data,
}: {
  data: Record<(typeof LEAD_STATUSES)[number], number>;
}) {
  return (
    <Pie
      data={{
        labels: LEAD_STATUSES.map((status) => LEAD_STATUS_LABELS[status]),
        datasets: [
          {
            data: LEAD_STATUSES.map((status) => data[status]),
            backgroundColor: COLORS,
            borderColor: "#1b1d29",
            borderWidth: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#8b8da3" } },
        },
      }}
    />
  );
}
