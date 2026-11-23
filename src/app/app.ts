import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Icon } from './icon';
import { Logo } from './logo';
import { Assistant } from './assistant';
import { WHATSAPP_NUMBER } from './config';

const INSTAGRAM_URL = '';

interface Plan {
  name: string;
  price: string;
  installments?: string;
  description: string;
  highlight?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-root',
  imports: [Icon, Logo, Assistant],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly year = new Date().getFullYear();
  protected readonly instagramUrl = INSTAGRAM_URL;

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly slide = signal(0);

  private readonly assistant = viewChild(Assistant);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private autoplay?: ReturnType<typeof setInterval>;
  private paused = false;

  protected readonly links = [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Método', href: '#metodo' },
    { label: 'Resultados', href: '#resultados' },
    { label: 'Planos', href: '#planos' },
    { label: 'Dúvidas', href: '#faq' },
  ];

  protected readonly specialties = [
    { icon: 'dumbbell', label: 'Hipertrofia' },
    { icon: 'flame', label: 'Emagrecimento' },
    { icon: 'heart', label: 'Glúteos' },
    { icon: 'users', label: 'Treino feminino e masculino' },
    { icon: 'graduation', label: 'Pós em biomecânica' },
  ];

  protected readonly included = [
    {
      icon: 'target',
      title: 'Treino 100% personalizado',
      text: 'Montado do zero, respeitando seus objetivos, sua rotina e seus limites.',
    },
    {
      icon: 'home',
      title: 'Flexibilidade total',
      text: 'Escolha treinar em casa ou na academia, no seu ritmo.',
    },
    {
      icon: 'smartphone',
      title: 'Treino no app com vídeos',
      text: 'Plano organizado no celular, com a execução correta de cada exercício.',
    },
    {
      icon: 'scale',
      title: 'Avaliação física e bioimpedância digital',
      text: 'Incluídas em todos os planos para acompanhar sua composição corporal.',
    },
    {
      icon: 'refresh',
      title: 'Mudança de treinos',
      text: 'Ajustes conforme suas necessidades e objetivos ao longo do caminho.',
    },
    {
      icon: 'trending',
      title: 'Evolução mensal',
      text: 'Acompanhamento da sua evolução a cada mês, com dados e ajustes.',
    },
    {
      icon: 'whatsapp',
      title: 'Suporte VIP via WhatsApp',
      text: 'Tire suas dúvidas diretamente com o Leandro, sem intermediários.',
    },
  ];

  protected readonly steps = [
    {
      icon: 'message',
      title: 'Fale com o Leandro',
      text: 'Chame no WhatsApp, conte seu objetivo e escolha o plano ideal para você.',
    },
    {
      icon: 'clipboard',
      title: 'Avaliação e planejamento',
      text: 'Avaliação física, bioimpedância e anamnese para montar o treino do zero.',
    },
    {
      icon: 'play',
      title: 'Treine com vídeos no app',
      text: 'Receba seu plano organizado e veja a execução correta de cada exercício.',
    },
    {
      icon: 'trending',
      title: 'Evolua todo mês',
      text: 'Acompanhamento mensal e ajustes para você não perder o foco nem o resultado.',
    },
  ];

  protected readonly results = [
    { src: 'img/resultado-6.jpg', alt: 'Aluna antes e depois: menos 13 quilos em 3 meses', tag: '-13 kg em 3 meses' },
    { src: 'img/resultado-1.jpg', alt: 'Aluna antes e depois de treino com ganho de definição', tag: 'Definição e força' },
    { src: 'img/resultado-3.jpg', alt: 'Aluna antes e depois com mudança de composição corporal', tag: 'Composição corporal' },
    { src: 'img/resultado-2.jpg', alt: 'Aluna antes e depois com redução de medidas', tag: 'Emagrecimento' },
    { src: 'img/resultado-4.jpg', alt: 'Aluna antes e depois de transformação com emagrecimento', tag: 'Transformação' },
    { src: 'img/resultado-5.jpg', alt: 'Aluna antes e depois com evolução de físico', tag: 'Evolução do físico' },
  ];

