import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const parqueaderoInfo = {
    nombre: 'Parqueadero LOT',
    direccion: 'Av. Principal # 12-45, zona centro',
    horarios: 'Lunes a domingo: 6:00 a. m. - 10:00 p. m.',
    telefono: '316 350 8997',
    whatsapp: '3163508997'
};

const slides = [
    {
        titulo: 'Ingreso rápido y seguro',
        texto: 'Control de cupos, tickets QR y seguimiento del vehículo en tiempo real.',
        imagen: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1800&q=85'
    },
    {
        titulo: 'Reserva tu cupo antes de llegar',
        texto: 'Consulta disponibilidad, separa el espacio y llega con tu cupo listo.',
        imagen: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1800&q=85'
    },
    {
        titulo: 'Pago y salida sin vueltas',
        texto: 'POS con efectivo, QR, Nequi, Daviplata, datáfono y pago mixto.',
        imagen: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1800&q=85'
    }
];

const servicios = [
    { icono: 'pi pi-car', titulo: 'Automóviles', texto: 'Espacios señalizados y control de ocupación.' },
    { icono: 'pi pi-send', titulo: 'Motocicletas', texto: 'Cupos dedicados para ingreso ágil.' },
    { icono: 'pi pi-truck', titulo: 'Carga pesada', texto: 'Zonas diferenciadas para vehículos grandes.' },
    { icono: 'pi pi-qrcode', titulo: 'Ticket QR', texto: 'Ingreso y liquidación con código escaneable.' },
    { icono: 'pi pi-shield', titulo: 'Monitoreo', texto: 'Registro operativo y trazabilidad del servicio.' },
    { icono: 'pi pi-wallet', titulo: 'Medios de pago', texto: 'Efectivo, transferencia, QR, datáfono y mixto.' }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [slideActivo, setSlideActivo] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSlideActivo(prev => (prev + 1) % slides.length);
        }, 5200);
        return () => clearInterval(timer);
    }, []);

    const slide = slides[slideActivo];
    const whatsappUrl = useMemo(
        () => `https://wa.me/57${parqueaderoInfo.whatsapp}?text=${encodeURIComponent('Hola, quiero consultar disponibilidad de cupos en Parqueadero LOT.')}`,
        []
    );

    return (
        <main className="landing-lot">
            <nav className="landing-nav">
                <button type="button" className="landing-brand" onClick={() => navigate('/')}>
                    PARQUEADERO <span>LOT</span>
                </button>
                <div className="landing-nav-actions">
                    <button type="button" onClick={() => navigate('/cliente')}>Reservar cupo</button>
                    <button type="button" className="outline" onClick={() => navigate('/login')}>Iniciar sesión</button>
                </div>
            </nav>

            <section className="landing-hero">
                <div className="landing-slider" style={{ backgroundImage: `url("${slide.imagen}")` }}>
                    <div className="landing-slider-overlay" />
                    <div className="landing-copy">
                        <p className="landing-kicker">Parqueadero inteligente</p>
                        <h1>{parqueaderoInfo.nombre}</h1>
                        <p className="landing-lead">{slide.texto}</p>
                        <div className="landing-actions">
                            <button type="button" className="primary" onClick={() => navigate('/cliente')}>
                                Reservar cupo
                            </button>
                            <button type="button" className="secondary" onClick={() => navigate('/login')}>
                                Iniciar sesión
                            </button>
                        </div>
                        <div className="landing-dots" aria-label="Galería del parqueadero">
                            {slides.map((item, index) => (
                                <button
                                    key={item.titulo}
                                    type="button"
                                    className={index === slideActivo ? 'active' : ''}
                                    aria-label={`Ver imagen ${index + 1}`}
                                    onClick={() => setSlideActivo(index)}
                                />
                            ))}
                        </div>
                    </div>
                    <aside className="landing-info-card">
                        <h2>{slide.titulo}</h2>
                        <p><i className="pi pi-map-marker" /> {parqueaderoInfo.direccion}</p>
                        <p><i className="pi pi-clock" /> {parqueaderoInfo.horarios}</p>
                        <a href={whatsappUrl} target="_blank" rel="noreferrer">
                            <i className="pi pi-whatsapp" /> WhatsApp {parqueaderoInfo.telefono}
                        </a>
                    </aside>
                </div>
            </section>

            <section className="landing-services">
                <div className="landing-section-head">
                    <p>Servicios</p>
                    <h2>Todo el flujo del parqueadero en una sola experiencia</h2>
                </div>
                <div className="service-grid">
                    {servicios.map(servicio => (
                        <article className="service-card" key={servicio.titulo}>
                            <i className={servicio.icono} />
                            <h3>{servicio.titulo}</h3>
                            <p>{servicio.texto}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default LandingPage;
