import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            <LandingNav />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Términos y Condiciones – Opero</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-12">Última actualización: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-12">

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Aceptación de los términos</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Al instalar o utilizar Opero, el usuario acepta estos términos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Licencia de uso</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Opero se entrega bajo una licencia de uso, no de propiedad.</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                <li>La licencia es no transferible</li>
                                <li>Válida para un solo negocio o empresa</li>
                                <li>El código fuente no se entrega</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Planes y licencias</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Opero cuenta con distintos planes:</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                                <li>Opero Básico</li>
                                <li>Opero Ventas</li>
                                <li>Opero Empresarial</li>
                            </ul>
                            <p className="text-gray-600 dark:text-gray-300">
                                Cada licencia habilita funciones específicas según el plan contratado.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Pagos y membresía</h2>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                <li>El pago de licencia es único.</li>
                                <li>La membresía mensual cubre soporte y actualizaciones.</li>
                                <li>La falta de pago puede suspender el soporte y ciertas funciones.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Uso indebido</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Está prohibido:</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Modificar el sistema para desbloquear funciones no contratadas</li>
                                <li>Distribuir el software sin autorización</li>
                                <li>Realizar ingeniería inversa</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Soporte y actualizaciones</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                El soporte se brinda según el plan activo. Las actualizaciones pueden modificar o mejorar funcionalidades existentes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Limitación de responsabilidad</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Kaizen Studio no se hace responsable por:</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Pérdida de datos por mala configuración</li>
                                <li>Uso indebido del sistema</li>
                                <li>Fallos externos al software</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Terminación</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kaizen Studio puede suspender la licencia en caso de incumplimiento de estos términos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Legislación aplicable</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Estos términos se rigen por las leyes de la República de Colombia.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Contacto</h2>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                <li>📧 kaizenstudiodev@gmail.com</li>
                                <li>📱 Instagram: @kaizenstudio.dev</li>
                            </ul>
                        </section>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