  protected readonly plans: Plan[] = [
    {
      name: 'Mensal',
      price: 'R$ 150,00',
      description: 'Ideal para quem quer começar com mais flexibilidade.',
    },
    {
      name: 'Trimestral',
      price: 'R$ 280,00',
      installments: 'ou 3x de R$ 93,30',
      description: '3 meses de evolução no seu físico.',
      highlight: true,
      badge: 'Mais escolhido',
    },
    {
      name: 'Semestral',
      price: 'R$ 480,00',
      installments: 'ou 6x de R$ 80,00',
      description: '6 meses para construir rotina, acompanhar a evolução e fazer os ajustes necessários.',
    },
    {
      name: 'Anual',
      price: 'R$ 720,00',
      installments: 'ou 12x de R$ 60,00',
      description: '12 meses de planejamento, acompanhamento, ajustes e evolução.',
      badge: 'Melhor custo',
    },
  ];

  protected readonly faqs = [
    {
      q: 'Preciso ir à academia para fazer a consultoria?',
      a: 'Não. Você escolhe treinar em casa ou na academia, e o treino é montado de acordo com o local e os equipamentos que você tem.',
    },
    {
      q: 'Como recebo meu treino?',
      a: 'Tudo fica organizado em um app, com vídeos mostrando a execução correta de cada exercício. É só abrir no celular e treinar.',
    },
    {
      q: 'O treino é realmente personalizado?',
      a: 'Sim. Ele é montado do zero, considerando seu objetivo, sua rotina, seu nível e seus limites. Nada de planilha pronta.',
    },
    {
      q: 'Como funciona o acompanhamento?',
      a: 'Você tem suporte VIP via WhatsApp direto com o Leandro, mudança de treinos conforme sua necessidade e acompanhamento mensal da evolução.',
    },
    {
      q: 'A avaliação física está inclusa?',
      a: 'Sim. Avaliação física e bioimpedância digital estão incluídas em todos os planos.',
    },
    {
      q: 'Como funciona o personal presencial?',
      a: 'O atendimento presencial é individual. Chame no WhatsApp para conferir disponibilidade, horários e valores.',
    },
    {
      q: 'Quais as formas de pagamento?',
      a: 'Os planos trimestral, semestral e anual podem ser parcelados no cartão. Parcelamento no cartão sujeito a juros — confirme as condições pelo WhatsApp.',
    },
  ];

  constructor() {
    afterNextRender(() => {
      this.doc.documentElement.classList.add('js');
      this.setupReveal();
      this.startAutoplay();
      this.destroyRef.onDestroy(() => clearInterval(this.autoplay));
    });
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.scrolled.set((this.doc.defaultView?.scrollY ?? 0) > 24);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }

  protected wa(message = 'Olá Leandro! Vim pelo site e quero saber mais sobre a consultoria.'): string {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  protected waPlan(plan: Plan): string {
    return this.wa(`Olá Leandro! Tenho interesse no plano ${plan.name} da consultoria online.`);
  }

  protected openAssistant(): void {
    this.closeMenu();
    this.assistant()?.openAssistant();
  }

  protected toggleMenu(): void {
    this.setMenu(!this.menuOpen());
  }

  protected closeMenu(): void {
    this.setMenu(false);
  }

  private setMenu(open: boolean): void {
    this.menuOpen.set(open);
    this.doc.body.style.overflow = open ? 'hidden' : '';
  }

  // ---- Carousel ----
  protected onTrackScroll(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
    this.slide.set(Math.min(this.results.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }

  protected goTo(index: number): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const count = this.results.length;
    const target = (index + count) % count;
    const card = el.children[target] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }

  protected next(): void {
    this.goTo(this.slide() + 1);
  }

  protected prev(): void {
    this.goTo(this.slide() - 1);
  }

  protected pause(value: boolean): void {
    this.paused = value;
  }

  private startAutoplay(): void {
    const reduce = this.doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    this.autoplay = setInterval(() => {
      if (!this.paused && !this.doc.hidden) this.next();
    }, 4500);
  }

  // ---- Scroll reveal ----
  private setupReveal(): void {
    const items = Array.from(this.doc.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in (this.doc.defaultView ?? {}))) {
      items.forEach((i) => i.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    items.forEach((i) => io.observe(i));
    this.destroyRef.onDestroy(() => io.disconnect());
  }
}
