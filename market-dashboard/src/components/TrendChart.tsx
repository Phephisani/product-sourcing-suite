import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
// import { useProductStore } from "@/lib/store"

const data = [
    {
        name: "Mon",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Tue",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Wed",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Thu",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Fri",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Sat",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Sun",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
]

export function TrendChart() {
    // const { products } = useProductStore()

    // Real usage would derive data from product price history
    // For now, we mock global trend

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R${value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
