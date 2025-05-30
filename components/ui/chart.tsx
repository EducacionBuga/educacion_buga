"\"use client"
import { Chart as ChartJS, registerables } from "chart.js"
import { Bar, Line, Pie, Doughnut, Radar, Scatter, Bubble, PolarArea } from "react-chartjs-2"

ChartJS.register(...registerables)

interface ChartProps {
  type: "bar" | "line" | "pie" | "doughnut" | "radar" | "scatter" | "bubble" | "polarArea"
  data: any
  options?: any
}

export function Chart({ type, data, options }: ChartProps) {
  switch (type) {
    case "bar":
      return <Bar data={data} options={options} />
    case "line":
      return <Line data={data} options={options} />
    case "pie":
      return <Pie data={data} options={options} />
    case "doughnut":
      return <Doughnut data={data} options={options} />
    case "radar":
      return <Radar data={data} options={options} />
    case "scatter":
      return <Scatter data={data} options={options} />
    case "bubble":
      return <Bubble data={data} options={options} />
    case "polarArea":
      return <PolarArea data={data} options={options} />
    default:
      return <div>Unsupported chart type</div>
  }
}
