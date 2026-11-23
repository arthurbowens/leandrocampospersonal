import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WHATSAPP_NUMBER } from './config';

type Key =
  | 'name' | 'age' | 'height' | 'weight' | 'goal' | 'experience' | 'place'
  | 'frequency' | 'modality' | 'plan' | 'medical' | 'difficulty';

interface Step {
  key: Key;
  placeholder: string;
  type: 'text' | 'number';
  options?: string[];
  question: (firstName: string) => string;
  validate: (v: string) => string | null;
  format?: (v: string) => string;
}

interface Msg {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

const OPEN_ENDED = new Set(['Outro', 'Outros']);
const num = (v: string) => Number(String(v).replace(',', '.'));

const STEPS: Step[] = [
  {
    key: 'name', placeholder: 'Seu nome', type: 'text',
    question: () => 'Para começar, como você se chama?',
    validate: (v) => (v.trim().length < 2 ? 'Informe seu nome.' : null),
  },
  {
    key: 'age', placeholder: 'Ex: 28', type: 'number',
    question: (n) => `Prazer, ${n}! Qual a sua idade?`,
    validate: (v) => (!(num(v) >= 14 && num(v) <= 90) ? 'Informe uma idade entre 14 e 90.' : null),
    format: (v) => `${num(v)} anos`,
  },
  {
    key: 'height', placeholder: 'Ex: 165', type: 'number',
    question: () => 'Qual a sua altura, em centímetros?',
    validate: (v) => (!(num(v) >= 120 && num(v) <= 230) ? 'Informe a altura em cm (120 a 230).' : null),
    format: (v) => `${num(v)} cm`,
  },
  {
    key: 'weight', placeholder: 'Ex: 70', type: 'number',
    question: () => 'E o seu peso atual, em kg?',
    validate: (v) => (!(num(v) >= 30 && num(v) <= 250) ? 'Informe o peso em kg (30 a 250).' : null),
    format: (v) => `${num(v)} kg`,
  },
  {
    key: 'goal', placeholder: 'Qual o seu objetivo?', type: 'text',
    options: ['Emagrecimento', 'Glúteos', 'Ganho de massa muscular', 'Definição corporal', 'Condicionamento', 'Qualidade de vida', 'Outros'],
    question: () => 'Qual é o seu principal objetivo com os treinos?',
    validate: (v) => (v.trim().length < 2 ? 'Escolha ou digite seu objetivo.' : null),
  },
  {
    key: 'experience', placeholder: 'Ex: treino há 1 ano', type: 'text',
    options: ['Não treino ainda', 'Menos de 3 meses', '3 a 6 meses', '6 a 12 meses', 'Mais de 1 ano'],
    question: () => 'Você já treina? Há quanto tempo?',
    validate: (v) => (v.trim().length < 2 ? 'Conte se já treina e há quanto tempo.' : null),
  },
  {
    key: 'place', placeholder: 'Onde você treina?', type: 'text',
    options: ['Academia', 'Em casa', 'Os dois'],
    question: () => 'Onde você pretende treinar?',
    validate: (v) => (v.trim().length < 2 ? 'Escolha onde pretende treinar.' : null),
  },
  {
    key: 'frequency', placeholder: 'Ex: 3x', type: 'text',
    options: ['2x', '3x', '4x', '5x ou mais'],
    question: () => 'Quantas vezes por semana você consegue treinar?',
    validate: (v) => (v.trim().length < 1 ? 'Escolha quantas vezes por semana.' : null),
  },
  {
    key: 'modality', placeholder: 'Modalidade', type: 'text',
    options: ['Consultoria online', 'Personal presencial'],
    question: (n) => `${n}, qual modalidade de atendimento você prefere?`,
    validate: (v) => (v.trim().length < 2 ? 'Escolha a modalidade.' : null),
  },
  {
    key: 'plan', placeholder: 'Plano', type: 'text',
    options: ['Mensal', 'Trimestral', 'Semestral', 'Anual', 'Ainda não sei'],
    question: () => 'Qual plano chamou mais a sua atenção? (Mensal R$ 150 · Trimestral R$ 280 · Semestral R$ 480 · Anual R$ 720)',
    validate: (v) => (v.trim().length < 2 ? 'Escolha um plano.' : null),
  },
  {
    key: 'medical', placeholder: 'Descreva a restrição', type: 'text',
    options: ['Nenhuma', 'Lesão', 'Dor', 'Outro'],
    question: () => 'Possui alguma restrição médica, lesão ou dor que eu deva considerar?',
    validate: (v) => (v.trim().length < 2 ? 'Informe se há restrição, lesão ou dor.' : null),
  },
  {
    key: 'difficulty', placeholder: 'Sua maior dificuldade', type: 'text',
    options: ['Consistência', 'Alimentação', 'Falta de tempo', 'Técnica nos exercícios', 'Motivação', 'Lesão/dores', 'Outro'],
    question: () => 'Por último: qual a sua maior dificuldade hoje?',
    validate: (v) => (v.trim().length < 2 ? 'Conte qual é a sua maior dificuldade.' : null),
  },
];

const LABELS: Record<Key, string> = {
  name: 'Nome', age: 'Idade', height: 'Altura', weight: 'Peso', goal: 'Objetivo',
  experience: 'Experiência', place: 'Local de treino', frequency: 'Frequência semanal',
  modality: 'Modalidade', plan: 'Plano de interesse', medical: 'Restrição médica', difficulty: 'Maior dificuldade',
};

@Component({
  selector: 'app-assistant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="overlay" (click)="close()" role="presentation">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-title"
          (click)="$event.stopPropagation()"
        >
          <div class="top">
            <img class="avatar" src="img/leandro-2.jpg" alt="" width="44" height="44" />
            <div class="who">
              <strong id="assistant-title">Assistente Leandro Campos</strong>
              <p>Avaliação inicial · Consultoria e personal</p>
            </div>
            <span class="status">Online</span>
            <button type="button" class="close" aria-label="Fechar assistente" (click)="close()">✕</button>
          </div>

          <div class="feed" #feed role="log" aria-live="polite">
            @for (m of messages(); track m.id) {
              <div class="bubble" [class.bot]="m.role === 'bot'" [class.user]="m.role === 'user'">
                <p>{{ m.text }}</p>
              </div>
            }
          </div>

          @if (!finished()) {
            <div class="composer">
              @if (current().options; as opts) {
                <div class="options">
                  @for (o of opts; track o) {
                    <button type="button" class="chip" (click)="pick(o)">{{ o }}</button>
                  }
                </div>
              }
              @if (showInput()) {
                <form class="form" (submit)="$event.preventDefault(); submit()">
                  <input
                    #field
                    autocomplete="off"
                    [type]="current().type"
                    [attr.inputmode]="current().type === 'number' ? 'decimal' : 'text'"
                    [placeholder]="current().placeholder"
                    [attr.aria-label]="current().placeholder"
                    [value]="draft()"
                    (input)="onInput($event)"
                  />
                  <button type="submit" class="send">Enviar</button>
                </form>
              }
              @if (error()) {
                <p class="error" role="alert">{{ error() }}</p>
              }
              <p class="progress">Pergunta {{ index() + 1 }} de {{ total }}</p>
            </div>
          } @else {
            <div class="finish">
              <a class="wa" [href]="waHref()" target="_blank" rel="noopener">Abrir WhatsApp</a>
              <button type="button" class="restart" (click)="begin()">Refazer</button>
            </div>
          }
        </div>
      </div>
    }

    <button type="button" class="fab" aria-label="Fale conosco - Assistente Leandro Campos" (click)="openAssistant()">
      <span class="photo">
        <img src="img/leandro-2.jpg" alt="" width="40" height="40" />
        <span class="dot" aria-hidden="true"></span>
      </span>
      Fale conosco
    </button>
  `,
  styleUrl: './assistant.css',
})
export class Assistant {
  private readonly doc = inject(DOCUMENT);
  private readonly feed = viewChild<ElementRef<HTMLElement>>('feed');
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private id = 0;

  protected readonly total = STEPS.length;
  protected readonly open = signal(false);
  protected readonly started = signal(false);
  protected readonly finished = signal(false);
  protected readonly index = signal(0);
  protected readonly draft = signal('');
  protected readonly error = signal('');
  protected readonly showInput = signal(true);
  protected readonly messages = signal<Msg[]>([]);
  protected readonly waHref = signal('');
  private answers: Partial<Record<Key, string>> = {};

  protected current(): Step {
    return STEPS[this.index()];
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.close();
  }

  openAssistant(): void {
    this.open.set(true);
    this.doc.body.style.overflow = 'hidden';
    if (!this.started() || this.finished()) this.begin();
    else this.afterPaint();
  }

  protected close(): void {
    this.open.set(false);
    this.doc.body.style.overflow = '';
  }

  protected begin(): void {
    this.started.set(true);
    this.finished.set(false);
    this.index.set(0);
    this.answers = {};
    this.draft.set('');
    this.error.set('');
    this.waHref.set('');
    this.showInput.set(!STEPS[0].options);
    this.messages.set([
      this.msg('bot', 'Oi! Eu sou o Leandro Campos 🔥 Vou te fazer uma avaliação rápida para conhecer o seu momento e indicar o melhor caminho para o seu objetivo 🚀'),
      this.msg('bot', STEPS[0].question('')),
    ]);
    this.afterPaint();
  }

  protected onInput(e: Event): void {
    this.draft.set((e.target as HTMLInputElement).value);
    this.error.set('');
  }

  protected pick(option: string): void {
    const key = this.current().key;
    if (OPEN_ENDED.has(option) || (key === 'medical' && (option === 'Lesão' || option === 'Dor'))) {
      this.showInput.set(true);
      this.draft.set(OPEN_ENDED.has(option) ? '' : `${option}: `);
      this.error.set('');
      this.afterPaint();
      return;
    }
    this.draft.set(option);
    this.submit();
  }

  protected submit(): void {
    if (this.finished()) return;
    const step = this.current();
    const raw = this.draft().trim();
    const err = step.validate(raw);
    if (err) {
      this.error.set(err);
      return;
    }
    const shown = step.format ? step.format(raw) : raw;
    this.answers[step.key] = shown;
    this.push(this.msg('user', shown));
    this.draft.set('');
    this.error.set('');

    const next = this.index() + 1;
    if (next >= STEPS.length) {
      this.finish();
      return;
    }
    this.index.set(next);
    this.showInput.set(!STEPS[next].options);
    const first = (this.answers.name ?? '').split(' ')[0];
    setTimeout(() => {
      this.push(this.msg('bot', STEPS[next].question(first)));
      this.afterPaint();
    }, 250);
  }

  private finish(): void {
    const lines = [
      'Olá Leandro! Vim pelo assistente do site (avaliação inicial).',
      '',
      ...STEPS.map((s) => `${LABELS[s.key]}: ${this.answers[s.key]}`),
      '',
      'Quero iniciar o acompanhamento.',
    ];
    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    this.waHref.set(href);
    this.finished.set(true);
    const first = (this.answers.name ?? '').split(' ')[0];
    this.push(this.msg('bot', `${first}, anotei tudo! Toque em "Abrir WhatsApp" para enviar sua avaliação direto para mim.`));
  }

  private msg(role: Msg['role'], text: string): Msg {
    return { id: ++this.id, role, text };
  }

  private push(m: Msg): void {
    this.messages.update((list) => [...list, m]);
    this.afterPaint(false);
  }

  private afterPaint(focus = true): void {
    requestAnimationFrame(() => {
      const el = this.feed()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
      if (focus) this.field()?.nativeElement.focus({ preventScroll: true });
    });
  }
}
