import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bookmark,
  ClipboardCheck,
  FileBarChart,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Avatar, Brand, Modal } from './components';
import {
  currentUser,
  completion,
  formatValue,
  getKpiForPeriod,
  initialActions,
  initialAudit,
  initialKpis,
  initialNotices,
  initialProjects,
  initialUsers,
  lastUpdated,
  periods,
  type AuditEvent,
  type BlockId,
  type CorrectiveAction,
  type Kpi,
  type Notice,
  type Period,
  type Project,
  type Role,
  type AppUser,
} from './data';
import {
  ActionsPage,
  AdminPage,
  BlockPage,
  Dashboard,
  FavoritesPage,
  MetricsPage,
  NotificationsPage,
  ProfilePage,
  ProjectsPage,
  ReportsPage,
  SearchPage,
  type ScreenProps,
} from './screens';
import { KpiDetail, LoginScreen, ProjectDetail } from './details';

export type Route = 'dashboard' | 'metrics' | 'projects' | 'notifications' | 'profile' | 'block' | 'reports' | 'favorites' | 'actions' | 'admin' | 'search';

function useStoredState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initialValue;
    } catch { return initialValue; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Demo continues when storage is unavailable. */ }
  }, [key, state]);
  return [state, setState] as const;
}

export default function App() {
  const [route, setRoute] = useState<Route>('dashboard');
  const [period, setPeriod] = useState<Period>('2026-10');
  const [kpis, setKpis] = useStoredState<Kpi[]>('damu-kpis-v1', initialKpis);
  const [projects, setProjects] = useStoredState<Project[]>('damu-projects-v1', initialProjects);
  const [notices, setNotices] = useStoredState<Notice[]>('damu-notices-v1', initialNotices);
  const [actions, setActions] = useStoredState<CorrectiveAction[]>('damu-actions-v1', initialActions);
  const [favorites, setFavorites] = useStoredState<string[]>('damu-favorites-v1', ['npl', 'budget', 'subsidies']);
  const [audit, setAudit] = useStoredState<AuditEvent[]>('damu-audit-v1', initialAudit);
  const [users, setUsers] = useStoredState<AppUser[]>('damu-users-v1', initialUsers);
  const [role, setRole] = useStoredState<Role>('damu-role-v1', 'Руководитель');
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<BlockId>('production');
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('damu-signed-out') !== 'true');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');
  const [printSections, setPrintSections] = useState<BlockId[] | null>(null);
  const [printOptions, setPrintOptions] = useState({ comments: true, dynamics: true });

  const visibleKpis = useMemo(() => kpis.filter(kpi => role !== 'Менеджер' || ['production', 'hr', 'budget'].includes(kpi.block)), [kpis, role]);
  const periodKpis = useMemo(() => visibleKpis.map(kpi => getKpiForPeriod(kpi, period)), [visibleKpis, period]);
  const currentKpi = periodKpis.find(kpi => kpi.id === selectedKpi);
  const currentProject = projects.find(project => project.id === selectedProject);
  const unread = notices.filter(notice => !notice.read).length;
  const isBlocking = selectedKpi !== null || selectedProject !== null || periodOpen || mobileMenu;

  const notify = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 3800);
  }, []);

  const logAction = useCallback((action: string, detail: string) => {
    const now = new Date();
    const event: AuditEvent = { id: `audit-${now.getTime()}`, action, detail, author: currentUser.name, time: now.toLocaleString('ru-RU') };
    setAudit(previous => [event, ...previous]);
  }, [setAudit]);

  function navigate(next: Route) {
    setRoute(next);
    setSelectedKpi(null);
    setSelectedProject(null);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function openBlock(block: BlockId) {
    setSelectedBlock(block);
    if (block === 'projects') navigate('projects');
    else navigate('block');
  }

  function openKpi(id: string) {
    setSelectedProject(null);
    setSelectedKpi(id);
  }

  function toggleFavorite(id: string) {
    const adding = !favorites.includes(id);
    setFavorites(previous => adding ? [...previous, id] : previous.filter(item => item !== id));
    notify(adding ? 'Показатель добавлен в избранное' : 'Показатель удалён из избранного');
  }

  function refresh() {
    setRefreshing(true);
    window.setTimeout(() => { setRefreshing(false); notify('Данные актуальны на 07.11.2026, 08:30'); logAction('Обновлены данные', 'Ручное обновление демонстрационной витрины'); }, 700);
  }

  function addComment(kpiId: string | null, projectId: string | null, text: string) {
    const comment = { id: `comment-${Date.now()}`, author: currentUser.name, role, time: new Date().toLocaleString('ru-RU'), text };
    if (kpiId) setKpis(previous => previous.map(kpi => kpi.id === kpiId ? { ...kpi, comments: [comment, ...kpi.comments] } : kpi));
    if (projectId) setProjects(previous => previous.map(project => project.id === projectId ? { ...project, comments: [comment, ...project.comments] } : project));
    logAction('Добавлен комментарий', kpiId ? kpis.find(kpi => kpi.id === kpiId)?.title ?? kpiId : projects.find(project => project.id === projectId)?.title ?? '');
    notify('Комментарий опубликован');
  }

  function addAction(kpiId: string, title: string, owner: string, deadline: string) {
    setActions(previous => [{ id: `action-${Date.now()}`, kpiId, title, owner, deadline: new Date(deadline).toLocaleDateString('ru-RU'), status: 'В работе' }, ...previous]);
    logAction('Создано корректирующее действие', title);
    notify('Действие назначено ответственному');
  }

  function openNotice(notice: Notice) {
    setNotices(previous => previous.map(item => item.id === notice.id ? { ...item, read: true } : item));
    if (notice.type === 'kpi' && notice.targetId) openKpi(notice.targetId);
    if (notice.type === 'project' && notice.targetId) { setSelectedKpi(null); setSelectedProject(notice.targetId); }
    if (notice.type === 'report') navigate('reports');
  }

  function openPrint(sections: BlockId[], comments: boolean, dynamics: boolean) {
    setPrintSections(sections);
    setPrintOptions({ comments, dynamics });
    logAction('Сформирован отчёт', `${periods.find(item => item.value === period)?.label}: ${sections.length} разделов`);
  }

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSelectedKpi(null);
        setSelectedProject(null);
        setRoute('search');
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (role !== 'Администратор' && route === 'admin') setRoute('dashboard');
    setSelectedKpi(null);
  }, [role, route]);

  useEffect(() => {
    if (!printSections) return;
    const timer = window.setTimeout(() => {
      window.print();
      setPrintSections(null);
      notify('Выберите «Сохранить как PDF» в окне печати');
    }, 250);
    return () => window.clearTimeout(timer);
  }, [printSections, notify]);

  useEffect(() => {
    if (isBlocking) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [isBlocking]);

  const screenProps: ScreenProps = {
    role, period, kpis: periodKpis, allKpis: kpis, projects, notices, actions, favorites,
    navigate, openBlock, openKpi, openProject: id => { setSelectedKpi(null); setSelectedProject(id); },
    openNotice, toggleFavorite, refresh, notify, logAction,
    readAll: () => setNotices(previous => previous.map(notice => ({ ...notice, read: true }))),
  };

  if (!authenticated) return <LoginScreen onLogin={() => { sessionStorage.removeItem('damu-signed-out'); setAuthenticated(true); }} />;

  const menu: { id: Route; label: string; icon: typeof Gauge; count?: number }[] = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'metrics', label: 'Показатели', icon: Gauge },
    { id: 'projects', label: 'Проекты', icon: FolderKanban, count: projects.filter(project => project.status === 'critical').length },
    { id: 'notifications', label: 'Уведомления', icon: Bell, count: unread },
    { id: 'profile', label: 'Профиль', icon: Settings2 },
  ];
  const secondary: { id: Route; label: string; icon: typeof Gauge; count?: number }[] = [
    { id: 'reports', label: 'Отчёты', icon: FileBarChart },
    { id: 'favorites', label: 'Избранное', icon: Bookmark, count: favorites.length },
    { id: 'actions', label: 'Корректирующие действия', icon: ClipboardCheck, count: actions.filter(action => action.status !== 'Выполнено').length },
  ];
  const activeRoute = route === 'block' ? 'metrics' : route;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-mobile-open' : ''}`}>
      <div className="sidebar-top"><Brand /><button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Закрыть меню"><X size={20} /></button></div>
      <div className="workspace-label">Единое пространство<br />управленческой отчётности</div>
      <nav aria-label="Основная навигация" className="sidebar-nav">
        <span className="nav-section-label">Рабочий стол</span>
        {menu.map(item => <button key={item.id} className={`nav-item ${activeRoute === item.id ? 'nav-item-active' : ''}`} onClick={() => navigate(item.id)} aria-current={activeRoute === item.id ? 'page' : undefined}><item.icon size={19} /><span>{item.label}</span>{!!item.count && <span className={`nav-count ${item.id === 'notifications' ? 'nav-count-alert' : ''}`}>{item.count}</span>}</button>)}
        <span className="nav-section-label nav-section-tools">Инструменты</span>
        {secondary.map(item => <button key={item.id} className={`nav-item ${activeRoute === item.id ? 'nav-item-active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={19} /><span>{item.label}</span>{!!item.count && <span className="nav-count">{item.count}</span>}</button>)}
        {role === 'Администратор' && <button className={`nav-item ${activeRoute === 'admin' ? 'nav-item-active' : ''}`} onClick={() => navigate('admin')}><ShieldCheck size={19} /><span>Администрирование</span></button>}
      </nav>
      <div className="sidebar-bottom"><div className="demo-note"><span className="demo-dot" />Демонстрационный контур<span>Данные для прототипа</span></div><button className="profile-shortcut" onClick={() => navigate('profile')}><Avatar name={currentUser.name} /><span><strong>{currentUser.name}</strong><small>{role}</small></span></button></div>
    </aside>
    {mobileMenu && <div className="drawer-scrim" onClick={() => setMobileMenu(false)} aria-hidden="true" />}
    <main className="main-content">
      <header className="topbar">
        <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Открыть меню"><Menu size={22} /></button>
        <div className="topbar-breadcrumb"><span>damu KPI</span>{route !== 'dashboard' && <><span className="breadcrumb-slash">/</span>{menu.concat(secondary).find(item => item.id === activeRoute)?.label ?? (route === 'block' ? 'Показатели' : route === 'admin' ? 'Администрирование' : 'Поиск')}</>}</div>
        <div className="topbar-actions">
          <button className="global-search" onClick={() => navigate('search')}><Search size={18} /><span>Поиск показателей и проектов</span><kbd>⌘ K</kbd></button>
          <button className="period-button" onClick={() => setPeriodOpen(true)}><span>{periods.find(item => item.value === period)?.label}</span><SlidersHorizontal size={16} /></button>
          <button className={`icon-button refresh-button ${refreshing ? 'is-refreshing' : ''}`} onClick={refresh} aria-label="Обновить данные" title="Обновить данные"><RefreshCw size={19} /></button>
          <button className="icon-button notification-button" onClick={() => navigate('notifications')} aria-label={`Уведомления: ${unread} непрочитанных`}><Bell size={20} />{unread > 0 && <span>{unread}</span>}</button>
        </div>
      </header>
      <div className="screen">
        {route === 'dashboard' && <Dashboard {...screenProps} />}
        {route === 'metrics' && <MetricsPage {...screenProps} />}
        {route === 'block' && <BlockPage {...screenProps} blockId={selectedBlock} />}
        {route === 'projects' && <ProjectsPage {...screenProps} />}
        {route === 'notifications' && <NotificationsPage {...screenProps} />}
        {route === 'profile' && <ProfilePage {...screenProps} setRole={setRole} onLogout={() => { sessionStorage.setItem('damu-signed-out', 'true'); setAuthenticated(false); }} />}
        {route === 'reports' && <ReportsPage {...screenProps} onPrint={openPrint} />}
        {route === 'favorites' && <FavoritesPage {...screenProps} />}
        {route === 'actions' && <ActionsPage {...screenProps} updateAction={(id, status) => { setActions(previous => previous.map(action => action.id === id ? { ...action, status } : action)); logAction('Обновлено корректирующее действие', status); notify('Статус действия обновлён'); }} />}
        {route === 'admin' && <AdminPage {...screenProps} users={users} audit={audit} updateUsers={setUsers} updateKpi={(id, plan, warningThreshold) => { setKpis(previous => previous.map(kpi => kpi.id === id ? { ...kpi, plan, warningThreshold } : kpi)); logAction('Изменены план и порог', `${kpis.find(kpi => kpi.id === id)?.title}: план ${plan}, внимание ${warningThreshold}%`); notify('Настройки показателя сохранены'); }} />}
        {route === 'search' && <SearchPage {...screenProps} query={search} setQuery={setSearch} />}
        <footer className="app-footer"><span>Damu KPI · прототип управленческой отчётности</span><span>Данные обновлены {lastUpdated}</span></footer>
      </div>
    </main>
    <nav className="mobile-tabs" aria-label="Мобильная навигация">{menu.map(item => <button key={item.id} className={activeRoute === item.id ? 'mobile-tab-active' : ''} onClick={() => navigate(item.id)}><span className="mobile-tab-icon"><item.icon size={22} />{!!item.count && <i>{item.count}</i>}</span><span>{item.id === 'notifications' ? 'События' : item.label}</span></button>)}</nav>
    {periodOpen && <Modal title="Отчётный период" subtitle="Показатели будут пересчитаны для выбранного периода" onClose={() => setPeriodOpen(false)}><div className="period-options">{periods.map(item => <button className={`period-option ${period === item.value ? 'period-option-selected' : ''}`} key={item.value} onClick={() => { setPeriod(item.value); setPeriodOpen(false); notify(`Выбран период: ${item.label}`); }}><span><strong>{item.label}</strong><small>{item.value === '2026-q3' ? 'Июль — сентябрь, накопительным итогом' : 'Данные на конец месяца'}</small></span><span className="radio-indicator" /></button>)}</div></Modal>}
    {currentKpi && <KpiDetail key={currentKpi.id} kpi={currentKpi} role={role} favorite={favorites.includes(currentKpi.id)} actions={actions.filter(action => action.kpiId === currentKpi.id)} onClose={() => setSelectedKpi(null)} onFavorite={() => toggleFavorite(currentKpi.id)} onComment={text => addComment(currentKpi.id, null, text)} onAction={(title, owner, deadline) => addAction(currentKpi.id, title, owner, deadline)} />}
    {currentProject && <ProjectDetail key={currentProject.id} project={currentProject} kpi={kpis.find(kpi => kpi.id === currentProject.kpiId)} onClose={() => setSelectedProject(null)} onKpi={id => openKpi(id)} onComment={text => addComment(null, currentProject.id, text)} />}
    {printSections && <PrintReport sections={printSections} kpis={periodKpis} projects={projects} period={period} comments={printOptions.comments} dynamics={printOptions.dynamics} />}
    {toast && <div className="toast" role="status"><span className="toast-check">✓</span>{toast}<button onClick={() => setToast('')} aria-label="Закрыть сообщение"><X size={16} /></button></div>}
  </div>;
}

function PrintReport({ sections, kpis, projects, period, comments, dynamics }: { sections: BlockId[]; kpis: Kpi[]; projects: Project[]; period: Period; comments: boolean; dynamics: boolean }) {
  return <div className="print-report">
    <header><Brand /><h1>Управленческая сводка</h1><p>{periods.find(item => item.value === period)?.label} · Сформировано {new Date().toLocaleString('ru-RU')}</p><p>Актуальность данных: {lastUpdated}. Для внутреннего использования.</p></header>
    {sections.map(section => <section key={section}>
      <h2>{section === 'projects' ? 'Мониторинг проектов' : section === 'production' ? 'Производственная деятельность' : section === 'hr' ? 'HR-показатели' : section === 'budget' ? 'Исполнение бюджета' : 'Риск-менеджмент'}</h2>
      {section === 'projects' ? <table><thead><tr><th>Проект</th><th>Прогресс</th><th>Срок</th><th>Прогноз</th><th>Бюджет, млрд ₸</th>{comments && <th>Комментарий</th>}</tr></thead><tbody>{projects.map(project => <tr key={project.id}><td>{project.title}</td><td>{project.progress}%</td><td>{project.deadline}</td><td>{project.forecast}</td><td>{project.spent} / {project.budget}</td>{comments && <td>{project.comments[0]?.text ?? '—'}</td>}</tr>)}</tbody></table> : <table>
        <thead><tr><th>Показатель</th><th>Факт</th><th>План</th>{dynamics && <th>Исполнение</th>}<th>Статус</th><th>Ответственный</th>{comments && <th>Комментарий</th>}</tr></thead>
        <tbody>{kpis.filter(kpi => kpi.block === section).map(kpi => <tr key={kpi.id}><td>{kpi.title}</td><td>{formatValue(kpi.fact, kpi.unit)}</td><td>{formatValue(kpi.plan, kpi.unit)}</td>{dynamics && <td>{completion(kpi)?.toFixed(1).replace('.', ',') ?? '—'}%</td>}<td>{kpi.status === 'normal' ? 'В норме' : kpi.status === 'critical' ? 'Критично' : kpi.status === 'warning' ? 'Требует внимания' : kpi.status === 'noData' ? 'Нет данных' : kpi.status === 'review' ? 'На проверке' : 'Данные устарели'}</td><td>{kpi.owner}</td>{comments && <td>{kpi.comments[0]?.text ?? '—'}</td>}</tr>)}</tbody>
      </table>}
    </section>)}
  </div>;
}
