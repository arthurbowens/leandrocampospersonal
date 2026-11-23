import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Vector recreation of the Leandro Campos brand: LC monogram + wordmark. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.stacked]': "layout() === 'stacked'" },
  template: `
    <svg class="mark" viewBox="0 0 84 76" role="img" aria-label="Leandro Campos">
      <!-- L (white, italic) -->
      <path d="M17 4h13L22.5 58H52l-1.7 12H5.5z" fill="#fff" />
      <!-- red slash -->
      <path d="M30.5 40 36 36.5 31.5 70H25z" fill="#e5242b" />
      <!-- C (green) -->
      <path
        d="M80 12C70-1 49 0 42 15 35 30 40 48 54 53c9 3 18 0 24-6l-3-9c-4 5-11 7-17 4-8-4-11-15-7-24 4-8 14-11 21-6z"
        fill="#4fb04f"
      />
    </svg>
    <span class="word">
      <span class="name">LEANDRO</span>
      <span class="surname"><i></i>CAMPOS<i></i></span>
      @if (tagline()) {
        <span class="tag">PERSONAL TRAINER <b>|</b> CONSULTORIA ONLINE</span>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      color: #fff;
      line-height: 1;
    }
    .mark {
      height: 2.6em;
      width: auto;
      flex: none;
    }
    .word {
      display: flex;
      flex-direction: column;
      gap: 0.28em;
    }
    .name {
      font-family: 'Oswald', 'Arial Narrow', sans-serif;
      font-weight: 600;
      font-size: 1.35em;
      letter-spacing: 0.1em;
    }
    .surname {
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-family: 'Oswald', 'Arial Narrow', sans-serif;
      font-weight: 500;
      font-size: 0.72em;
      letter-spacing: 0.5em;
      color: #4fb04f;
    }
    .surname i {
      flex: 1;
      height: 2px;
      background: #e5242b;
      min-width: 0.8em;
    }
    .surname i:last-child {
      background: #4fb04f;
    }
    .tag {
      font-size: 0.42em;
      letter-spacing: 0.22em;
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
    }
    .tag b {
      color: #e5242b;
      font-weight: 400;
    }
    :host(.stacked) {
      flex-direction: column;
      gap: 0.9rem;
      text-align: center;
    }
    :host(.stacked) .mark {
      height: 4.6em;
    }
    :host(.stacked) .word {
      align-items: stretch;
    }
    :host(.stacked) .name {
      font-size: 2em;
    }
  `,
})
export class Logo {
  readonly layout = input<'inline' | 'stacked'>('inline');
  readonly tagline = input(false);
}
