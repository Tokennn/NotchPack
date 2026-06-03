import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Download, Github, MessageSquare, ChevronDown, CheckCircle2,
  Bug, ExternalLink, Zap, Plus, Minus,
} from 'lucide-react';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import Ferrofluid from './components/Ferrofluid';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─────────────────────────────────────────────────────────────── */

type FeatureHighlight = {
  question: string;
  answer: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
};

const featureHighlights: FeatureHighlight[] = [
  {
    question: 'What can I control from the notch?',
    answer: 'Music playback, album artwork, volume, brightness, battery status, and upcoming events stay one click away.',
    icon: '♪',
    iconPosition: 'right',
  },
  {
    question: 'Will it help with meetings?',
    answer: 'Yes. Your next calendar events surface in the notch so you can stay aware without opening Calendar.',
  },
  {
    question: 'Does it replace macOS popups?',
    answer: 'It gives volume and brightness a cleaner HUD that feels integrated with the top of your screen.',
  },
  {
    question: 'Is it heavy on performance?',
    answer: 'No. NotchPack is built to stay lightweight, smooth, and quiet while you keep working.',
    icon: '✦',
    iconPosition: 'left',
  },
  {
    question: 'How fast can I start using it?',
    answer: 'Download the DMG, drag the app into Applications, approve it once in macOS settings, and you are ready.',
  },
];

const testimonials = [
  {
    name: 'Alex Rivera',
    handle: '@alexrivera',
    avatar: 'AR',
    text: 'NotchPack makes the MacBook notch feel useful for the first time. Music controls and battery status are exactly where I expect them.',
    date: 'Jun 1, 2026',
    likes: 156,
    reposts: 23,
  },
  {
    name: 'Sarah Chen',
    handle: '@sarahchen',
    avatar: 'SC',
    text: 'The interactions feel clean and native. I installed it for the music controls, then kept it for meetings and quick status checks.',
    date: 'May 28, 2026',
    likes: 84,
    reposts: 12,
  },
  {
    name: 'Mike Johnson',
    handle: '@mikej_dev',
    avatar: 'MJ',
    text: 'Simple idea, really polished execution. The notch finally behaves like part of the interface instead of empty hardware.',
    date: 'May 19, 2026',
    likes: 42,
    reposts: 8,
  },
];

const faqs = [
  { q: 'What is Boring Notch?', a: "Boring Notch is an open-source application that transforms your MacBook's notch into a functional area, similar to the Dynamic Island on iPhones. It adds music controls, visualizations, a file shelf, and more." },
  { q: 'Is Boring Notch compatible with all Mac models?', a: 'Optimized for MacBooks with a notch, but also works on older Mac models without one, bringing similar utility to all users.' },
  { q: 'How do I install Boring Notch?', a: "Download the DMG, open it, drag to Applications. Since we don't yet have an Apple Developer account, allow it once via Settings > Privacy & Security." },
  { q: 'What features does Boring Notch offer?', a: 'Media controls, battery indicators, calendar and reminders, custom macOS HUD replacement, and a file shelf for easy drag and drop. New features ship regularly.' },
  { q: 'How does it compare to paid alternatives?', a: 'Unlike paid alternatives, Boring Notch is free and the most customizable. Being open-source means it is audited and continuously improved by the community.' },
  { q: 'Is Boring Notch resource-intensive?', a: 'Designed to be extremely lightweight and efficient. Most users report zero perceptible overhead regardless of which features they enable.' },
];

const currentBugs = [
  'AirDrop breaking and only showing a blank box',
  'Notch sometimes showing up in the middle of the screen',
  'Fullscreen media hide not detecting correctly',
  'Display selection for notch position not working',
];

