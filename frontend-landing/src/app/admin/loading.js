import { DashboardSkeleton } from '@/components/LoadingSkeleton';

export default function AdminLoading() {
    return (
        <div className="relative z-10 p-2">
            <DashboardSkeleton />
        </div>
    );
}
