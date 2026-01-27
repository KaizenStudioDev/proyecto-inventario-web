import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            <LandingNav />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Política de Privacidad – Opero</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-12">Última actualización: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-12">

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introducción</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Opero es un software desarrollado por Kaizen Studio. Nos tomamos muy en serio la privacidad de nuestros usuarios y clientes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Información que recopilamos</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Podemos recopilar la siguiente información:</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Nombre del negocio</li>
                                <li>Nombre del usuario administrador</li>
                                <li>Correo electrónico</li>
                                <li>Datos de uso del sistema (solo para soporte y mejoras)</li>
                                <li>Información técnica básica (versión del sistema, errores)</li>
                            </ul>
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                                📌 <strong>Nota:</strong> No recopilamos información financiera sensible ni datos bancarios.
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Uso de la información</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">La información recopilada se utiliza para:</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Proveer y mantener el funcionamiento del software</li>
                                <li>Brindar soporte técnico</li>
                                <li>Enviar notificaciones relacionadas con el servicio</li>
                                <li>Mejorar futuras versiones del sistema</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Almacenamiento de datos</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Los datos pueden almacenarse:</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                                <li>Localmente en el equipo del cliente</li>
                                <li>En servidores configurados por el propio cliente</li>
                            </ul>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kaizen Studio no accede a la información interna del sistema sin autorización expresa del cliente.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Compartir información</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                No vendemos, alquilamos ni compartimos información con terceros, salvo obligación legal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Seguridad</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Implementamos buenas prácticas de seguridad para proteger la información, aunque ningún sistema es 100% infalible.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Derechos del usuario</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">El usuario puede solicitar:</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Acceso a su información</li>
                                <li>Corrección de datos</li>
                                <li>Eliminación de información de contacto</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Cambios en la política</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Esta política puede actualizarse. Los cambios serán notificados a los usuarios.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Contacto</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Para dudas sobre esta política:</p>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                <li>📧 contacto@kaizenstudio.dev</li>
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