/* ─── FAQ Item ──────────────────────────────────────────────────────────── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!answerRef.current) return;
    if (open) {
      gsap.fromTo(answerRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    } else {
      gsap.to(answerRef.current, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' });
    }
  }, [open]);

  return (
    <div
      className="faq-item cursor-pointer px-6 py-5 rounded-xl"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[15px] font-medium text-white">{q}</span>
        <div style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          <ChevronDown size={16} className="text-zinc-400 shrink-0" />
        </div>
      </div>
      <div ref={answerRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
        <p className="mt-3 pb-1 text-[14px] leading-relaxed text-zinc-400">{a}</p>
      </div>
    </div>
  );
}

function FeatureChatAccordion() {
  const [openItem, setOpenItem] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl text-left">
      <p className="mb-5 px-1 text-sm text-zinc-500">Every day, 9:01 AM</p>
      <div className="space-y-3">
        {featureHighlights.map((item, i) => {
          const isOpen = openItem === i;

          return (
            <div key={item.question} className="feature-chat-item opacity-0">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenItem(isOpen ? null : i)}
                className="group flex w-full items-center justify-start gap-4 text-left"
              >
                <span className="relative inline-flex min-h-14 max-w-full items-center rounded-2xl bg-zinc-900/90 px-5 py-3 text-[17px] font-semibold leading-snug text-white transition-colors group-hover:bg-zinc-800 sm:max-w-[82%] sm:text-2xl">
                  {item.icon && (
                    <span
                      className={`absolute -top-4 text-2xl ${item.iconPosition === 'right' ? 'right-1 rotate-6' : '-left-2 -rotate-6'}`}
                    >
                      {item.icon}
                    </span>
                  )}
                  {item.question}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-zinc-500 transition-colors group-hover:text-white">
                  {isOpen ? <Minus size={26} strokeWidth={2} /> : <Plus size={26} strokeWidth={2} />}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-36 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="ml-6 mt-2 max-w-xl rounded-2xl bg-blue-500 px-5 py-3 text-sm leading-relaxed text-white shadow-lg shadow-blue-500/10 sm:ml-12 sm:text-base">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InstallationHighlightCard() {
  const lines = [
    'macOS may block the first launch because the app is not notarized yet.',
    'Open Privacy & Security, click Open Anyway, then launch NotchPack once.',
    'After that, the app opens normally from your Applications folder.',
  ];

  return (
    <div className="group mx-auto w-full max-w-[350px] cursor-pointer transform transition-all duration-500 hover:-rotate-1 hover:scale-105">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] text-white shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/25 hover:shadow-white/5">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 transition-opacity duration-500 group-hover:opacity-60" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-30 blur-3xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-50" />
          <div className="absolute left-10 top-10 h-16 w-16 rounded-full bg-white/5 blur-xl" />
          <div className="absolute bottom-16 right-16 h-12 w-12 rounded-full bg-white/5 blur-lg" />
          <div className="absolute inset-0 translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:-translate-x-[200%]" />
        </div>

        <div className="relative z-10 flex flex-col items-center p-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
            <div className="rounded-full border border-white/20 bg-gradient-to-br from-black/80 to-black/60 p-6 shadow-2xl backdrop-blur-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-white/20">
              <div className="transition-transform duration-700 group-hover:rotate-180">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <h2 className="mb-4 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-3xl font-bold text-transparent transition-transform duration-300 group-hover:scale-105">
            Facing installation issues?
          </h2>

          <div className="max-w-sm space-y-2">
            {lines.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-6 h-0.5 w-1/3 rounded-full bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-500 group-hover:h-1 group-hover:w-1/2" />

          <div className="mt-4 flex space-x-2 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
            <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:0.1s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:0.2s]" />
          </div>
        </div>

        <div className="absolute left-0 top-0 h-20 w-20 rounded-br-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-3xl bg-gradient-to-tl from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg className="h-4 w-4 text-[#1d9bf0]" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  );
}

function TestimonialsStack() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const stackClasses = [
    '[grid-area:stack] grayscale hover:grayscale-0 before:absolute before:inset-0 before:rounded-2xl before:bg-black/45 before:transition-opacity hover:before:opacity-0',
    '[grid-area:stack] translate-x-8 translate-y-6 grayscale hover:grayscale-0 hover:-translate-y-1 before:absolute before:inset-0 before:rounded-2xl before:bg-black/35 before:transition-opacity hover:before:opacity-0 sm:translate-x-16 sm:translate-y-10',
    '[grid-area:stack] translate-x-16 translate-y-12 hover:translate-y-6 sm:translate-x-32 sm:translate-y-20 sm:hover:translate-y-10',
  ];

  const shiftedClass = (index: number) => {
    if (hoveredIndex === 0 && index === 1) return ' !translate-x-14 !translate-y-20 sm:!translate-x-24 sm:!translate-y-32';
    if (hoveredIndex === 0 && index === 2) return ' !translate-x-24 !translate-y-28 sm:!translate-x-40 sm:!translate-y-44';
    if (hoveredIndex === 1 && index === 2) return ' !translate-x-24 !translate-y-24 sm:!translate-x-40 sm:!translate-y-40';
    return '';
  };

  return (
    <div className="grid min-h-[420px] [grid-template-areas:'stack'] place-items-center px-4 sm:min-h-[500px]">
      {testimonials.map((testimonial, index) => (
        <a
          key={testimonial.handle}
          href="https://github.com/Tokennn"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`relative flex min-h-[170px] w-[280px] -skew-y-[8deg] select-none flex-col rounded-2xl border border-white/10 bg-zinc-950/95 px-4 py-4 text-left shadow-2xl backdrop-blur-sm transition-all duration-500 hover:border-white/25 hover:bg-zinc-900 sm:min-h-[190px] sm:w-[380px] ${stackClasses[index]}${shiftedClass(index)}`}
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 text-sm font-bold text-black sm:h-12 sm:w-12">
              {testimonial.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate text-sm font-bold text-white sm:text-base">{testimonial.name}</span>
                <VerifiedBadge />
              </div>
              <span className="text-xs text-zinc-500 sm:text-sm">{testimonial.handle}</span>
            </div>
            <XIcon className="h-4 w-4 shrink-0 text-zinc-400 sm:h-5 sm:w-5" />
          </div>

          <p className="mb-3 text-xs leading-relaxed text-zinc-200 sm:text-[15px]">
            {testimonial.text}
          </p>

          <div className="mt-auto flex items-center justify-between text-[11px] text-zinc-500 sm:text-sm">
            <span>{testimonial.date}</span>
            <div className="flex items-center gap-4">
              <span>{testimonial.likes} likes</span>
              <span>{testimonial.reposts} reposts</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ─── useReveal hook ────────────────────────────────────────────────────── */

