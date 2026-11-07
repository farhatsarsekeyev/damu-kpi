import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BellRing,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Database,
  Eye,
  FileBarChart,
  FileText,
  Filter,
  FolderKanban,
  Fingerprint,
  Gauge,
  Info,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import {
  Avatar,
  BlockIcon,
  Change,
  CheckRow,
  EmptyState,
  HorizontalBars,
  KpiCard,
  LineChart,
  Modal,
  PageHeading,
  ProgressRing,
  StatusBadge,
  blockLabel,
} from './components';
import {
  blocks,
  completion,
  isAfterDate,
  formatValue,
  lastUpdated,
  periods,
  productionSeries,
  statusMeta,
  type AppUser,
  type AuditEvent,
  type BlockId,
  type CorrectiveAction,
  type Kpi,
  type Notice,
  type Period,
  type Project,
  type Role,
  type Status,
} from './data';
import type { Route } from './App';

export interface ScreenProps {
  role: Role;
  period: Period;
  kpis: Kpi[];
  allKpis: Kpi[];
  projects: Project[];
  notices: Notice[];
  actions: CorrectiveAction[];
  favorites: string[];
  navigate: (route: Route) => void;
  openBlock: (id: BlockId) => void;
  openKpi: (id: string) => void;
  openProject: (id: string) => void;
  openNotice: (notice: Notice) => void;
  toggleFavorite: (id: string) => void;
  refresh: () => void;
  notify: (text: string) => void;
  logAction: (action: string, detail: string) => void;
  readAll: () => void;
}

const dateToday = '7 ноября 2026';

export function Dashboard({ kpis, projects, period, openKpi, openBlock, openProject, toggleFavorite, favorites, navigate, notices, openNotice }: ScreenProps) {
  const attention = kpis.filter(kpi => ['critical', 'warning', 'noData'].includes(kpi.status));
  const important = ['npl', 'budget', 'subsidies', 'guarantees'].map(id => kpis.find(kpi => kpi.id === id)).filter((kpi): kpi is Kpi => !!kpi);
  const series = productionSeries.map((point, index) => period === '2026-10' || index < productionSeries.length - 1 ? point : { ...point, fact: +(point.fact * (period === '2026-09' ? 0.91 : period === '2026-08' ? 0.82 : 0.93)).toFixed(1) });
  const currentPeriod = periods.find(item => item.value === period)!;
  return <>
    <PageHeading eyebrow={`${dateToday} · ${currentPeriod.label}`} title="Добрый день, Айгерим" description="Главное о работе Фонда — в одной сводке." actions={<button className="button button-secondary heading-report" onClick={() => navigate('reports')}><FileBarChart size={18} />Сформировать отчёт</button>} />
    <section className="summary-hero">
      <div className="summary-hero-text"><span className="summary-kicker"><Sparkles size={15} />Сводный статус</span><h2>Ключевые направления<br />под контролем</h2><p>Производственные показатели растут. Обратите внимание на NPL и график льготного кредитования.</p><div className="summary-stats"><span><i className="summary-dot dot-warning" /><strong>{attention.filter(item => item.status === 'warning').length}</strong> требуют внимания</span><span><i className="summary-dot dot-critical" /><strong>{kpis.filter(item => item.status === 'critical').length}</strong> критических</span><span><i className="summary-dot dot-no-data" /><strong>{kpis.filter(item => item.status === 'noData').length}</strong> без данных</span></div></div>
      <div className="summary-index"><ProgressRing value={87.4} size={160} label="Сводный индекс исполнения KPI: 87,4 процента" /><strong>Индекс исполнения KPI</strong><span>Цель периода — 90,0%</span><span className="index-change"><TrendingUp size={14} />+1,8 п.п. к прошлому месяцу</span></div>
    </section>
    <section className="dashboard-section"><div className="section-heading"><div><h2>Ключевые показатели</h2><span>На {currentPeriod.label.toLowerCase()}</span></div><button className="text-link" onClick={() => navigate('metrics')}>Все показатели<ArrowRight size={16} /></button></div><div className="kpi-grid">{important.map(kpi => <KpiCard key={kpi.id} kpi={kpi} onClick={() => openKpi(kpi.id)} onFavorite={() => toggleFavorite(kpi.id)} favorite={favorites.includes(kpi.id)} />)}</div></section>
    <div className="dashboard-analytics">
      <section className="panel chart-panel"><div className="section-heading"><div><h2>Объём финансовой поддержки</h2><span>Накопительным итогом, млрд ₸</span></div><button className="small-more" onClick={() => openBlock('production')} aria-label="Открыть производственный блок"><ArrowUpRight size={19} /></button></div><LineChart data={series} unit="млрд ₸" title="Объём финансовой поддержки" height={230} /><div className="chart-footnote"><span><strong>361,8 млрд ₸</strong> с начала периода</span><span className="chart-footnote-positive"><TrendingUp size={15} />+8,6% к сентябрю</span></div></section>
      <section className="panel focus-panel"><div className="section-heading"><div><h2>Требуют решения</h2><span>Приоритетные отклонения</span></div><span className="focus-count">{kpis.filter(item => item.status === 'critical').length + projects.filter(item => item.status === 'critical').length}</span></div><div className="focus-list">
        {kpis.filter(item => item.status === 'critical').map(kpi => <button key={kpi.id} className="focus-item" onClick={() => openKpi(kpi.id)}><span className="focus-item-icon"><TrendingDown size={19} /></span><span className="focus-item-content"><strong>{kpi.title.split(' — ')[0]}</strong><span>Факт {formatValue(kpi.fact, kpi.unit, true)} · план {formatValue(kpi.plan, kpi.unit, true)}</span><small>{kpi.comments[0]?.text.slice(0, 80) ?? 'Добавьте пояснение к отклонению'}{kpi.comments[0] ? '…' : ''}</small></span><ChevronRight size={18} /></button>)}
        {projects.filter(item => item.status === 'critical').map(project => <button key={project.id} className="focus-item" onClick={() => openProject(project.id)}><span className="focus-item-icon"><FolderKanban size={19} /></span><span className="focus-item-content"><strong>Сроки проекта сдвинуты</strong><span>{project.title}</span><small>Прогноз завершения: {project.forecast}</small></span><ChevronRight size={18} /></button>)}
      </div><button className="button button-quiet focus-action" onClick={() => navigate('actions')}>Корректирующие действия<ArrowRight size={16} /></button></section>
    </div>
    <section className="dashboard-section"><div className="section-heading"><div><h2>Направления деятельности</h2><span>Перейдите к детализации блока</span></div><span className="updated-label"><span className="live-dot" />Обновлено в 08:30</span></div><div className="block-grid">{blocks.filter(block => block.id !== 'projects').map(block => {
      const blockKpis = kpis.filter(kpi => kpi.block === block.id);
      const alertCount = blockKpis.filter(kpi => ['warning', 'critical', 'noData'].includes(kpi.status)).length;
      return <button className={`block-card block-${block.id}`} key={block.id} onClick={() => openBlock(block.id)}><div className="block-card-top"><span className="block-icon"><BlockIcon block={block.id} size={23} /></span><ArrowUpRight size={19} className="block-arrow" /></div><h3>{block.title}</h3><p>{block.summary}</p><div className="block-card-bottom">{alertCount ? <span className="block-alert"><CircleAlert size={14} />{alertCount} {alertCount === 1 ? 'отклонение' : 'отклонения'}</span> : <span className="block-good"><CheckCircle2 size={14} />В норме</span>}<span>{blockKpis.length} KPI</span></div></button>;
    })}<button className="block-card block-projects" onClick={() => openBlock('projects')}><div className="block-card-top"><span className="block-icon"><BlockIcon block="projects" size={23} /></span><ArrowUpRight size={19} className="block-arrow" /></div><h3>Мониторинг проектов</h3><p>{projects.length} активных проектов</p><div className="block-card-bottom"><span className="block-alert"><CircleAlert size={14} />1 просрочка</span><span>6 проектов</span></div></button></div></section>
    <section className="dashboard-section latest-section"><div className="section-heading"><div><h2>Последние события</h2><span>Изменения, которые могут быть важны</span></div><button className="text-link" onClick={() => navigate('notifications')}>Все уведомления<ArrowRight size={16} /></button></div><div className="latest-list">{notices.slice(0, 3).map(notice => <button key={notice.id} className="latest-item" onClick={() => openNotice(notice)}><span className={`latest-dot priority-${notice.priority}`} /><span><strong>{notice.title}</strong><small>{notice.time}</small></span><ChevronRight size={17} /></button>)}</div></section>
  </>;
}

