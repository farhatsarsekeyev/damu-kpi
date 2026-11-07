import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDashed,
  Clock3,
  FileText,
  FolderKanban,
  HeartHandshake,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import { blocks, completion, formatValue, statusMeta, type BlockId, type HistoryPoint, type Kpi, type Status } from './data';

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}>
    <svg viewBox="0 0 42 42" className="brand-mark" aria-hidden="true"><rect width="42" height="42" rx="12" fill="currentColor" /><path d="M12 29V19m9 10V12m9 17V8" stroke="#B7E89F" strokeWidth="5" strokeLinecap="round" /></svg>
    {!compact && <><span className="brand-name">damu<span>.</span></span><span className="brand-divider" /><span className="brand-product">KPI</span></>}
  </div>;
}

export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={`avatar ${small ? 'avatar-small' : ''}`} aria-hidden="true">{name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>;
}

export function StatusBadge({ status, full = false }: { status: Status; full?: boolean }) {
  const Icon = status === 'normal' ? CheckCircle2 : status === 'critical' ? CircleAlert : status === 'warning' ? AlertTriangle : status === 'review' ? Clock3 : CircleDashed;
  return <span className={`status-badge status-${status}`}><Icon size={14} strokeWidth={2} aria-hidden="true" />{full ? statusMeta[status].label : statusMeta[status].shortLabel}</span>;
}

export function BlockIcon({ block, size = 20 }: { block: BlockId; size?: number }) {
  const props = { size, strokeWidth: 1.8 };
  if (block === 'production') return <HeartHandshake {...props} />;
  if (block === 'hr') return <UsersRound {...props} />;
  if (block === 'budget') return <WalletCards {...props} />;
  if (block === 'risks') return <ShieldCheck {...props} />;
  return <FolderKanban {...props} />;
}

export function Change({ value, lowerIsBetter = false, suffix = '%' }: { value: number; lowerIsBetter?: boolean; suffix?: string }) {
  const positive = lowerIsBetter ? value < 0 : value > 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return <span className={`change ${positive ? 'change-positive' : 'change-negative'}`}><Icon size={14} aria-hidden="true" />{value > 0 ? '+' : ''}{String(value).replace('.', ',')}{suffix}</span>;
}

