import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                className: 'text-sm font-medium',
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: 'white',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}
