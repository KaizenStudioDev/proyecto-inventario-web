import { useNavigate } from 'react-router-dom';
import { useDemo } from '../lib/DemoContext';

export default function LockedFeature({ featureName, requiredLicense }) {
    const navigate = useNavigate();
    const { startDemo } = useDemo();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4">
                🔒
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{featureName} Locked</h2>
            <p className="text-gray-600 max-w-md mb-8">
                This feature is part of the <strong>{requiredLicense}</strong> plan.
                Upgrade your license to unlock complete control over {featureName.toLowerCase()}.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/demo')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                    Switch License
                </button>
                <button
                    onClick={() => navigate('/app/dashboard')}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