export function KpiCard({ kpi, onClick, onFavorite, favorite = false, compact = false }: { kpi: Kpi; onClick: () => void; onFavorite?: () => void; favorite?: boolean; compact?: boolean }) {
  const percent = completion(kpi);
  return <article className={`kpi-card ${compact ? 'kpi-card-compact' : ''}`}>
    <div className="kpi-card-header">
      <button type="button" className="kpi-category" onClick={onClick}>{kpi.category}<ChevronRight size={13} /></button>
      {onFavorite && <button type="button" className={`icon-button favorite ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label={favorite ? `Убрать «${kpi.title}» из избранного` : `Добавить «${kpi.title}» в избранное`} title={favorite ? 'Убрать из избранного' : 'В избранное'}><Bookmark size={18} fill={favorite ? 'currentColor' : 'none'} /></button>}
    </div>
    <button type="button" className="kpi-card-body" onClick={onClick}>
      <span className="kpi-title">{kpi.title}</span>
      <span className={`kpi-value ${kpi.fact === null ? 'value-empty' : ''}`}>{formatValue(kpi.fact, kpi.unit, true)}</span>
      <span className="kpi-comparison"><span>План {formatValue(kpi.plan, kpi.unit, true)}</span>{kpi.fact !== null && <Change value={kpi.change} lowerIsBetter={kpi.lowerIsBetter} suffix={kpi.unit === '%' ? ' п.п.' : '%'} />}</span>
      <span className={`progress-track ${kpi.status === 'critical' ? 'progress-critical' : kpi.status === 'warning' ? 'progress-warning' : ''}`} aria-hidden="true"><span style={{ width: `${Math.min(percent ?? 0, 100)}%` }} /></span>
      <span className="kpi-card-footer"><StatusBadge status={kpi.status} /><span className="kpi-percent">{percent === null ? 'Ожидаем загрузку' : `${percent.toFixed(1).replace('.', ',')}% исполнения`}</span></span>
    </button>
  </article>;
}

export function LineChart({ data, unit, title = 'Динамика показателя', height = 250 }: { data: HistoryPoint[]; unit: string; title?: string; height?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const gradientId = useId();
  const left = 48;
  const right = 597;
  const top = 20;
  const bottom = 200;
  const width = right - left;
  const values = data.flatMap(item => [item.fact, item.plan].filter((value): value is number => value !== null));
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = Math.max(...values, 1);
  const minimum = rawMin > 0 && rawMax / rawMin < 2 ? Math.max(0, rawMin - (rawMax - rawMin) * 0.6) : 0;
  const maximum = rawMax + (rawMax - minimum) * 0.12;
  const range = maximum - minimum || 1;
  const x = (index: number) => left + (index / Math.max(data.length - 1, 1)) * width;
  const y = (value: number) => bottom - ((value - minimum) / range) * (bottom - top);
  const path = (key: 'fact' | 'plan') => {
    let started = false;
    return data.map((point, index) => {
      if (point[key] === null) { started = false; return ''; }
      const command = started ? 'L' : 'M';
      started = true;
      return `${command} ${x(index)} ${y(point[key]!)}`;
    }).join(' ');
  };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(fraction => minimum + range * fraction);
  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - bounds.left) / bounds.width) * 640;
    setActive(Math.max(0, Math.min(data.length - 1, Math.round(((position - left) / width) * (data.length - 1)))));
  }
  return <div className="chart-root">
    <div className="chart-toolbar"><div className="chart-legend" aria-label="Легенда"><span><i className="legend-fact" />Факт</span><span><i className="legend-plan" />План</span></div><button className="text-button" type="button" onClick={() => setTable(!table)}><BarChart3 size={15} />{table ? 'График' : 'Таблица'}</button></div>
    {!table ? <>
      <div className="chart-wrap" style={{ minHeight: height }}>
        <svg viewBox="0 0 640 235" role="img" aria-label={`${title}. Используйте кнопку «Таблица» для просмотра значений.`} onPointerMove={handlePointer} onPointerLeave={() => setActive(null)} tabIndex={0} onKeyDown={event => {
          if (event.key === 'ArrowRight') { event.preventDefault(); setActive(current => Math.min(data.length - 1, (current ?? -1) + 1)); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); setActive(current => Math.max(0, (current ?? 1) - 1)); }
        }}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a78d6" stopOpacity=".13" /><stop offset="100%" stopColor="#2a78d6" stopOpacity="0" /></linearGradient></defs>
          {ticks.map((tick, index) => <g key={index}><line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke="#e6ebe9" strokeWidth="1" /><text x={left - 10} y={y(tick) + 4} textAnchor="end" className="axis-label">{tick.toFixed(range < 20 ? 1 : 0).replace('.', ',')}</text></g>)}
          <text x={left} y={10} className="axis-label">Единица: {unit}</text>
          <path d={`${path('fact')} L ${x(data.length - 1)} ${bottom} L ${left} ${bottom} Z`} fill={`url(#${gradientId})`} />
          <path d={path('plan')} fill="none" stroke="#eb6834" strokeWidth="2" strokeDasharray="5 5" />
          <path d={path('fact')} fill="none" stroke="#2a78d6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((point, index) => <g key={point.month}><text x={x(index)} y={224} textAnchor="middle" className="axis-label">{point.month}</text>{point.fact !== null && <circle cx={x(index)} cy={y(point.fact)} r={active === index ? 5.5 : 3.5} fill="#2a78d6" stroke="#fff" strokeWidth="2" />}</g>)}
          {active !== null && <line x1={x(active)} x2={x(active)} y1={top} y2={bottom} stroke="#a6b5af" strokeWidth="1" />}
          {data[data.length - 1].fact !== null && <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].fact!)} r="5" fill="#2a78d6" stroke="#fff" strokeWidth="2.5" />}
        </svg>
        {active !== null && <div className={`chart-tooltip ${active > data.length * 0.65 ? 'tooltip-left' : ''}`} style={{ left: `${(x(active) / 640) * 100}%`, top: `${Math.max(0, (y(data[active].fact ?? data[active].plan) / 235) * 100 - 38)}%` }}><strong>{data[active].month} 2026</strong><span><i className="legend-fact" />Факт: {formatValue(data[active].fact, unit)}</span><span><i className="legend-plan" />План: {formatValue(data[active].plan, unit)}</span></div>}
      </div>
    </> : <div className="table-scroll"><table className="data-table chart-table"><caption className="sr-only">{title}</caption><thead><tr><th>Месяц</th><th>Факт, {unit}</th><th>План, {unit}</th></tr></thead><tbody>{data.map(point => <tr key={point.month}><td>{point.month} 2026</td><td>{formatValue(point.fact, unit)}</td><td>{formatValue(point.plan, unit)}</td></tr>)}</tbody></table></div>}
  </div>;
}

