import { useState } from 'react';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        reason: 'Soporte Técnico',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionPromise = async () => {
            const { error } = await supabase
                .from('contact_submissions')
                .insert([formData]);

            if (error) throw error;
        };

        toast.promise(
            submissionPromise(),
            {
                loading: 'Enviando mensaje...',
                success: '¡Mensaje enviado! Te responderemos pronto.',
                error: 'Error al enviar: ' + (e.message || 'Inténtalo más tarde')
            }
        );

        setFormData({ name: '', email: '', company: '', reason: 'Soporte Técnico', message: '' });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            <LandingNav />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-24">

                    {/* Info Side */}
                    <div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-3 inline-block mb-6">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-wide uppercase">Contacto</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Estamos aquí para ayudarte</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            ¿Tienes preguntas sobre Opero? Ya sea que necesites soporte, una demo personalizada o tengas dudas sobre precios, nuestro equipo está listo.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">📧</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Correo Electrónico</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">kaizenstudiodev@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">📱</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Instagram</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">@kaizenstudio.dev</p>
                                    <p className="text-xs text-gray-500 mt-2">Tiempo de respuesta estimado: 24–48 horas</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">🛡️ Nota de confianza</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Kaizen Studio es un estudio independiente enfocado en crear software funcional, escalable y accesible para empresas reales en Colombia.
                            </p>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Empresa (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="Nombre de tu negocio"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="tucorreo@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motivo</label>
                                <select
                                    className="input-field w-full"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option>Soporte Técnico</option>
                                    <option>Ventas / Información Comercial</option>
                                    <option>Solicitar Demo Personalizada</option>
                                    <option>Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mensaje</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="input-field w-full text-base"
                                    placeholder="¿En qué podemos ayudarte hoy?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary py-3 text-base font-semibold"
                            >
                                Enviar mensaje
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}
