export function CardSkeleton() {
    return (
        <div className="glass-premium p-6 rounded-3xl animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl" />
                <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded-lg w-24 mb-2" />
                    <div className="h-6 bg-white/10 rounded-lg w-32" />
                </div>
            </div>
            <div className="h-3 bg-white/5 rounded w-20" />
        </div>
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className="glass-premium p-6 rounded-3xl">
            <div className="h-6 bg-white/10 rounded-lg w-48 mb-6 animate-pulse" />
            <div className="space-y-3">
                {/* Header */}
                <div className="flex gap-4 pb-3 border-b border-white/10">
                    {Array.from({ length: columns }).map((_, i) => (
                        <div key={i} className="flex-1 h-4 bg-white/10 rounded animate-pulse" />
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4 py-2">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div key={colIndex} className="flex-1 h-4 bg-white/5 rounded animate-pulse" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="glass-premium p-6 rounded-3xl">
            <div className="h-6 bg-white/10 rounded-lg w-40 mb-6 animate-pulse" />
            <div className="h-[300px] flex items-end gap-2">
                {Array.from({ length: 12 }).map((_, i) => {
                    const height = Math.random() * 80 + 20;
                    return (
                        <div
                            key={i}
                            className="flex-1 bg-white/5 rounded-t animate-pulse"
                            style={{ height: `${height}%` }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function ListSkeleton({ items = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="glass-premium p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-white/10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                    <div className="w-20 h-8 bg-white/10 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 bg-white/10 rounded-lg w-64 mb-2 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded w-48 animate-pulse" />
                </div>
                <div className="flex gap-3">
                    <div className="w-32 h-10 bg-white/10 rounded-xl animate-pulse" />
                    <div className="w-40 h-10 bg-white/10 rounded-xl animate-pulse" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            {/* Table */}
            <TableSkeleton rows={5} columns={5} />
        </div>
    );
}
