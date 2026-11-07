import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Database,
  Eye,
  EyeOff,
  FileBarChart,
  FileText,
  Fingerprint,
  Flag,
  FolderKanban,
  History,
  Info,
  Link2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  PenLine,
  Plus,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Avatar, Brand, Change, HorizontalBars, LineChart, Modal, StatusBadge } from './components';
import { completion, deviation, formatValue, type CorrectiveAction, type Kpi, type Project, type Role } from './data';

export function KpiDetail({ kpi, role, favorite, actions, onClose, onFavorite, onComment, onAction }: { kpi: Kpi; role: Role; favorite: boolean; actions: CorrectiveAction[]; onClose: () => void; onFavorite: () => void; onComment: (text: string) => void; onAction: (title: string, owner: string, deadline: string) => void }) {
  const [tab, setTab] = useState('overview');
  const [comment, setComment] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [owner, setOwner] = useState(kpi.owner);
  const [deadline, setDeadline] = useState('2026-11-20');
  const percent = completion(kpi);
  const delta = deviation(kpi);
  function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    onComment(comment.trim());
    setComment('');
  }
  function submitAction(event: FormEvent) {
    event.preventDefault();
    if (!actionTitle.trim() || !deadline) return;
    onAction(actionTitle.trim(), owner, deadline);
    setActionTitle('');
    setTab('overview');
  }
  return <><Modal title="Детализация показателя" subtitle={`ID ${kpi.id} · ${kpi.category}`} onClose={onClose} wide footer={<><div className="detail-footer-source"><Database size={15} />{kpi.source} · {kpi.updated}</div><button className="button button-primary" onClick={() => setTab('comment')}><MessageSquareText size={17} />Добавить пояснение</button></>}>
    <div className="detail-kpi-heading"><div><span className="detail-category">{kpi.category}</span><h3>{kpi.title}</h3><p>{kpi.description}</p></div><div className="detail-kpi-controls"><StatusBadge status={kpi.status} full /><button className={`icon-button favorite ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} title={favorite ? 'Убрать из избранного' : 'В избранное'} aria-label={favorite ? 'Убрать из избранного' : 'В избранное'}><Bookmark size={21} fill={favorite ? 'currentColor' : 'none'} /></button></div></div>
    <div className="detail-stat-grid"><div className="detail-stat detail-stat-primary"><span>Фактическое значение</span><strong>{formatValue(kpi.fact, kpi.unit)}</strong>{kpi.fact !== null && <Change value={kpi.change} lowerIsBetter={kpi.lowerIsBetter} suffix={kpi.unit === '%' ? ' п.п. к пред. периоду' : '% к пред. периоду'} />}</div><div className="detail-stat"><span>Плановое значение</span><strong>{formatValue(kpi.plan, kpi.unit)}</strong><small>Установленная цель</small></div><div className="detail-stat"><span>Исполнение плана</span><strong>{percent === null ? '—' : `${percent.toFixed(1).replace('.', ',')}%`}</strong>{percent !== null && <div className="mini-progress"><i style={{ width: `${Math.min(percent, 100)}%` }} /></div>}</div><div className="detail-stat"><span>Отклонение</span><strong className={kpi.status === 'critical' ? 'text-critical' : kpi.status === 'warning' ? 'text-warning' : ''}>{delta === null ? '—' : `${delta > 0 ? '+' : ''}${kpi.unit === '%' ? `${delta.toLocaleString('ru-RU')} п.п.` : formatValue(delta, kpi.unit)}`}</strong><small>{kpi.lowerIsBetter ? 'Меньше — лучше' : 'Больше — лучше'}</small></div></div>
    <div className="detail-tabs" role="tablist" aria-label="Сведения о показателе">{[['overview', 'Обзор'], ['comment', `Комментарии ${kpi.comments.length}`], ['action', `Действия ${actions.length}`], ['history', 'История']].map(([key, label]) => <button role="tab" aria-selected={tab === key} className={tab === key ? 'selected' : ''} key={key} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === 'overview' && <div className="detail-overview"><section className="detail-chart"><div className="section-heading"><div><h4>Динамика за 10 месяцев</h4><span>Факт и план · {kpi.unit}</span></div><span className="detail-year">2026</span></div><LineChart data={kpi.history} unit={kpi.unit} title={`Динамика: ${kpi.title}`} /></section>{kpi.fact === null && <div className="no-data-banner"><CircleAlert size={21} /><div><strong>Данные ещё не поступили</strong><p>Значение не рассчитано и не заменяется нулём. Следующая загрузка ожидается {kpi.updated.replace('Ожидается ', '')}.</p></div></div>}{kpi.comments[0] && <section className="owner-comment"><div className="owner-comment-heading"><span><MessageSquareText size={17} />Комментарий ответственного</span><span>{kpi.comments[0].time}</span></div><p>{kpi.comments[0].text}</p><div><Avatar name={kpi.comments[0].author} small /><strong>{kpi.comments[0].author}</strong><span>{kpi.comments[0].role}</span></div></section>}{kpi.breakdown.length > 0 && <section className="detail-breakdown"><div className="section-heading"><div><h4>Детализация</h4><span>Разрезы по доступным данным</span></div></div><HorizontalBars items={kpi.breakdown} unit={kpi.unit} /></section>}<section className="kpi-metadata"><h4>Методика и источник</h4><div className="metadata-grid"><span><UserRound size={16} /><span><small>Ответственный</small><strong>{kpi.owner}</strong><em>{kpi.department}</em></span></span><span><Database size={16} /><span><small>Источник данных</small><strong>{kpi.source}</strong><em>Обновление: {kpi.periodicity.toLowerCase()}</em></span></span><span><BookOpen size={16} /><span><small>Методика расчёта</small><strong>{kpi.method}</strong></span></span><span><FileText size={16} /><span><small>Формула</small><strong>{kpi.formula}</strong><em>Уровень доступа: {kpi.confidentiality}</em></span></span></div></section></div>}
    {tab === 'comment' && <section className="comment-section"><div className="comments-list">{kpi.comments.length ? kpi.comments.map(item => <article className="comment" key={item.id}><Avatar name={item.author} /><div><div className="comment-author"><strong>{item.author}</strong><span>{item.time}</span></div><small>{item.role}</small><p>{item.text}</p></div></article>) : <div className="empty-inline"><MessageSquareText size={30} /><h4>Комментариев пока нет</h4><p>Добавьте пояснение, чтобы руководитель видел причину отклонения и следующий шаг.</p></div>}</div><form className="comment-form" onSubmit={submitComment}><label htmlFor="kpi-comment">Ваше пояснение</label><textarea id="kpi-comment" placeholder="Укажите причину отклонения и что планируется сделать…" value={comment} onChange={event => setComment(event.target.value)} rows={4} required /><div><span>Комментарий будет виден пользователям с доступом к показателю.</span><button className="button button-primary" type="submit" disabled={!comment.trim()}><Send size={16} />Опубликовать</button></div></form></section>}
    {tab === 'action' && <div className="detail-actions"><section><h4>Корректирующие действия</h4>{actions.length ? actions.map(action => <article className="detail-action" key={action.id}><span className="action-check"><ClipboardCheck size={20} /></span><div><strong>{action.title}</strong><p>{action.owner} · до {action.deadline}</p></div><span className={`action-state ${action.status === 'Выполнено' ? 'done' : ''}`}>{action.status}</span></article>) : <div className="empty-inline"><ClipboardCheck size={30} /><p>Для этого показателя ещё не назначены действия.</p></div>}</section><form className="action-form form-stack" onSubmit={submitAction}><h4>Назначить новое действие</h4><label className="form-label">Что необходимо сделать<input required placeholder="Конкретный результат действия" value={actionTitle} onChange={event => setActionTitle(event.target.value)} /></label><div className="form-grid"><label className="form-label">Ответственный<input value={owner} onChange={event => setOwner(event.target.value)} required /></label><label className="form-label">Срок<input type="date" value={deadline} onChange={event => setDeadline(event.target.value)} required /></label></div><button type="submit" className="button button-primary"><Plus size={17} />Создать действие</button></form></div>}
    {tab === 'history' && <section className="history-section"><div className="info-banner"><History size={17} />Все изменения значений и комментариев сохраняются в журнале.</div><div className="table-scroll"><table className="data-table"><thead><tr><th>Период</th><th>Факт</th><th>План</th><th>Изменение</th><th>Источник</th></tr></thead><tbody>{kpi.history.slice().reverse().map((point, index) => <tr key={point.month}><td>{point.month} 2026</td><td>{formatValue(point.fact, kpi.unit)}</td><td>{formatValue(point.plan, kpi.unit)}</td><td>{index === kpi.history.length - 1 || point.fact === null || kpi.history[kpi.history.length - index - 2].fact === null ? '—' : `${(point.fact - kpi.history[kpi.history.length - index - 2].fact!).toFixed(1)} ${kpi.unit}`}</td><td>{kpi.source}</td></tr>)}</tbody></table></div><div className="history-note"><ShieldCheck size={17} /><span>Изменение методики доступно администратору KPI. Ручная правка значений в мобильном приложении запрещена.</span></div></section>}
  </Modal></>;
}

export function ProjectDetail({ project, kpi, onClose, onKpi, onComment }: { project: Project; kpi?: Kpi; onClose: () => void; onKpi: (id: string) => void; onComment: (text: string) => void }) {
  const [tab, setTab] = useState('overview');
  const [comment, setComment] = useState('');
  return <Modal title="Карточка проекта" subtitle={`${project.program} · ${project.department}`} onClose={onClose} wide footer={<><div className="detail-footer-source"><Clock3 size={15} />Обновлено {project.updated}</div><button className="button button-primary" onClick={() => setTab('comments')}><MessageSquareText size={17} />Добавить комментарий</button></>}>
    <div className="project-detail-heading"><span className="project-icon"><FolderKanban size={28} /></span><div><h3>{project.title}</h3><p>{project.description}</p></div><StatusBadge status={project.status} full /></div>
    <div className="project-detail-stats"><div><span>Прогресс выполнения</span><strong>{project.progress}%</strong><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div></div><div><span>Плановая дата</span><strong>{project.deadline}</strong><small>Завершение проекта</small></div><div><span>Бюджет, млрд ₸</span><strong>{project.spent.toLocaleString('ru-RU')} <small>/ {project.budget.toLocaleString('ru-RU')}</small></strong><small>Освоено {(project.spent / project.budget * 100).toFixed(0)}%</small></div><div className={project.status === 'critical' ? 'project-forecast-late' : ''}><span>Прогноз завершения</span><strong>{project.forecast}</strong><small>{project.status === 'critical' ? 'Требуется пересмотр плана' : 'В пределах планового срока'}</small></div></div>
    <div className="detail-tabs" role="tablist">{[['overview', 'Контрольные точки'], ['risks', `Риски ${project.risks.length}`], ['comments', `Обновления ${project.comments.length}`]].map(([key, label]) => <button role="tab" aria-selected={tab === key} key={key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === 'overview' && <div className="project-overview"><section className="milestones"><h4>План проекта</h4>{project.milestones.map((milestone, index) => <div className={`milestone ${milestone.done ? 'milestone-done' : ''} ${milestone.overdue ? 'milestone-overdue' : ''}`} key={milestone.title}><div className="milestone-marker">{milestone.done ? <Check size={16} /> : <span>{index + 1}</span>}</div><div><strong>{milestone.title}</strong><span>{milestone.overdue ? `Просрочено · план ${milestone.date}` : milestone.date}</span></div>{milestone.done && <span className="milestone-done-label">Завершено</span>}</div>)}</section><aside className="project-info"><h4>О проекте</h4><div><span>Владелец</span><strong>{project.owner}</strong></div><div><span>Программа</span><strong>{project.program}</strong></div><div><span>Регион</span><strong>{project.region}</strong></div><div><span>Дата начала</span><strong>{project.start}</strong></div>{kpi && <button className="project-related-kpi" onClick={() => onKpi(kpi.id)}><Link2 size={17} /><span>Связанный KPI<strong>{kpi.title}</strong></span><ChevronRight size={17} /></button>}</aside></div>}
    {tab === 'risks' && <section className="project-risks">{project.risks.length ? project.risks.map(risk => <article key={risk.title}><span className="risk-level"><CircleAlert size={17} />{risk.level} риск</span><h4>{risk.title}</h4><p>{risk.mitigation}</p><small><ClipboardCheck size={14} />Мера по снижению риска</small></article>) : <div className="empty-inline"><ShieldCheck size={32} /><h4>Критических рисков не выявлено</h4><p>Риски проекта регулярно проверяются ответственным.</p></div>}</section>}
    {tab === 'comments' && <section className="comment-section"><div className="comments-list">{project.comments.length ? project.comments.map(item => <article className="comment" key={item.id}><Avatar name={item.author} /><div><div className="comment-author"><strong>{item.author}</strong><span>{item.time}</span></div><small>{item.role}</small><p>{item.text}</p></div></article>) : <div className="empty-inline"><MessageSquareText size={30} /><p>Пока нет обновлений. Добавьте первый комментарий о ходе проекта.</p></div>}</div><form className="comment-form" onSubmit={event => { event.preventDefault(); if (comment.trim()) { onComment(comment.trim()); setComment(''); } }}><label htmlFor="project-comment">Новое обновление</label><textarea id="project-comment" placeholder="Что изменилось в проекте?" value={comment} onChange={event => setComment(event.target.value)} rows={4} required /><div><span>В комментарии сохранятся автор и дата публикации.</span><button type="submit" className="button button-primary"><Send size={16} />Опубликовать</button></div></form></section>}
  </Modal>;
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('a.sagindikova@damu.kz');
  const [password, setPassword] = useState('demo2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  function login(event: FormEvent) {
    event.preventDefault();
    if (!email.includes('@') || password.length < 6) { setError('Проверьте почту и пароль. Пароль должен содержать не менее 6 символов.'); return; }
    setLoading(true);
    window.setTimeout(onLogin, 650);
  }
  return <div className="login-screen"><section className="login-intro"><Brand /><div className="login-intro-content"><span className="login-label">Единое пространство руководителя</span><h1>Управление<br />начинается<br />с ясности.</h1><p>Ключевые показатели Фонда, проекты и риски — в одной управленческой сводке.</p><div className="login-visual"><div className="login-mini-card"><span>Индекс исполнения KPI</span><strong>87,4<small>%</small></strong><div className="login-mini-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div><span>Динамика за 10 месяцев</span><span>+1,8 п.п.</span></div></div><span className="login-floating-badge"><ShieldCheck size={20} />Данные под контролем</span></div></div><footer>АО Фонд развития предпринимательства «Даму»</footer></section><section className="login-form-side"><div className="login-form-container"><span className="demo-pill">Демонстрационная версия</span><h2>С возвращением</h2><p>Войдите, чтобы открыть управленческую сводку.</p><form onSubmit={login}><label className="form-label">Корпоративная почта<div className="login-input"><Mail size={19} /><input type="email" value={email} onChange={event => { setEmail(event.target.value); setError(''); }} autoComplete="username" /></div></label><label className="form-label">Пароль<div className="login-input"><LockKeyhole size={19} /><input type={passwordVisible ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError(''); }} autoComplete="current-password" /><button type="button" className="icon-button" onClick={() => setPasswordVisible(!passwordVisible)} aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}>{passwordVisible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label><div className="login-helper"><span><CheckCircle2 size={15} />Демо-данные уже заполнены</span><button type="button" onClick={() => { setEmail('a.sagindikova@damu.kz'); setPassword('demo2026'); setError(''); }}>Восстановить доступ</button></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary full-width login-button" type="submit" disabled={loading}>{loading ? 'Открываем сводку…' : <>Войти в Damu KPI<ArrowRight size={18} /></>}</button><div className="login-divider"><span>или быстрый вход</span></div><button type="button" className="button button-secondary full-width" onClick={onLogin}><Fingerprint size={21} />Войти через Face ID</button></form><div className="login-security"><ShieldCheck size={18} /><p>Доступ определяется вашей ролью и областью ответственности. В демонстрации используются вымышленные данные.</p></div></div><footer className="login-support">Нужна помощь? <a href="mailto:support@damu.kz">Связаться с поддержкой</a></footer></section></div>;
}