export function HorizontalBars({ items, unit = 'млрд ₸' }: { items: { label: string; fact: number; plan: number }[]; unit?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const maximum = Math.max(...items.flatMap(item => [item.fact, item.plan]), 1);
  return <div className="horizontal-bars"><div className="chart-legend"><span><i className="legend-fact brand-legend" />Факт</span><span className="muted">План указан справа</span></div>{items.map((item, index) => <div className="bar-item" key={item.label} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}>
    <div className="bar-label"><span>{item.label}</span><span><strong>{formatValue(item.fact, unit, true)}</strong><span className="bar-plan"> / {formatValue(item.plan, unit, true)}</span></span></div>
    <div className="bar-track" role="img" aria-label={`${item.label}: факт ${formatValue(item.fact, unit)}, план ${formatValue(item.plan, unit)}`}><span style={{ width: `${(item.fact / maximum) * 100}%` }} /><i style={{ left: `${(item.plan / maximum) * 100}%` }} title={`План ${item.plan}`} /></div>
    {active === index && <div className="sr-only">Исполнение {(item.fact / item.plan * 100).toFixed(1)} процентов</div>}
  </div>)}<details className="chart-data-details"><summary>Показать данные таблицей</summary><div className="table-scroll"><table className="data-table"><thead><tr><th>Разрез</th><th>Факт</th><th>План</th></tr></thead><tbody>{items.map(item => <tr key={item.label}><td>{item.label}</td><td>{item.fact}</td><td>{item.plan}</td></tr>)}</tbody></table></div></details></div>;
}

export function ProgressRing({ value, size = 148, label }: { value: number; size?: number; label?: string }) {
  const radius = 61;
  const length = 2 * Math.PI * radius;
  return <div className="progress-ring" style={{ width: size, height: size }} role="img" aria-label={label ?? `Исполнение ${value}%`}>
    <svg viewBox="0 0 150 150"><circle cx="75" cy="75" r={radius} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="8" /><circle cx="75" cy="75" r={radius} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - Math.min(value, 100) / 100)} transform="rotate(-90 75 75)" /></svg>
    <span><strong>{String(value).replace('.', ',')}</strong><small>%</small></span>
  </div>;
}

export function Modal({ title, subtitle, children, onClose, wide = false, footer }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean; footer?: ReactNode }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], summary, [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modalRef.current)) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, []);
  return <div className="modal-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div className={`modal ${wide ? 'modal-wide' : ''}`} ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}>
    <header className="modal-header"><div><h2 id="modal-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={22} /></button></header>
    <div className="modal-body">{children}</div>{footer && <footer className="modal-footer">{footer}</footer>}
  </div></div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><FileText size={25} /></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return <label className="check-row"><input type="checkbox" checked={checked} onChange={onChange} /><span className="custom-check">{checked && <Check size={14} />}</span><span>{children}</span></label>;
}

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function blockLabel(id: BlockId) {
  return blocks.find(block => block.id === id)?.shortTitle ?? id;
}
