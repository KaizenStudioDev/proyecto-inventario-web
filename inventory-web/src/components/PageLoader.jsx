export default function PageLoader({ message = "Loading module..." }) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] animate-fade-in">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-100 dark:border-gray-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-primary-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">{message}</p>
            </div>
        </div>
    );
}
