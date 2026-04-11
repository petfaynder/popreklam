import { FileQuestion, Inbox, Search, TrendingUp, AlertCircle, PackageOpen } from 'lucide-react';

const emptyStateConfigs = {
    'no-data': {
        icon: Inbox,
        iconColor: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        title: 'No Data Available',
        description: 'There is no data to display yet.',
    },
    'no-sites': {
        icon: PackageOpen,
        iconColor: 'text-lime-400',
        bgColor: 'bg-lime-500/10',
        title: 'No Sites Yet',
        description: 'Add your first site to start earning revenue from ads.',
        actionText: 'Add Site',
        actionHref: '/publisher/sites/add'
    },
    'no-campaigns': {
        icon: TrendingUp,
        iconColor: 'text-sky-400',
        bgColor: 'bg-sky-500/10',
        title: 'No Campaigns Yet',
        description: 'Create your first campaign to start advertising.',
        actionText: 'Create Campaign',
        actionHref: '/advertiser/campaigns/create'
    },
    'no-results': {
        icon: Search,
        iconColor: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        title: 'No Results Found',
        description: 'Try adjusting your search or filters.',
    },
    'error': {
        icon: AlertCircle,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        title: 'Something Went Wrong',
        description: 'We encountered an error loading this data.',
        actionText: 'Try Again'
    },
    'not-found': {
        icon: FileQuestion,
        iconColor: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        title: 'Not Found',
        description: 'The item you are looking for does not exist.',
    }
};

export default function EmptyState({
    type = 'no-data',
    icon: CustomIcon,
    title,
    description,
    actionText,
    actionHref,
    onAction,
    action,
    children
}) {
    const config = emptyStateConfigs[type] || emptyStateConfigs['no-data'];
    const Icon = CustomIcon || config.icon;
    const finalTitle = title || config.title;
    const finalDescription = description || config.description;
    const finalActionText = actionText || config.actionText;
    const finalActionHref = actionHref || config.actionHref;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className={`w-20 h-20 rounded-2xl ${config.bgColor} flex items-center justify-center mb-6`}>
                <Icon className={`w-10 h-10 ${config.iconColor}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{finalTitle}</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">{finalDescription}</p>

            {children || action}

            {!children && !action && finalActionText && (
                <div className="flex gap-3">
                    {finalActionHref ? (
                        <a
                            href={finalActionHref}
                            className="px-6 py-2.5 bg-lime-400 hover:bg-lime-500 rounded-xl text-black font-medium transition-all"
                        >
                            {finalActionText}
                        </a>
                    ) : onAction ? (
                        <button
                            onClick={onAction}
                            className="px-6 py-2.5 bg-lime-400 hover:bg-lime-500 rounded-xl text-black font-medium transition-all"
                        >
                            {finalActionText}
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
}
