import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Layers, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocumentTitle } from '@/lib/use-document-title';

const VALUES = [
    {
        icon: CalendarCheck,
        title: 'Disponibilidad real',
        body: 'Los huecos se calculan en la base de datos con el horario del negocio, el del profesional, sus ausencias y las reservas ya tomadas.',
    },
    {
        icon: ShieldCheck,
        title: 'Sin dobles reservas',
        body: 'Una restricción del motor impide que dos citas ocupen el mismo rango de un profesional, incluso si llegan al mismo tiempo.',
    },
    {
        icon: Layers,
        title: 'Un panel por negocio',
        body: 'Cada negocio gestiona servicios, equipo, agenda y clientes en su propio espacio. Los datos no se cruzan entre negocios.',
    },
] as const;

const BOOKING_STEPS = [
    'Elige el servicio y el profesional.',
    'Consulta las horas realmente libres.',
    'Deja tus datos sin crear una cuenta.',
    'Recibe un enlace para consultar o cancelar.',
] as const;

export function HomePage() {
    useDocumentTitle('Reserva2 — La agenda de tu negocio, sin fricción');

    return (
        <>
            <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
                <div className="max-w-3xl">
                    <Badge variant="accent">Reservas para negocios pequeños</Badge>

                    <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
                        La agenda de tu negocio,
                        <br />
                        <span className="text-accent">sin fricción.</span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
                        Reserva2 reúne catálogo, equipo y citas en una sola
                        agenda. Tus clientes reservan desde el móvil, sin
                        llamar y sin crear una cuenta.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button asChild size="lg">
                            <Link to="/crear-cuenta">
                                Crear mi cuenta
                                <ArrowRight aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="lg">
                            <a href="#como-funciona">Cómo funciona</a>
                        </Button>
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="que-resuelve"
                className="border-y border-rule bg-surface"
            >
                <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
                    <h2
                        id="que-resuelve"
                        className="font-display text-2xl text-ink sm:text-3xl"
                    >
                        Qué resuelve
                    </h2>

                    <ul className="mt-10 grid gap-6 md:grid-cols-3">
                        {VALUES.map(({ icon: Icon, title, body }) => (
                            <li key={title}>
                                <Card className="h-full">
                                    <CardHeader>
                                        <Icon
                                            aria-hidden="true"
                                            className="mb-2 size-6 text-accent"
                                            strokeWidth={1.5}
                                        />
                                        <CardTitle>{title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed text-ink-soft">
                                            {body}
                                        </p>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section
                id="como-funciona"
                aria-labelledby="como-funciona-title"
                className="mx-auto w-full max-w-6xl scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20"
            >
                <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
                    <div>
                        <h2
                            id="como-funciona-title"
                            className="font-display text-2xl text-ink sm:text-3xl"
                        >
                            Reservar, en cuatro pasos
                        </h2>
                        <p className="mt-4 max-w-md text-ink-soft">
                            El cliente no descarga nada ni crea una cuenta.
                            Recorre el asistente una vez y recibe un enlace
                            propio para gestionar su cita.
                        </p>
                    </div>

                    <ol className="border-t border-rule">
                        {BOOKING_STEPS.map((step, index) => (
                            <li
                                key={step}
                                className="flex gap-5 border-b border-rule py-5"
                            >
                                <span className="tabular w-8 shrink-0 font-display text-xl text-accent">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="text-ink-soft">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </>
    );
}
