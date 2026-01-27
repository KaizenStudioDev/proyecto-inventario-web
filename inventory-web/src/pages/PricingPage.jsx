import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import { useDemo } from '../lib/DemoContext';

export default function PricingPage() {
    const navigate = useNavigate();
    const { startDemo } = useDemo();
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

    const handleDemoLaunch = (license) => {
        startDemo(license);
        navigate('/app/dashboard');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            <LandingNav />

            {/* Hero */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        Precios de lanzamiento
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                        Planes transparentes <br className="hidden md:block" />
                        <span className="text-gray-500 dark:text-gray-400">para negocios reales</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Pagas una solaz vez la licencia del sistema. <br />
                        La membresía mensual opcional cubre soporte prioritario, copias de seguridad y actualizaciones.
                    </p>
                </div>
            </section>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex items-center relative">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${billingCycle === 'monthly'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Mensual
                    </button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${billingCycle === 'annual'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Anual <span className="text-green-600 dark:text-green-400 text-xs ml-1 font-bold">-16%</span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <section className="pb-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Basic Tier */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-lg transition-all duration-300 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Opero básico</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Para tiendas y emprendimientos.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$120.000</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ única vez</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    {billingCycle === 'monthly' ? (
                                        <span>+ $20.000 / mes (Soporte)</span>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span>+ $200.000 / año (Soporte)</span>
                                            <span className="text-xs text-green-600 font-medium">Ahorras $40.000</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Control de Inventario Básico</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Alertas de Stock Bajo</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Catálogo de Productos</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handleDemoLaunch('basic')}
                                className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Probar Demo Básico
                            </button>
                        </div>

                        {/* Sales Tier */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-blue-600 dark:border-blue-500 shadow-xl relative overflow-hidden flex flex-col transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                Más Popular
                            </div>
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Opero ventas</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Negocios con flujo diario.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$220.000</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ única vez</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    {billingCycle === 'monthly' ? (
                                        <span>+ $35.000 / mes (Soporte)</span>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span>+ $350.000 / año (Soporte)</span>
                                            <span className="text-xs text-green-600 font-medium">Ahorras $70.000</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500 mt-0.5">✓</span>
                                    <span className="font-medium">Todo lo de Básico</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500 mt-0.5">✓</span>
                                    <span>Punto de Venta (POS)</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500 mt-0.5">✓</span>
                                    <span>Base de Datos Clientes</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500 mt-0.5">✓</span>
                                    <span>Reportes de Ventas</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handleDemoLaunch('sales')}
                                className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200/50"
                            >
                                Probar Demo Ventas
                            </button>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 shadow-lg transition-all duration-300 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Opero empresarial</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gestión y control total.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$420.000</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ única vez</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    {billingCycle === 'monthly' ? (
                                        <span>+ $60.000 / mes (Soporte)</span>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span>+ $600.000 / año (Soporte)</span>
                                            <span className="text-xs text-green-600 font-medium">Ahorras $120.000</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500 mt-0.5">✓</span>
                                    <span className="font-medium">Todo lo de Ventas</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500 mt-0.5">✓</span>
                                    <span>Gestión de Proveedores</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500 mt-0.5">✓</span>
                                    <span>Órdenes de Compra</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500 mt-0.5">✓</span>
                                    <span>Analítica Avanzada</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handleDemoLaunch('enterprise')}
                                className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Probar Demo Enterprise
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">Comparación rápida</h2>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Producto</th>
                                    <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Licencia (Única vez)</th>
                                    <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Soporte ({billingCycle === 'monthly' ? 'Mensual' : 'Anual'})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                <tr>
                                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">Opero básico</td>
                                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">$120.000 COP</td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{billingCycle === 'monthly' ? '$20.000 COP' : '$200.000 COP'}</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">Opero ventas</td>
                                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">$220.000 COP</td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{billingCycle === 'monthly' ? '$35.000 COP' : '$350.000 COP'}</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">Opero empresarial</td>
                                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">$420.000 COP</td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{billingCycle === 'monthly' ? '$60.000 COP' : '$600.000 COP'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            * Precios en Pesos Colombianos (COP). El soporte incluye asistencia técnica prioritaria, copias de seguridad automáticas y actualizaciones de nuevas funciones.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