export function MetricsPage({ kpis, role, openKpi, favorites, toggleFavorite }: ScreenProps) {
  const [query, setQuery] = useState('');
  const [block, setBlock] = useState('all');
  const [status, setStatus] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const filtered = kpis.filter(kpi => (!query || `${kpi.title} ${kpi.category} ${kpi.owner}`.toLowerCase().includes(query.toLowerCase())) && (block === 'all' || kpi.block === block) && (status === 'all' || kpi.status === status) && (!onlyFavorites || favorites.includes(kpi.id)));
  return <>
    <PageHeading title="Показатели" description="Единый справочник: план, факт, статус и ответственный." actions={<button className={`button ${onlyFavorites ? 'button-primary' : 'button-secondary'}`} onClick={() => setOnlyFavorites(!onlyFavorites)}><Bookmark size={18} fill={onlyFavorites ? 'currentColor' : 'none'} />Избранное<span className="button-count">{favorites.length}</span></button>} />
    <div className="filter-bar"><label className="search-field"><Search size={18} /><input aria-label="Поиск показателей" placeholder="Найти показатель" value={query} onChange={event => setQuery(event.target.value)} />{query && <button className="clear-input" aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={16} /></button>}</label><label className="select-field"><span className="sr-only">Блок показателей</span><select value={block} onChange={event => setBlock(event.target.value)}><option value="all">Все направления</option><option value="production">Производственная деятельность</option><option value="hr">HR-показатели</option><option value="budget">Бюджет</option>{role !== 'Менеджер' && <option value="risks">Риски</option>}</select><ChevronDown size={16} /></label><label className="select-field"><span className="sr-only">Статус</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Любой статус</option><option value="normal">В норме</option><option value="warning">Требует внимания</option><option value="critical">Критично</option><option value="noData">Нет данных</option></select><ChevronDown size={16} /></label><button className="icon-button reset-filters" title="Сбросить фильтры" aria-label="Сбросить фильтры" onClick={() => { setQuery(''); setBlock('all'); setStatus('all'); setOnlyFavorites(false); }}><RotateCcw size={17} /></button></div>
    <section className="panel table-panel"><div className="table-panel-heading"><span>Найдено <strong>{filtered.length}</strong> показателей</span><span>Факт / план за выбранный период</span></div>{filtered.length ? <><div className="table-scroll"><table className="data-table metrics-table"><thead><tr><th>Показатель</th><th>Факт</th><th>План</th><th>Исполнение</th><th>Статус</th><th>Владелец</th><th><span className="sr-only">Действия</span></th></tr></thead><tbody>{filtered.map(kpi => { const percent = completion(kpi); return <tr key={kpi.id}><td><button className="table-kpi-name" onClick={() => openKpi(kpi.id)}><strong>{kpi.title}</strong><small>{blockLabel(kpi.block)} · {kpi.category}</small></button></td><td className="table-value">{formatValue(kpi.fact, kpi.unit, true)}</td><td className="table-plan">{formatValue(kpi.plan, kpi.unit, true)}</td><td><div className="table-completion"><span>{percent === null ? '—' : `${percent.toFixed(0)}%`}</span><span className="mini-progress"><i style={{ width: `${Math.min(percent ?? 0, 100)}%` }} /></span></div></td><td><StatusBadge status={kpi.status} /></td><td><span className="table-owner">{kpi.owner}</span></td><td><div className="table-row-actions"><button className={`icon-button favorite ${favorites.includes(kpi.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(kpi.id)} aria-label={favorites.includes(kpi.id) ? 'Убрать из избранного' : 'В избранное'}><Bookmark size={16} fill={favorites.includes(kpi.id) ? 'currentColor' : 'none'} /></button><button className="icon-button" onClick={() => openKpi(kpi.id)} aria-label={`Открыть ${kpi.title}`}><ChevronRight size={18} /></button></div></td></tr>; })}</tbody></table></div><div className="metrics-mobile-list">{filtered.map(kpi => <KpiCard key={kpi.id} kpi={kpi} onClick={() => openKpi(kpi.id)} onFavorite={() => toggleFavorite(kpi.id)} favorite={favorites.includes(kpi.id)} />)}</div></> : <EmptyState title="Ничего не найдено" text="Измените запрос или сбросьте фильтры, чтобы увидеть все доступные показатели." action={<button className="button button-secondary" onClick={() => { setQuery(''); setBlock('all'); setStatus('all'); setOnlyFavorites(false); }}>Сбросить фильтры</button>} />}</section>
  </>;
}

export function BlockPage({ kpis, blockId, openKpi, favorites, toggleFavorite }: ScreenProps & { blockId: BlockId }) {
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');
  const block = blocks.find(item => item.id === blockId)!;
  const blockKpis = kpis.filter(kpi => kpi.block === blockId);
  const categories = Array.from(new Set(blockKpis.map(kpi => kpi.category)));
  const filtered = blockKpis.filter(kpi => category === 'all' || kpi.category === category);
  const chartKpi = blockKpis.find(kpi => kpi.id === (blockId === 'risks' ? 'npl' : blockId === 'budget' ? 'budget' : blockId === 'hr' ? 'staffing' : 'subsidies')) ?? blockKpis[0];
  const averageCompletion = blockKpis.filter(kpi => kpi.fact !== null).reduce((sum, kpi, _, array) => sum + Math.min((completion(kpi) ?? 0) / array.length, 1.2), 0) * 100;
  return <>
    <PageHeading eyebrow="Показатели / Направление" title={block.title} description={block.description} actions={<StatusBadge status={blockKpis.some(kpi => kpi.status === 'critical') ? 'critical' : blockKpis.some(kpi => kpi.status === 'warning') ? 'warning' : 'normal'} full />} />
    <section className="block-overview"><div className="block-overview-main"><span className="block-overview-icon"><BlockIcon block={blockId} size={30} /></span><div><span>Среднее исполнение плана</span><strong>{averageCompletion.toFixed(1).replace('.', ',')}%</strong><small>по показателям с актуальными данными</small></div></div><div className="block-overview-stat"><span>Показателей</span><strong>{blockKpis.length}</strong></div><div className="block-overview-stat"><span>Требуют внимания</span><strong className="text-warning">{blockKpis.filter(kpi => kpi.status !== 'normal').length}</strong></div><div className="block-overview-stat"><span>Обновлено</span><strong className="overview-time">08:30<small>7 ноября</small></strong></div></section>
    <div className="filter-row-wrap"><div className="segmented-filter">{['all', ...categories].map(item => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item === 'all' ? 'Все показатели' : item}</button>)}</div>{blockId === 'production' && <label className="select-field compact-select"><MapPinIcon /><select value={region} onChange={event => setRegion(event.target.value)} aria-label="Регион"><option value="all">Все регионы</option><option value="almaty">Алматы</option><option value="astana">Астана</option></select><ChevronDown size={15} /></label>}</div>
    {region !== 'all' && <div className="info-banner"><Info size={18} />Показана демонстрационная детализация: {region === 'almaty' ? 'Алматы' : 'Астана'}<button onClick={() => setRegion('all')} aria-label="Сбросить регион"><X size={16} /></button></div>}
    <div className="metric-card-grid">{filtered.map(kpi => <KpiCard key={kpi.id} kpi={{ ...kpi, fact: kpi.fact === null || region === 'all' ? kpi.fact : +(kpi.fact * (region === 'almaty' ? 0.16 : 0.12)).toFixed(1) }} onClick={() => openKpi(kpi.id)} onFavorite={() => toggleFavorite(kpi.id)} favorite={favorites.includes(kpi.id)} />)}</div>
    {chartKpi && <section className="panel block-chart"><div className="section-heading"><div><h2>{blockId === 'risks' ? 'Динамика NPL' : blockId === 'hr' ? 'Динамика укомплектованности' : 'План и факт накопительным итогом'}</h2><span>{chartKpi.title} · {chartKpi.unit}</span></div><button className="text-link" onClick={() => openKpi(chartKpi.id)}>Подробнее<ArrowRight size={16} /></button></div><LineChart data={chartKpi.history} unit={chartKpi.unit} /><div className="chart-data-note"><Info size={15} />Нажмите на график или используйте стрелки для просмотра значений. Доступна таблица данных.</div></section>}
    {filtered.length > 0 && filtered[0].breakdown.length > 0 && <section className="panel"><div className="section-heading"><div><h2>Распределение по {blockId === 'hr' ? 'подразделениям' : blockId === 'risks' ? 'отраслям' : blockId === 'budget' ? 'статьям' : 'программам'}</h2><span>{filtered[0].title} · факт и план</span></div></div><HorizontalBars items={filtered[0].breakdown} unit={filtered[0].unit} /></section>}
    <div className="source-note"><Database size={16} /><span>Источник: {chartKpi?.source}. {blockKpis.find(kpi => kpi.status === 'noData') && 'По части показателей ожидается загрузка данных.'}</span><span>{lastUpdated}</span></div>
  </>;
}

function MapPinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>; }

export function ProjectsPage({ projects, openProject }: ScreenProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [owner, setOwner] = useState('all');
  const [deadline, setDeadline] = useState('all');
  const filtered = projects.filter(project => (!query || `${project.title} ${project.program}`.toLowerCase().includes(query.toLowerCase())) && (status === 'all' || (status === 'attention' ? ['warning', 'critical'].includes(project.status) : project.status === status)) && (owner === 'all' || project.owner === owner) && (deadline === 'all' || (deadline === 'overdue' ? isAfterDate(project.forecast, project.deadline) : project.deadline.endsWith(deadline))));
  return <>
    <PageHeading title="Проекты" description="Контроль сроков, бюджета и контрольных точек." actions={<button className="button button-secondary" onClick={() => { setStatus('attention'); setDeadline('all'); }}><CircleAlert size={18} />Требуют внимания<span className="button-count">{projects.filter(project => ['warning', 'critical'].includes(project.status)).length}</span></button>} />
    <div className="project-stat-strip"><span><FolderKanban size={18} /><strong>{projects.length}</strong>активных проектов</span><span><CheckCircle2 size={18} /><strong>{projects.filter(project => project.status === 'normal').length}</strong>идут по плану</span><span><Clock3 size={18} /><strong>2</strong>контрольные точки в ноябре</span><span><CircleAlert size={18} /><strong>1</strong>просроченный проект</span></div>
    <div className="filter-bar project-filter"><label className="search-field"><Search size={18} /><input placeholder="Название или программа" aria-label="Поиск проектов" value={query} onChange={event => setQuery(event.target.value)} /></label><select className="native-select" aria-label="Статус проекта" value={status} onChange={event => setStatus(event.target.value)}><option value="all">Все статусы</option><option value="normal">В норме</option><option value="warning">Требует внимания</option><option value="critical">Критично</option><option value="review">На проверке</option><option value="attention">Требуют внимания</option></select><select className="native-select" aria-label="Ответственный" value={owner} onChange={event => setOwner(event.target.value)}><option value="all">Все ответственные</option>{Array.from(new Set(projects.map(project => project.owner))).map(name => <option key={name}>{name}</option>)}</select><select className="native-select" aria-label="Срок проекта" value={deadline} onChange={event => setDeadline(event.target.value)}><option value="all">Любой срок</option><option value="2026">Завершение в 2026</option><option value="overdue">Есть просрочка</option></select><button className="icon-button" onClick={() => { setQuery(''); setStatus('all'); setOwner('all'); setDeadline('all'); }} title="Сбросить фильтры"><RotateCcw size={17} /></button></div>
    <div className="catalog-caption"><span><strong>{filtered.length}</strong> проектов</span><span>Прогресс по контрольным точкам</span></div>
    {filtered.length ? <div className="project-list">{filtered.map(project => <button key={project.id} className="project-card" onClick={() => openProject(project.id)}><div className="project-card-heading"><div><span className="project-program">{project.program}</span><h2>{project.title}</h2></div><StatusBadge status={project.status} /></div><p className="project-description">{project.description}</p><div className="project-progress-row"><span>Прогресс выполнения</span><strong>{project.progress}%</strong></div><div className="progress-track project-progress"><span style={{ width: `${project.progress}%` }} /></div><div className="project-details-row"><div><span>Ответственный</span><strong><Avatar name={project.owner} small />{project.owner}</strong></div><div><span>Срок завершения</span><strong><CalendarDays size={15} />{project.deadline}</strong></div><div><span>Бюджет, млрд ₸</span><strong>{project.spent.toLocaleString('ru-RU')} <small>/ {project.budget.toLocaleString('ru-RU')}</small></strong></div><div className={`project-forecast ${isAfterDate(project.forecast, project.deadline) ? 'forecast-late' : ''}`}><span>Прогноз</span><strong>{isAfterDate(project.forecast, project.deadline) ? <Clock3 size={15} /> : <CheckCircle2 size={15} />}{isAfterDate(project.forecast, project.deadline) ? 'Сдвинут' : 'По плану'}</strong></div></div><div className="project-card-footer"><span>Обновлено {project.updated}</span><span>Подробнее<ArrowRight size={15} /></span></div></button>)}</div> : <EmptyState title="Проекты не найдены" text="Попробуйте изменить параметры фильтрации." action={<button className="button button-secondary" onClick={() => { setQuery(''); setStatus('all'); setOwner('all'); setDeadline('all'); }}>Сбросить фильтры</button>} />}
  </>;
}

export function NotificationsPage({ notices, openNotice, readAll }: ScreenProps) {
  const [filter, setFilter] = useState('all');
  const filtered = notices.filter(notice => filter === 'all' || (filter === 'unread' ? !notice.read : notice.category === filter));
  return <><PageHeading title="Уведомления" description="Отклонения, сроки и изменения в данных." actions={<button className="button button-secondary" onClick={readAll}><CheckCheckIcon />Прочитать все</button>} /><div className="segmented-filter notification-filter">{[['all', 'Все'], ['unread', 'Непрочитанные'], ['Риски и KPI', 'Показатели'], ['Проекты', 'Проекты'], ['Данные', 'Данные']].map(([id, label]) => <button key={id} className={filter === id ? 'selected' : ''} onClick={() => setFilter(id)}>{label}{id === 'unread' && <span className="filter-badge">{notices.filter(notice => !notice.read).length}</span>}</button>)}</div><section className="panel notification-list">{filtered.length ? filtered.map(notice => <button className={`notification-item ${!notice.read ? 'notification-unread' : ''}`} key={notice.id} onClick={() => openNotice(notice)}><span className={`notification-type notification-${notice.priority}`}>{notice.type === 'report' ? <FileText size={21} /> : notice.type === 'project' ? <FolderKanban size={21} /> : notice.type === 'system' ? <Database size={21} /> : <BellRing size={21} />}</span><span className="notification-content"><span className="notification-title"><strong>{notice.title}</strong>{!notice.read && <i />}</span><p>{notice.text}</p><small>{notice.time} · {notice.category}</small></span><ChevronRight size={19} className="notification-arrow" /></button>) : <EmptyState title="В этой категории пусто" text="Новые уведомления появятся здесь, когда показатели или проекты потребуют вашего внимания." />}</section><div className="notification-security"><LockKeyhole size={17} /><span>В push-уведомлениях не отображаются конфиденциальные значения показателей.</span></div></>;
}

function CheckCheckIcon() { return <CheckCircle2 size={18} />; }

export function FavoritesPage({ kpis, favorites, openKpi, toggleFavorite, navigate }: ScreenProps) {
  const items = kpis.filter(kpi => favorites.includes(kpi.id));
  return <><PageHeading title="Избранное" description="Ваши показатели для быстрого контроля." actions={<button className="button button-secondary" onClick={() => navigate('metrics')}><Plus size={18} />Добавить показатель</button>} />{items.length ? <div className="metric-card-grid">{items.map(kpi => <KpiCard key={kpi.id} kpi={kpi} onClick={() => openKpi(kpi.id)} onFavorite={() => toggleFavorite(kpi.id)} favorite />)}</div> : <EmptyState title="Добавьте важные показатели" text="Нажмите на закладку в карточке KPI, чтобы закрепить её здесь." action={<button className="button button-primary" onClick={() => navigate('metrics')}>Открыть показатели<ArrowRight size={17} /></button>} />}</>;
}

export function ActionsPage({ actions, kpis, openKpi, updateAction }: ScreenProps & { updateAction: (id: string, status: CorrectiveAction['status']) => void }) {
  const [filter, setFilter] = useState('active');
  const visible = actions.filter(action => filter === 'all' || (filter === 'active' ? action.status !== 'Выполнено' : action.status === filter));
  return <><PageHeading title="Корректирующие действия" description="От отклонения — к конкретному результату и ответственному." /><div className="segmented-filter action-filter">{[['active', 'Активные'], ['На проверке', 'На проверке'], ['Выполнено', 'Выполнено'], ['all', 'Все']].map(([key, label]) => <button key={key} className={filter === key ? 'selected' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div><div className="action-list">{visible.length ? visible.map(action => { const kpi = kpis.find(item => item.id === action.kpiId); return <article className="panel action-card" key={action.id}><div className="action-card-top"><label className={`action-status-select action-status-${action.status === 'Выполнено' ? 'done' : action.status === 'На проверке' ? 'review' : 'progress'}`}><span /><select aria-label={`Статус: ${action.title}`} value={action.status} onChange={event => updateAction(action.id, event.target.value as CorrectiveAction['status'])}><option>В работе</option><option>На проверке</option><option>Выполнено</option></select><ChevronDown size={14} /></label><span className="action-id">#{action.id.replace('action-', '').replace('a', '0')}</span></div><h2>{action.title}</h2>{kpi && <button className="related-kpi" onClick={() => openKpi(kpi.id)}><Gauge size={16} /><span>Связанный показатель: <strong>{kpi.title}</strong></span><ChevronRight size={16} /></button>}<div className="action-owner"><Avatar name={action.owner} small /><span>{action.owner}</span><span className="action-deadline"><CalendarDays size={15} />до {action.deadline}</span></div></article>; }) : <EmptyState title="Здесь пока ничего нет" text="Выберите другой статус или создайте действие из карточки показателя." />}</div></>;
}

export function ReportsPage({ kpis, projects, role, period, onPrint }: ScreenProps & { onPrint: (sections: BlockId[], comments: boolean, dynamics: boolean) => void }) {
  const [sections, setSections] = useState<BlockId[]>(role === 'Менеджер' ? ['production', 'hr', 'budget', 'projects'] : ['production', 'hr', 'budget', 'risks', 'projects']);
  const [comments, setComments] = useState(true);
  const [dynamics, setDynamics] = useState(true);
  const allowed = blocks.filter(block => role !== 'Менеджер' || block.id !== 'risks');
  const toggleSection = (id: BlockId) => setSections(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  return <><PageHeading title="Отчёты" description="Готовая управленческая сводка для совещания." /><div className="reports-layout"><section className="report-builder panel"><div className="builder-title"><span className="builder-number">1</span><div><h2>Период отчётности</h2><p>Выбран в верхней панели приложения</p></div></div><div className="report-period"><CalendarDays size={19} /><strong>{periods.find(item => item.value === period)?.label}</strong><span>Изменить период ↑</span></div><div className="builder-divider" /><div className="builder-title"><span className="builder-number">2</span><div><h2>Состав отчёта</h2><p>Выберите разделы, которые нужно включить</p></div></div><div className="report-sections">{allowed.map(block => <CheckRow key={block.id} checked={sections.includes(block.id)} onChange={() => toggleSection(block.id)}><span className="report-check-label"><BlockIcon block={block.id} size={18} />{block.title}<small>{block.id === 'projects' ? projects.length : kpis.filter(kpi => kpi.block === block.id).length} позиций</small></span></CheckRow>)}</div><div className="builder-divider" /><div className="builder-title"><span className="builder-number">3</span><div><h2>Дополнительно</h2></div></div><CheckRow checked={dynamics} onChange={() => setDynamics(!dynamics)}>Динамика и сравнение с планом</CheckRow><CheckRow checked={comments} onChange={() => setComments(!comments)}>Комментарии ответственных</CheckRow><button className="button button-primary report-generate" disabled={!sections.length} onClick={() => onPrint(sections, comments, dynamics)}><FileBarChart size={19} />Сформировать PDF<ArrowRight size={17} /></button><p className="report-privacy"><ShieldCheck size={14} />В отчёт попадут только доступные вам данные. Экспорт будет записан в журнал.</p></section><section className="report-preview-wrap"><div className="preview-label"><span>Предпросмотр</span><span>A4 · {sections.length} разделов</span></div><div className="report-paper"><header className="paper-header"><div className="paper-logo">damu<span>.</span><small>KPI</small></div><span>Для внутреннего<br />использования</span></header><span className="paper-overline">Управленческий отчёт</span><h2>Состояние ключевых<br />показателей Фонда</h2><p className="paper-period">{periods.find(item => item.value === period)?.label}</p><div className="paper-summary"><strong>87,4<small>%</small></strong><div><span>Сводный индекс исполнения KPI</span><p>4 показателя в норме. 2 требуют<br />незамедлительного решения.</p></div></div><div className="paper-line" /><h3>Включены разделы</h3><ul className="paper-section-list">{sections.map(id => <li key={id}><CheckCircle2 size={13} />{blocks.find(block => block.id === id)?.title}</li>)}</ul><footer><span>Данные актуальны на {lastUpdated}</span><span>1 / {Math.max(sections.length, 1)}</span></footer></div><div className="preview-note"><Info size={16} />В окне печати выберите «Сохранить как PDF»</div></section></div></>;
}

export function ProfilePage({ role, setRole, onLogout, notices, navigate, notify }: ScreenProps & { setRole: (role: Role) => void; onLogout: () => void }) {
  const [notifications, setNotifications] = useStoredPreference('damu-notification-settings', { critical: true, projects: true, digest: false });
  return <><PageHeading title="Профиль и настройки" description="Личные данные, уведомления и безопасность." /><div className="profile-layout"><div className="profile-main"><section className="panel profile-card"><div className="profile-card-top"><Avatar name="Айгерим Сагиндикова" /><div><h2>Айгерим Сагиндикова</h2><p>Член Правления · Правление Фонда</p><span><span className="live-dot" />Сессия активна</span></div></div><div className="profile-info"><div><Mail size={17} /><span>a.sagindikova@damu.kz</span></div><div><UserRound size={17} /><span>ID сотрудника: DMU-0248</span></div></div></section><section className="panel settings-card"><div className="section-heading"><div><h2>Роль и доступ</h2><span>Демонстрация разграничения прав</span></div><ShieldCheck size={21} /></div><label className="form-label">Роль в демонстрационном контуре<select value={role} onChange={event => { setRole(event.target.value as Role); notify(`Включён режим: ${event.target.value}`); }}><option>Руководитель</option><option>Менеджер</option><option>Администратор</option></select></label><p className="form-hint">{role === 'Руководитель' ? 'Доступны все сводные показатели, риски и отчёты.' : role === 'Менеджер' ? 'Доступны показатели направлений, комментарии и действия. Риски скрыты.' : 'Доступны показатели, справочники, пользователи и журнал действий.'}</p><button className="settings-link" onClick={() => navigate('metrics')}><KeyRound size={18} /><span><strong>Область ответственности</strong><small>5 подразделений · 13 показателей</small></span><ChevronRight size={18} /></button></section><section className="panel settings-card"><div className="section-heading"><div><h2>Уведомления</h2><span>Выберите, о чём вы хотите узнавать</span></div><Bell size={21} /></div><ToggleRow title="Критические отклонения" subtitle="KPI и риск-лимиты" checked={notifications.critical} onChange={value => setNotifications({ ...notifications, critical: value })} /><ToggleRow title="Проекты и сроки" subtitle="Контрольные точки и просрочки" checked={notifications.projects} onChange={value => setNotifications({ ...notifications, projects: value })} /><ToggleRow title="Еженедельная сводка" subtitle="По понедельникам в 08:00" checked={notifications.digest} onChange={value => setNotifications({ ...notifications, digest: value })} /><button className="settings-link" onClick={() => navigate('notifications')}><BellRing size={18} /><span><strong>История уведомлений</strong><small>{notices.filter(notice => !notice.read).length} непрочитанных</small></span><ChevronRight size={18} /></button></section></div><aside className="profile-side"><section className="panel settings-card security-settings"><div className="section-heading"><div><h2>Безопасность</h2></div><LockKeyhole size={21} /></div><button className="settings-link" onClick={() => notify('Биометрический вход доступен в нативной iOS-версии')}><Fingerprint size={23} /><span><strong>Face ID</strong><small>Настроить быстрый вход</small></span><ChevronRight size={18} /></button><button className="settings-link" onClick={() => notify('В демонстрации PIN-код не требуется')}><KeyRound size={21} /><span><strong>PIN-код</strong><small>Изменить код доступа</small></span><ChevronRight size={18} /></button><button className="settings-link" onClick={() => notify('Другие активные сессии не найдены')}><Laptop size={20} /><span><strong>Активные сессии</strong><small>Это устройство · сейчас</small></span><ChevronRight size={18} /></button><div className="security-note"><ShieldCheck size={16} /><span>Данные скрываются при сворачивании приложения в нативной версии.</span></div></section><section className="panel about-card"><span className="about-brand">damu. <small>KPI</small></span><span>Версия 1.0 · прототип</span><button onClick={() => notify('Служба поддержки: support@damu.kz')}>Помощь и поддержка<ArrowUpRight size={15} /></button><button onClick={onLogout} className="logout-button"><LogOut size={17} />Выйти из профиля</button></section></aside></div></>;
}

function useStoredPreference<T>(key: string, initial: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : initial; } catch { return initial; } });
  const update = (value: T) => { setState(value); try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Preference remains in memory. */ } };
  return [state, update];
}

function ToggleRow({ title, subtitle, checked, onChange }: { title: string; subtitle: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="toggle-row"><span><strong>{title}</strong><small>{subtitle}</small></span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /><span className="toggle-switch" /></label>;
}

export function SearchPage({ kpis, projects, query, setQuery, openKpi, openProject }: ScreenProps & { query: string; setQuery: (query: string) => void }) {
  const matchingKpis = kpis.filter(kpi => !query || `${kpi.title} ${kpi.category} ${kpi.owner}`.toLowerCase().includes(query.toLowerCase()));
  const matchingProjects = projects.filter(project => query && `${project.title} ${project.description} ${project.owner}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading title="Поиск" description="Показатели, проекты и ответственные — в одном поиске." /><label className="search-page-field"><Search size={23} /><input autoFocus placeholder="Например, NPL или цифровизация" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setQuery(''); }} aria-label="Поиск по приложению" />{query && <button className="icon-button" onClick={() => setQuery('')} aria-label="Очистить"><X size={18} /></button>}<kbd>ESC</kbd></label>{!query && <div className="search-hints"><span>Часто ищут</span>{['NPL', 'Бюджет', 'Субсидии', 'Персонал'].map(hint => <button key={hint} onClick={() => setQuery(hint)}>{hint}<ArrowUpRight size={14} /></button>)}</div>}<div className="search-results"><section><div className="section-heading"><h2>Показатели <span className="result-count">{matchingKpis.length}</span></h2></div>{matchingKpis.length ? <div className="metric-card-grid">{matchingKpis.map(kpi => <KpiCard key={kpi.id} kpi={kpi} onClick={() => openKpi(kpi.id)} />)}</div> : <EmptyState title="Показатели не найдены" text="Проверьте название или попробуйте другой запрос." />}</section>{query && <section><div className="section-heading"><h2>Проекты <span className="result-count">{matchingProjects.length}</span></h2></div><div className="project-list">{matchingProjects.map(project => <button key={project.id} className="project-card search-project" onClick={() => openProject(project.id)}><span className="project-program">{project.program}</span><h2>{project.title}</h2><div className="search-project-meta"><StatusBadge status={project.status} /><span>{project.progress}% выполнено</span><ArrowRight size={17} /></div></button>)}</div>{!matchingProjects.length && <EmptyState title="Проекты не найдены" text="Попробуйте поиск по названию программы или ответственному." />}</section>}</div></>;
}

export function AdminPage({ allKpis, users, audit, updateUsers, updateKpi, notify, logAction }: ScreenProps & { users: AppUser[]; audit: AuditEvent[]; updateUsers: Dispatch<SetStateAction<AppUser[]>>; updateKpi: (id: string, plan: number, warningThreshold: number) => void }) {
  const [tab, setTab] = useState('users');
  const [userModal, setUserModal] = useState(false);
  const [kpiModal, setKpiModal] = useState<Kpi | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Менеджер' as Role, department: '' });
  function createUser(event: React.FormEvent) {
    event.preventDefault();
    if (!newUser.name || !newUser.email.includes('@') || !newUser.department) return;
    updateUsers(previous => [...previous, { ...newUser, id: Date.now(), active: true }]);
    logAction('Добавлен пользователь', `${newUser.name} · ${newUser.role}`);
    setUserModal(false);
    setNewUser({ name: '', email: '', role: 'Менеджер', department: '' });
    notify('Пользователь добавлен');
  }
  return <><PageHeading eyebrow="Защищённый контур управления" title="Администрирование" description="Пользователи, справочник KPI и контроль качества данных." actions={<span className="admin-role"><ShieldCheck size={18} />Администратор</span>} /><div className="admin-tabs segmented-filter">{[['users', 'Пользователи'], ['dictionary', 'Справочник KPI'], ['integrations', 'Источники данных'], ['audit', 'Журнал действий']].map(([key, label]) => <button key={key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>{tab === 'users' && <section className="panel table-panel"><div className="table-panel-heading"><div className="inline-search"><Search size={17} /><span>{users.length} пользователей</span></div><button className="button button-primary button-small" onClick={() => setUserModal(true)}><Plus size={17} />Добавить</button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Пользователь</th><th>Роль</th><th>Подразделение</th><th>Статус</th><th>Доступ</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td><div className="user-table-cell"><Avatar name={user.name} small /><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td>{user.role}</td><td>{user.department}</td><td><span className={`user-active ${user.active ? '' : 'inactive'}`}><i />{user.active ? 'Активен' : 'Заблокирован'}</span></td><td><button className="button button-secondary button-small" onClick={() => { updateUsers(previous => previous.map(item => item.id === user.id ? { ...item, active: !item.active } : item)); logAction(user.active ? 'Заблокирован пользователь' : 'Разблокирован пользователь', user.name); notify('Доступ пользователя обновлён'); }}>{user.active ? 'Заблокировать' : 'Разблокировать'}</button></td></tr>)}</tbody></table></div></section>}{tab === 'dictionary' && <section className="panel table-panel"><div className="table-panel-heading"><span>Единый источник определений</span><span>{allKpis.length} показателей</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>ID / показатель</th><th>Единица</th><th>План</th><th>Порог внимания</th><th>Периодичность</th><th>Источник</th><th /></tr></thead><tbody>{allKpis.map(kpi => <tr key={kpi.id}><td><strong className="admin-kpi-id">{kpi.id}</strong><button className="table-kpi-name" onClick={() => setKpiModal(kpi)}>{kpi.title}</button></td><td>{kpi.unit}</td><td>{kpi.plan}</td><td>{kpi.warningThreshold ?? 85}%</td><td>{kpi.periodicity}</td><td>{kpi.source}</td><td><button className="icon-button" onClick={() => setKpiModal(kpi)} aria-label={`Редактировать ${kpi.title}`}><Pencil size={16} /></button></td></tr>)}</tbody></table></div></section>}{tab === 'integrations' && <div className="integration-list">{[{ name: 'ERP / Бюджетная система', records: '248 записей', status: 'Синхронизировано', icon: Database }, { name: 'Система программ поддержки', records: '1 264 записи', status: 'Синхронизировано', icon: Database }, { name: 'HRIS / HCM', records: '38 записей', status: 'Ошибка загрузки', icon: UsersRound }, { name: 'Риск-система', records: '82 записи', status: 'Синхронизировано', icon: ShieldCheck }, { name: 'Система управления проектами', records: '6 проектов', status: 'Синхронизировано', icon: FolderKanban }].map(source => <article className="panel integration-card" key={source.name}><span className={`integration-icon ${source.status === 'Ошибка загрузки' ? 'integration-error' : ''}`}><source.icon size={22} /></span><div><h2>{source.name}</h2><p>{source.records} · обновление ежедневно в 08:30</p></div><span className={`integration-status ${source.status === 'Ошибка загрузки' ? 'integration-status-error' : ''}`}><i />{source.status}</span><button className="button button-secondary button-small" onClick={() => { notify(source.status === 'Ошибка загрузки' ? 'Повторная загрузка поставлена в очередь' : 'Источник проверен'); logAction('Проверен источник данных', source.name); }}><RefreshCw size={15} />{source.status === 'Ошибка загрузки' ? 'Повторить' : 'Проверить'}</button>{source.status === 'Ошибка загрузки' && <div className="integration-message"><CircleAlert size={15} />Публикация данных остановлена: отсутствуют значения за 2 периода. Последние корректные данные сохранены.</div>}</article>)}</div>}{tab === 'audit' && <section className="panel audit-panel"><div className="section-heading"><div><h2>Журнал действий</h2><span>Изменения настроек, комментарии и экспорт отчётов</span></div><FileText size={20} /></div>{audit.map(event => <div className="audit-row" key={event.id}><span className="audit-icon"><Check size={15} /></span><div><strong>{event.action}</strong><p>{event.detail}</p><small>{event.author}</small></div><time>{event.time}</time></div>)}</section>}{userModal && <Modal title="Добавить пользователя" subtitle="Права доступа определяются ролью" onClose={() => setUserModal(false)}><form className="form-stack" onSubmit={createUser}><label className="form-label">Фамилия и имя<input required autoFocus value={newUser.name} onChange={event => setNewUser({ ...newUser, name: event.target.value })} placeholder="Например, Алия Касымова" /></label><label className="form-label">Корпоративная почта<input required type="email" value={newUser.email} onChange={event => setNewUser({ ...newUser, email: event.target.value })} placeholder="name@damu.kz" /></label><label className="form-label">Подразделение<input required value={newUser.department} onChange={event => setNewUser({ ...newUser, department: event.target.value })} /></label><label className="form-label">Роль<select value={newUser.role} onChange={event => setNewUser({ ...newUser, role: event.target.value as Role })}><option>Менеджер</option><option>Руководитель</option><option>Администратор</option></select></label><button className="button button-primary full-width" type="submit">Добавить пользователя</button></form></Modal>}{kpiModal && <Modal title="Настройка показателя" subtitle={kpiModal.title} onClose={() => setKpiModal(null)}><form className="form-stack" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); updateKpi(kpiModal.id, Number(form.get('plan')), Number(form.get('threshold'))); setKpiModal(null); }}><div className="form-grid"><label className="form-label">Плановое значение<input type="number" step="0.1" min="0" name="plan" defaultValue={kpiModal.plan} required /></label><label className="form-label">Единица измерения<input defaultValue={kpiModal.unit} disabled /></label></div><label className="form-label">Порог «Требует внимания», %<input type="number" min="1" max="200" name="threshold" defaultValue={kpiModal.warningThreshold ?? 85} required /></label><label className="form-label">Методика расчёта<textarea defaultValue={kpiModal.method} rows={3} disabled /></label><div className="method-formula"><span>Формула</span><strong>{kpiModal.formula}</strong></div><div className="info-banner"><Info size={17} />Изменения плана и порогов будут сохранены в журнале.</div><button type="submit" className="button button-primary full-width">Сохранить изменения</button></form></Modal>}</>;
}