function useReveal(
  ref: React.RefObject<HTMLElement | null>,
  vars?: gsap.TweenVars,
  triggerVars?: ScrollTrigger.Vars,
) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, ...vars },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
          ...triggerVars,
        },
        ...vars,
      }
    );
  }, []);
}

function useStagger(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string,
  staggerDelay = 0.08,
) {
  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(selector);
    gsap.fromTo(
      items,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: staggerDelay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 82%',
          once: true,
        },
      }
    );
  }, []);
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export default function App() {
  useSmoothScroll();

  /* Hero refs */
  const heroNotchRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  /* Section refs */
  const featuresHeaderRef = useRef<HTMLDivElement>(null);
  const featuresGridRef = useRef<HTMLDivElement>(null);
  const installRef = useRef<HTMLDivElement>(null);
  const bugRef = useRef<HTMLDivElement>(null);
  const testimonialsHeaderRef = useRef<HTMLDivElement>(null);
  const faqHeaderRef = useRef<HTMLDivElement>(null);
  const faqListRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  /* Hero entrance — plays immediately on mount */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(heroNotchRef.current, { opacity: 0, scale: 0.85, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.1 })
      .fromTo(heroTitleRef.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo(heroSubRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .fromTo(heroCtaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
  }, []);

  /* Scrolltrigger reveals */
  useReveal(featuresHeaderRef as React.RefObject<HTMLElement>);
  useStagger(featuresGridRef as React.RefObject<HTMLElement>, '.feature-chat-item', 0.1);
  useReveal(installRef as React.RefObject<HTMLElement>);
  useReveal(bugRef as React.RefObject<HTMLElement>);
  useReveal(testimonialsHeaderRef as React.RefObject<HTMLElement>);
  useReveal(faqHeaderRef as React.RefObject<HTMLElement>);
  useStagger(faqListRef as React.RefObject<HTMLElement>, '.faq-item');
  useReveal(ctaRef as React.RefObject<HTMLElement>);
  useReveal(footerRef as React.RefObject<HTMLElement>);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
            <span className="text-sm font-semibold tracking-tight">boring.notch</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/Tokennn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
              <Github size={14} />GitHub
            </a>
            <a href="/NotchPack.dmg" className="btn-primary text-xs font-semibold px-4 py-1.5 rounded-full">
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative w-full" style={{ height: '100vh' }}>

        {/* Ferrofluid — full bleed background */}
        <div ref={heroNotchRef} className="absolute inset-0 opacity-0">
          <Ferrofluid
            colors={['#60a5fa', '#93c5fd', '#e0f2fe', '#bfdbfe', '#38bdf8']}
            speed={0.4}
            scale={1.4}
            turbulence={0.9}
            fluidity={0.12}
            rimWidth={0.22}
            sharpness={2.8}
            shimmer={1.2}
            glow={2.5}
            flowDirection="down"
            opacity={1}
            mouseInteraction={true}
            mouseStrength={1.2}
            mouseRadius={0.32}
            mouseDampening={0.12}
          />
        </div>

        {/* Gradient vignette so text stays readable */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)',
        }} />
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent, #000)',
        }} />

        {/* Text content — centered overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 ref={heroTitleRef} className="opacity-0 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none drop-shadow-2xl">
              <span className="text-white">Not so</span>{' '}
              <span className="shimmer-text">boring.</span>
            </h1>

            <p ref={heroSubRef} className="opacity-0 text-lg md:text-xl text-zinc-300 max-w-xl mx-auto leading-relaxed font-light drop-shadow-lg">
              The open-source utility that turns your MacBook notch into a Dynamic Island-style command center — music, meetings, battery and more.
            </p>

            <div ref={heroCtaRef} className="opacity-0 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href="/NotchPack.dmg" className="btn-primary flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold">
                <Download size={15} />Download for macOS
              </a>
              <a href="https://github.com/Tokennn" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium">
                <Github size={15} />View on GitHub
              </a>
            </div>

            <p className="text-xs text-zinc-500">Free &amp; open-source · macOS 13+</p>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={featuresHeaderRef} className="text-center mb-16 space-y-3 opacity-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything in one notch.</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto font-light">
              Quick controls, useful status, and smooth interactions in the space that used to do nothing.
            </p>
          </div>

          <div ref={featuresGridRef}>
            <FeatureChatAccordion />
          </div>
        </div>
      </section>

      {/* ── Installation ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-950">
        <div ref={installRef} className="opacity-0">
          <InstallationHighlightCard />
        </div>
      </section>

      {/* ── Bug Report ────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div ref={bugRef} className="grid md:grid-cols-2 gap-6 opacity-0">
            <div className="glass rounded-3xl p-8 space-y-6">
              <div className="w-10 h-10 bg-rose-400/10 rounded-xl flex items-center justify-center">
                <Bug size={18} className="text-rose-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Found a bug?</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">Help us sharpen the experience. GitHub Issues is the best way to report — it lets us track and resolve efficiently.</p>
              </div>
              <div className="space-y-2 text-sm text-zinc-400">
                <p className="font-medium text-white text-xs uppercase tracking-widest mb-3">Before you report</p>
                {[
                  'Check if the issue has already been reported',
                  'Include your macOS version and Mac model',
                  'Describe steps to reproduce with screenshots',
                  'Mention the Boring Notch version you\'re using',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-green-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <a href="https://github.com/Tokennn" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium">
                <ExternalLink size={13} />Create an issue on GitHub
              </a>
            </div>

            <div className="glass rounded-3xl p-8 space-y-6">
              <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Known issues</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">We track everything in the open. Here's what's on our radar right now.</p>
              </div>
              <ul className="space-y-3">
                {currentBugs.map((bug, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70 mt-2 shrink-0" />
                    <span className="text-sm text-zinc-300">{bug}</span>
                  </li>
                ))}
              </ul>
              <a href="https://github.com/Tokennn" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium">
                <Github size={13} />More on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-950 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div ref={testimonialsHeaderRef} className="text-center mb-14 space-y-3 opacity-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Community</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The community loves it.</h2>
          </div>

          <TestimonialsStack />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div ref={faqHeaderRef} className="text-center mb-14 space-y-3 opacity-0">
          </div>

          <div ref={faqListRef} className="space-y-1">
            {faqs.map((faq, i) => (
              <div key={i} className="opacity-0">
                <FAQItem q={faq.q} a={faq.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />
        <div ref={ctaRef} className="max-w-3xl mx-auto text-center space-y-8 opacity-0">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Ready to make your notch{' '}
            <span className="shimmer-text">actually exciting?</span>
          </h2>
          <p className="text-zinc-400 text-lg font-light max-w-lg mx-auto">
            Download now and join thousands of Mac users who transformed their notch into their favorite feature.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/NotchPack.dmg" className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold">
              <Download size={15} />Download for macOS
            </a>
            <a href="https://github.com/Tokennn" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium">
              <Github size={15} />View on GitHub
            </a>
          </div>
          <p className="text-xs text-zinc-700">Free and open-source forever.</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer ref={footerRef} className="border-t border-zinc-900 py-10 px-6 opacity-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span>boring.notch by TheBoringTeam</span>
          </div>
          <p>2025 TheBoringTeam · Open source · MIT License</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Tokennn" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors flex items-center gap-1">
              <Github size={12} />GitHub
            </a>
            <a href="https://discord.com/invite/HznxBpnJmQ" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors flex items-center gap-1">
              <MessageSquare size={12} />Discord
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
