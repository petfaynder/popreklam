export default function LoadingSpinner({ size = 'medium', color = 'lime' }) {
    const sizeClasses = {
        small: 'w-4 h-4 border-2',
        medium: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4'
    };

    const colorClasses = {
        lime: 'border-lime-400 border-t-transparent',
        sky: 'border-sky-400 border-t-transparent',
        white: 'border-white border-t-transparent'
    };

    return (
        <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
    );
}
