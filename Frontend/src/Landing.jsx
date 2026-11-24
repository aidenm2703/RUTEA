import { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, Play } from 'lucide-react'
import Account from './Account'
import { photos } from './media'
import logo from './assets/rutea-logo.svg'

const slides = Object.values(photos)

export default function Landing({ onLogin, onExplore }) {
  const [register, setRegister] = useState(false)
  function openAccount(create) {
    setRegister(create)
    document.getElementById('acceso')?.scrollIntoView({ block: 'start' })
  }
  return <div className="landing">
    {onLogin && <header className="landing-header">
      <div className="shell landing-nav">
        <a className="landing-brand" href="#que-es-rutea"><img src={logo} alt="" /> RUTEA</a>
        <a href="#que-es-rutea">Qué es RUTEA</a>
        <button className="landing-outline" onClick={() => openAccount(false)}>Iniciar sesión</button>
      </div>
    </header>}
    <section id="que-es-rutea" className="landing-hero">
      <img className="landing-cover" src={photos.forest.src} alt="" fetchPriority="high" />
      <div className="landing-hero-content">
        <p className="eyebrow">Qué es RUTEA</p>
        <h1>Tu bitácora<br />de Costa Rica.</h1>
        <p>Encuentra lugares por provincia y cantón, conoce sus historias y conserva cada visita en tu pasaporte.</p>
        <div className="landing-actions">
          <button onClick={onExplore || (() => openAccount(true))}>{onExplore ? 'Explorar lugares' : 'Crear mi cuenta'} <ArrowRight size={18} /></button>
          {onLogin && <button className="landing-outline" onClick={() => openAccount(false)}>Ya tengo una cuenta</button>}
        </div>
      </div>
      <PhotoCredit photo={photos.forest} />
    </section>
    <div className={onLogin ? 'shell landing-content' : 'landing-content'}>
      {onLogin && <section id="acceso" className="landing-access">
        <div><h2>Entra a tu bitácora</h2><p>Con tu cuenta puedes explorar el catálogo, consultar el glosario y los agentes, y registrar tus visitas.</p></div>
        <Account register={register} setRegister={setRegister} onLogin={onLogin} />
      </section>}
      <section className="landing-section">
        <div className="landing-section-heading"><h2>Postales de Costa Rica</h2><ArrowDown aria-hidden="true" /></div>
        <Carousel />
      </section>
      <section className="landing-section">
        <h2>Naturaleza y museos</h2>
        <div className="landing-films">
          <Film id="cBJLARQbPeY" title="Río Celeste" photo={photos.volcano} publisher="My Costa Rica" />
          <article className="landing-film">
            <video src="/media/museos.webm" poster={photos.national.src} controls loop muted playsInline preload="none"
              aria-label="Montaje de fotografías del Museo Nacional y Museo del Jade" />
            <h3>Museos de San José</h3>
            <p>Montaje de fotografías del Museo Nacional y el Museo del Jade.</p>
            <PhotoCredit photo={photos.national} /><PhotoCredit photo={photos.jade} />
            <p className="photo-credit">Encuadres adaptados · <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">Licencia del montaje</a></p>
          </article>
        </div>
      </section>
    </div>
  </div>
}

function PhotoCredit({ photo }) {
  return <span className="photo-credit"><a href={photo.source} target="_blank" rel="noreferrer">{photo.author}</a>
    {' · '}<a href={photo.license} target="_blank" rel="noreferrer">Creative Commons</a></span>
}

function Carousel() {
  const [slide, setSlide] = useState(0)
  const photo = slides[slide]
  const step = (offset) => setSlide((index) => (index + offset + slides.length) % slides.length)
  return <div className="landing-carousel" aria-roledescription="carrusel" aria-label="Postales de Costa Rica">
    <figure>
      <img src={photo.src} alt={photo.title} loading="lazy" />
      <figcaption aria-live="polite"><strong>{photo.title}</strong><PhotoCredit photo={photo} /></figcaption>
    </figure>
    <div className="carousel-controls">
      <button aria-label="Foto anterior" onClick={() => step(-1)}><ArrowLeft size={19} /></button>
      <span aria-live="polite">{slide + 1} / {slides.length}</span>
      <button aria-label="Foto siguiente" onClick={() => step(1)}><ArrowRight size={19} /></button>
    </div>
  </div>
}

function Film({ id, title, photo, publisher }) {
  const [playing, setPlaying] = useState(false)
  return <article className="landing-film">
    {playing ? <iframe title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1`} />
      : <button className="film-poster" onClick={() => setPlaying(true)} aria-label={`Reproducir ${title}`}>
        <img src={photo.src} alt="" loading="lazy" />
        <span><Play size={19} aria-hidden="true" /> Reproducir</span>
      </button>}
    <h3>{title}</h3>
    <p><a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">Video de {publisher}</a>
      {playing && <button className="secondary" onClick={() => setPlaying(false)}>Cerrar reproductor</button>}</p>
    {!playing && <PhotoCredit photo={photo} />}
  </article>
}
