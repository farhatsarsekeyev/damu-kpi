export type Status = 'normal' | 'warning' | 'critical' | 'noData' | 'stale' | 'review';
export type BlockId = 'production' | 'hr' | 'budget' | 'risks' | 'projects';
export type Period = '2026-10' | '2026-09' | '2026-08' | '2026-q3';
export type Role = 'Руководитель' | 'Менеджер' | 'Администратор';
export type IconName = 'production' | 'hr' | 'budget' | 'risks' | 'projects';

export interface HistoryPoint {
  month: string;
  fact: number | null;
  plan: number;
}

export interface Breakdown {
  label: string;
  fact: number;
  plan: number;
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  time: string;
  text: string;
}

export interface CorrectiveAction {
  id: string;
  kpiId: string;
  title: string;
  owner: string;
  deadline: string;
  status: 'В работе' | 'На проверке' | 'Выполнено';
}

export interface Kpi {
  id: string;
  title: string;
  block: BlockId;
  category: string;
  description: string;
  businessMeaning: string;
  unit: string;
  fact: number | null;
  plan: number;
  warningThreshold?: number;
  status: Status;
  change: number;
  lowerIsBetter?: boolean;
  owner: string;
  department: string;
  source: string;
  method: string;
  formula: string;
  updated: string;
  periodicity: string;
  confidentiality: 'Внутренний' | 'Конфиденциальный';
  region: string;
  history: HistoryPoint[];
  breakdown: Breakdown[];
  comments: Comment[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: Status;
  stage: string;
  progress: number;
  owner: string;
  department: string;
  program: string;
  region: string;
  start: string;
  deadline: string;
  forecast: string;
  budget: number;
  spent: number;
  updated: string;
  kpiId?: string;
  milestones: { title: string; date: string; done: boolean; overdue?: boolean }[];
  risks: { title: string; level: string; mitigation: string }[];
  comments: Comment[];
}

export interface Notice {
  id: string;
  title: string;
  text: string;
  time: string;
  type: 'kpi' | 'project' | 'report' | 'system';
  targetId?: string;
  priority: 'critical' | 'warning' | 'info';
  read: boolean;
  category: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  detail: string;
  author: string;
  time: string;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
  active: boolean;
}

export const periods: { value: Period; label: string; short: string }[] = [
  { value: '2026-10', label: 'Октябрь 2026', short: 'Октябрь' },
  { value: '2026-09', label: 'Сентябрь 2026', short: 'Сентябрь' },
  { value: '2026-08', label: 'Август 2026', short: 'Август' },
  { value: '2026-q3', label: 'III квартал 2026', short: 'III квартал' },
];

export const blocks: { id: BlockId; title: string; shortTitle: string; description: string; icon: IconName; summary: string }[] = [
  { id: 'production', title: 'Производственная деятельность', shortTitle: 'Производство', description: 'Поддержка предпринимателей и исполнение программ', icon: 'production', summary: '4 направления поддержки' },
  { id: 'hr', title: 'HR-показатели', shortTitle: 'Персонал', description: 'Численность, развитие и вовлечённость команды', icon: 'hr', summary: '864 сотрудника' },
  { id: 'budget', title: 'Исполнение бюджета', shortTitle: 'Бюджет', description: 'План, факт и прогноз исполнения бюджета', icon: 'budget', summary: 'Исполнено 89,4%' },
  { id: 'risks', title: 'Риск-менеджмент', shortTitle: 'Риски', description: 'Провизии, RWA, NPL и риск-мероприятия', icon: 'risks', summary: '2 показателя требуют внимания' },
  { id: 'projects', title: 'Мониторинг проектов', shortTitle: 'Проекты', description: 'Сроки, бюджеты и контрольные точки проектов', icon: 'projects', summary: '6 активных проектов' },
];

const history = (values: (number | null)[], plan: number): HistoryPoint[] =>
  ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт'].map((month, index) => ({
    month,
    fact: values[index],
    plan: +(plan * (0.91 + index * 0.01)).toFixed(1),
  }));

export const initialKpis: Kpi[] = [
  {
    id: 'subsidies', title: 'Объём субсидирования', block: 'production', category: 'Субсидии',
    description: 'Объём средств, направленных на субсидирование ставок по кредитам предпринимателей.', businessMeaning: 'Доступность финансирования для малого и среднего бизнеса.',
    unit: 'млрд ₸', fact: 214.8, plan: 250, status: 'warning', change: 8.2, owner: 'Асель Нурланова', department: 'Департамент субсидирования', source: 'Система учёта программ поддержки', method: 'Сумма выплаченных субсидий за отчётный период, без учёта возвратов.', formula: 'Σ выплаченных субсидий за период', updated: '07.11.2026, 08:30', periodicity: 'Ежедневно', confidentiality: 'Внутренний', region: 'Все регионы',
    history: history([107.3, 112.4, 119.8, 131.6, 142.1, 151.9, 163.8, 178.4, 198.6, 214.8], 250),
    breakdown: [{ label: 'Даму-Регионы', fact: 74.8, plan: 80 }, { label: 'Экономика простых вещей', fact: 62.3, plan: 72 }, { label: 'Даму-Көмек', fact: 44.5, plan: 54 }, { label: 'Бизнес-Бастау', fact: 33.2, plan: 44 }],
    comments: [{ id: 'c1', author: 'Асель Нурланова', role: 'Директор департамента', time: '06.11.2026, 16:40', text: 'Отставание связано с переносом выплат по двум программам. Заявки на 18,6 млрд ₸ уже согласованы и поступят в оплату на следующей неделе.' }],
  },
  {
    id: 'guarantees', title: 'Объём выданных гарантий', block: 'production', category: 'Гарантии',
    description: 'Совокупный объём гарантий Фонда, выданных предпринимателям в отчётном периоде.', businessMeaning: 'Объём кредитования предпринимателей при недостаточности залогового обеспечения.',
    unit: 'млрд ₸', fact: 162.4, plan: 150, status: 'normal', change: 12.8, owner: 'Ержан Сапаров', department: 'Департамент гарантирования', source: 'CRM гарантирования', method: 'Сумма обязательств по гарантиям, договоры которых вступили в силу в отчётном периоде.', formula: 'Σ действующих гарантий', updated: '07.11.2026, 08:30', periodicity: 'Ежедневно', confidentiality: 'Внутренний', region: 'Все регионы',
    history: history([62, 71, 79, 85, 94, 102, 111, 123, 144, 162.4], 150),
    breakdown: [{ label: 'Банк ЦентрКредит', fact: 42.8, plan: 39 }, { label: 'Halyk Bank', fact: 38.6, plan: 36 }, { label: 'Kaspi Bank', fact: 32.2, plan: 31 }, { label: 'Другие банки', fact: 48.8, plan: 44 }], comments: [],
  },
  {
    id: 'lending', title: 'Льготное кредитование', block: 'production', category: 'Кредитование',
    description: 'Объём финансирования предпринимателей в рамках программ льготного кредитования.', businessMeaning: 'Исполнение лимитов и доступность льготных заёмных средств.',
    unit: 'млрд ₸', fact: 84.6, plan: 120, status: 'critical', change: -4.2, owner: 'Марат Жолдасов', department: 'Департамент развития программ', source: 'Кредитная витрина', method: 'Сумма выданных займов по действующим программам льготного кредитования.', formula: 'Σ выданных займов за период', updated: '07.11.2026, 08:15', periodicity: 'Ежедневно', confidentiality: 'Внутренний', region: 'Все регионы',
    history: history([31, 37, 42, 49, 57, 65, 72, 79, 88.3, 84.6], 120),
    breakdown: [{ label: 'Даму-Орда', fact: 28.4, plan: 38 }, { label: 'Национальная экономика', fact: 24.1, plan: 35 }, { label: 'Развитие регионов', fact: 19.5, plan: 28 }, { label: 'Микрокредитование', fact: 12.6, plan: 19 }],
    comments: [{ id: 'c2', author: 'Марат Жолдасов', role: 'Директор департамента', time: '07.11.2026, 09:05', text: 'В октябре банки-партнёры усилили требования к заёмщикам. Работаем над упрощением пакета документов и пересмотром отраслевых ограничений.' }],
  },
  {
    id: 'nonfinancial', title: 'Нефинансовая поддержка', block: 'production', category: 'Обучение и развитие',
    description: 'Количество предпринимателей, прошедших обучение и получивших консультационную поддержку.', businessMeaning: 'Охват предпринимателей мерами развития компетенций.',
    unit: 'чел.', fact: 18540, plan: 17000, status: 'normal', change: 16.4, owner: 'Динара Утегенова', department: 'Департамент развития предпринимательства', source: 'Портал Бизнес-Бастау', method: 'Уникальные участники завершённых программ и мероприятий за период.', formula: 'COUNT(DISTINCT participant_id)', updated: '06.11.2026, 18:00', periodicity: 'Ежедневно', confidentiality: 'Внутренний', region: 'Все регионы',
    history: history([2700, 3900, 5400, 6900, 8400, 10400, 12200, 14500, 16680, 18540], 17000),
    breakdown: [{ label: 'Алматы', fact: 3840, plan: 3100 }, { label: 'Астана', fact: 3260, plan: 2800 }, { label: 'Туркестанская область', fact: 2480, plan: 2400 }, { label: 'Другие регионы', fact: 8960, plan: 8700 }], comments: [],
  },
  {
    id: 'sme', title: 'Поддержанные субъекты МСБ', block: 'production', category: 'Общий охват',
    description: 'Количество уникальных субъектов малого и среднего бизнеса, получивших поддержку.', businessMeaning: 'Итоговый охват бизнеса всеми инструментами Фонда.',
    unit: 'компаний', fact: 12480, plan: 11800, status: 'normal', change: 9.7, owner: 'Асель Нурланова', department: 'Департамент субсидирования', source: 'Единая витрина программ', method: 'Уникальные БИН получателей хотя бы одного действующего инструмента поддержки.', formula: 'COUNT(DISTINCT business_id)', updated: '07.11.2026, 08:30', periodicity: 'Ежедневно', confidentiality: 'Внутренний', region: 'Все регионы',
    history: history([3200, 4300, 5700, 6900, 7900, 8900, 10100, 10800, 11380, 12480], 11800), breakdown: [], comments: [],
  },
  {
    id: 'review-time', title: 'Средний срок рассмотрения', block: 'production', category: 'Операционная эффективность',
    description: 'Среднее число рабочих дней от регистрации заявки до принятия решения.', businessMeaning: 'Скорость предоставления поддержки предпринимателю.',
    unit: 'дней', fact: 12.4, plan: 10, status: 'warning', change: 3.5, lowerIsBetter: true, owner: 'Ержан Сапаров', department: 'Центр сопровождения заявок', source: 'CRM программ поддержки', method: 'Среднеарифметическое сроков закрытых заявок в календарных днях.', formula: 'AVG(decision_date − request_date)', updated: '07.11.2026, 07:45', periodicity: 'Ежедневно', confidentiality: 'Внутренний', region: 'Все регионы',
    history: history([11.2, 11, 10.8, 10.5, 10.3, 10.9, 11.5, 11.8, 12, 12.4], 10), breakdown: [], comments: [],
  },
  {
    id: 'staffing', title: 'Укомплектованность штата', block: 'hr', category: 'Численность',
    description: 'Отношение фактической численности сотрудников к утверждённой штатной численности.', businessMeaning: 'Обеспеченность Фонда персоналом для выполнения функций и планов.',
    unit: '%', fact: 93.2, plan: 95, status: 'warning', change: 0.5, owner: 'Айгерим Есенова', department: 'Департамент управления персоналом', source: 'HRIS / HCM', method: 'Фактическая численность на последний день периода ÷ штатное расписание.', formula: '864 ÷ 927 × 100%', updated: '01.11.2026, 10:00', periodicity: 'Ежемесячно', confidentiality: 'Внутренний', region: 'Все подразделения',
    history: history([91.1, 91.4, 91.8, 92, 92.2, 92.4, 92.5, 92.6, 92.7, 93.2], 95),
    breakdown: [{ label: 'Центральный аппарат', fact: 94.2, plan: 95 }, { label: 'Региональные филиалы', fact: 92.1, plan: 95 }, { label: 'Проектные подразделения', fact: 89.6, plan: 93 }],
    comments: [{ id: 'c3', author: 'Айгерим Есенова', role: 'Директор по персоналу', time: '04.11.2026, 11:20', text: '63 открытые вакансии. По 18 приоритетным позициям кандидаты уже на финальном этапе, ожидаем выход новых сотрудников в ноябре.' }],
  },
  {
    id: 'turnover', title: 'Текучесть персонала', block: 'hr', category: 'Стабильность команды',
    description: 'Доля сотрудников, уволившихся по собственному желанию за отчётный период.', businessMeaning: 'Сохранение знаний и стабильность команды Фонда.',
    unit: '%', fact: 7.8, plan: 8, status: 'normal', change: -1.3, lowerIsBetter: true, owner: 'Айгерим Есенова', department: 'Департамент управления персоналом', source: 'HRIS / HCM', method: 'Уволившиеся по собственному желанию ÷ среднесписочная численность.', formula: '65 ÷ 834 × 100%', updated: '01.11.2026, 10:00', periodicity: 'Ежемесячно', confidentiality: 'Внутренний', region: 'Все подразделения',
    history: history([6.8, 7.1, 7.2, 7.4, 7.5, 7.6, 7.8, 8, 7.9, 7.8], 8), breakdown: [], comments: [],
  },
  {
    id: 'training', title: 'Охват обучением', block: 'hr', category: 'Развитие',
    description: 'Доля сотрудников, завершивших хотя бы одну образовательную программу.', businessMeaning: 'Развитие профессиональных компетенций команды.',
    unit: '%', fact: null, plan: 75, status: 'noData', change: 0, owner: 'Айгерим Есенова', department: 'Департамент управления персоналом', source: 'Платформа обучения', method: 'Сотрудники с завершённой программой ÷ среднесписочная численность.', formula: 'COUNT(completed_employee) ÷ AVG(headcount) × 100%', updated: 'Ожидается 08.11.2026', periodicity: 'Ежемесячно', confidentiality: 'Внутренний', region: 'Все подразделения',
    history: history([38, 42, 45, 49, 51, 54, 58, 63, null, null], 75), breakdown: [], comments: [],
  },
  {
    id: 'budget', title: 'Исполнение бюджета', block: 'budget', category: 'Финансовый план',
    description: 'Фактическое исполнение расходов относительно плана накопительным итогом.', businessMeaning: 'Контроль использования ресурсов Фонда и исполнения финансового плана.',
    unit: 'млрд ₸', fact: 312.8, plan: 350, status: 'warning', change: 4.9, owner: 'Тимур Аблаев', department: 'Финансовый департамент', source: 'ERP / Бюджетная система', method: 'Фактические расходы по проведённым операциям, без авансовых платежей.', formula: 'Σ фактических расходов накопительным итогом', updated: '07.11.2026, 08:30', periodicity: 'Ежедневно', confidentiality: 'Конфиденциальный', region: 'Все подразделения',
    history: history([81, 97, 112, 130, 148, 167, 188, 216, 298.2, 312.8], 350),
    breakdown: [{ label: 'Программы поддержки', fact: 211.3, plan: 234 }, { label: 'Административные расходы', fact: 42.8, plan: 47 }, { label: 'Развитие инфраструктуры', fact: 35.2, plan: 41 }, { label: 'Прочие расходы', fact: 23.5, plan: 28 }],
    comments: [{ id: 'c4', author: 'Тимур Аблаев', role: 'Финансовый директор', time: '06.11.2026, 18:15', text: 'Отклонение в основном связано с графиком выплат по программам поддержки. Прогноз исполнения на конец года — 96,2% утверждённого бюджета.' }],
  },
  {
    id: 'npl', title: 'NPL — неработающая задолженность', block: 'risks', category: 'Кредитный риск',
    description: 'Доля неработающей задолженности в совокупном кредитном портфеле.', businessMeaning: 'Качество кредитного портфеля и уровень принимаемого кредитного риска.',
    unit: '%', fact: 8.7, plan: 7, status: 'critical', change: 0.6, lowerIsBetter: true, owner: 'Руслан Сериков', department: 'Департамент риск-менеджмента', source: 'Риск-система', method: 'Объём задолженности с просрочкой более 90 дней ÷ совокупный портфель.', formula: 'NPL 90+ ÷ кредитный портфель × 100%', updated: '07.11.2026, 08:30', periodicity: 'Ежедневно', confidentiality: 'Конфиденциальный', region: 'Все регионы',
    history: history([6.4, 6.5, 6.6, 6.7, 6.8, 7, 7.2, 7.6, 8.1, 8.7], 7),
    breakdown: [{ label: 'Торговля', fact: 10.8, plan: 7 }, { label: 'Сельское хозяйство', fact: 9.1, plan: 7 }, { label: 'Производство', fact: 7.2, plan: 7 }, { label: 'Услуги', fact: 6.8, plan: 7 }],
    comments: [{ id: 'c5', author: 'Руслан Сериков', role: 'Директор по рискам', time: '07.11.2026, 08:55', text: 'Рост показателя концентрируется в трёх регионах и сегменте торговли. Сформирована рабочая группа, до 15 ноябре проводим сегментацию проблемного портфеля.' }],
  },
  {
    id: 'rwa', title: 'RWA — активы, взвешенные по риску', block: 'risks', category: 'Капитал и риск',
    description: 'Объём активов с учётом коэффициентов риска по категориям.', businessMeaning: 'Оценка достаточности капитала и рискованности активов.',
    unit: 'млрд ₸', fact: 284.6, plan: 295, status: 'normal', change: 2.1, lowerIsBetter: true, owner: 'Руслан Сериков', department: 'Департамент риск-менеджмента', source: 'Риск-система', method: 'Сумма активов, умноженных на коэффициент риска соответствующей категории.', formula: 'Σ (актив_i × коэффициент риска_i)', updated: '07.11.2026, 08:30', periodicity: 'Ежедневно', confidentiality: 'Конфиденциальный', region: 'Все регионы',
    history: history([212, 218, 224, 230, 238, 244, 253, 261, 278.8, 284.6], 295), breakdown: [], comments: [],
  },
  {
    id: 'provisions', title: 'Провизии', block: 'risks', category: 'Резервирование',
    description: 'Объём сформированных резервов под возможные потери.', businessMeaning: 'Покрытие ожидаемых потерь по кредитному портфелю.',
    unit: 'млрд ₸', fact: 31.4, plan: 29.8, status: 'warning', change: 8.4, lowerIsBetter: true, owner: 'Руслан Сериков', department: 'Департамент риск-менеджмента', source: 'ERP / Риск-система', method: 'Ожидаемые кредитные убытки по методике МСФО 9.', formula: 'Σ ECL по стадиям 1–3', updated: '07.11.2026, 08:30', periodicity: 'Ежедневно', confidentiality: 'Конфиденциальный', region: 'Все регионы',
    history: history([18, 18.6, 19.1, 20.2, 21.8, 23.2, 24.7, 26.3, 29, 31.4], 29.8), breakdown: [], comments: [],
  },
];

export const initialProjects: Project[] = [
  {
    id: 'digital', title: 'Цифровизация программ поддержки', description: 'Единое цифровое окно подачи и сопровождения заявок предпринимателей.', status: 'warning', stage: 'Интеграционное тестирование', progress: 72, owner: 'Марат Жолдасов', department: 'Департамент цифрового развития', program: 'Цифровой Даму', region: 'Все регионы', start: '12.01.2026', deadline: '25.12.2026', forecast: '20.01.2027', budget: 1.8, spent: 1.14, updated: '06.11.2026, 17:40', kpiId: 'review-time',
    milestones: [{ title: 'Проектирование и согласование', date: '20.03.2026', done: true }, { title: 'Разработка личного кабинета', date: '18.08.2026', done: true }, { title: 'Интеграционное тестирование', date: '10.11.2026', done: false, overdue: true }, { title: 'Пилот в трёх регионах', date: '05.12.2026', done: false }, { title: 'Промышленный запуск', date: '25.12.2026', done: false }],
    risks: [{ title: 'Задержка интеграции с банками', level: 'Высокий', mitigation: 'Выделить отдельную integration-команду и проводить ежедневные сверки.' }],
    comments: [{ id: 'pc1', author: 'Марат Жолдасов', role: 'Руководитель проекта', time: '06.11.2026, 17:40', text: 'Два банка-партнёра завершили тестирование. По остальным трём согласовали новый график подключения.' }],
  },
  {
    id: 'data', title: 'Единое хранилище данных', description: 'Создание корпоративной витрины данных для управленческой отчётности.', status: 'normal', stage: 'Наполнение витрин', progress: 84, owner: 'Ольга Ким', department: 'Департамент анализа данных', program: 'Данные и аналитика', region: 'Центральный аппарат', start: '02.02.2026', deadline: '15.12.2026', forecast: '15.12.2026', budget: 0.94, spent: 0.63, updated: '07.11.2026, 09:10', kpiId: 'budget',
    milestones: [{ title: 'Архитектура хранилища', date: '30.03.2026', done: true }, { title: 'Загрузка финансовых данных', date: '15.08.2026', done: true }, { title: 'Витрина производственных KPI', date: '15.11.2026', done: false }, { title: 'Приёмочное тестирование', date: '15.12.2026', done: false }], risks: [], comments: [],
  },
  {
    id: 'regional', title: 'Развитие региональной сети', description: 'Открытие центров обслуживания предпринимателей в регионах.', status: 'normal', stage: 'Подготовка площадок', progress: 65, owner: 'Динара Утегенова', department: 'Департамент регионального развития', program: 'Даму-Регионы', region: '5 регионов', start: '15.02.2026', deadline: '28.11.2026', forecast: '28.11.2026', budget: 0.68, spent: 0.38, updated: '05.11.2026, 14:20', kpiId: 'nonfinancial',
    milestones: [{ title: 'Выбор площадок', date: '20.05.2026', done: true }, { title: 'Ремонт и оснащение', date: '05.11.2026', done: true }, { title: 'Обучение команды', date: '18.11.2026', done: false }, { title: 'Открытие центров', date: '28.11.2026', done: false }], risks: [], comments: [],
  },
  {
    id: 'risk', title: 'Внедрение модели раннего риска', description: 'Автоматизация мониторинга ранних сигналов проблемной задолженности.', status: 'critical', stage: 'Калибровка модели', progress: 48, owner: 'Руслан Сериков', department: 'Департамент риск-менеджмента', program: 'Управление рисками', region: 'Центральный аппарат', start: '10.03.2026', deadline: '30.10.2026', forecast: '15.01.2027', budget: 0.42, spent: 0.24, updated: '07.11.2026, 08:50', kpiId: 'npl',
    milestones: [{ title: 'Формирование выборки', date: '20.05.2026', done: true }, { title: 'Разработка модели', date: '15.09.2026', done: true }, { title: 'Калибровка и валидация', date: '30.10.2026', done: false, overdue: true }, { title: 'Запуск мониторинга', date: '15.01.2027', done: false }],
    risks: [{ title: 'Просрочка планового запуска', level: 'Критический', mitigation: 'Пересмотреть график, привлечь внешнюю валидацию до 25 ноября.' }],
    comments: [{ id: 'pc2', author: 'Руслан Сериков', role: 'Руководитель проекта', time: '07.11.2026, 08:50', text: 'График смещён из-за качества исторических данных по двум сегментам. Запускаем дополнительную очистку данных.' }],
  },
  {
    id: 'brand', title: 'Обновление портала предпринимателя', description: 'Новый пользовательский опыт и адаптивная версия портала услуг.', status: 'normal', stage: 'Разработка', progress: 56, owner: 'Алия Касымова', department: 'Департамент по работе с клиентами', program: 'Цифровой Даму', region: 'Все регионы', start: '06.04.2026', deadline: '20.02.2027', forecast: '20.02.2027', budget: 0.31, spent: 0.11, updated: '04.11.2026, 15:00',
    milestones: [{ title: 'Исследование пользователей', date: '15.06.2026', done: true }, { title: 'Дизайн-концепция', date: '15.08.2026', done: true }, { title: 'Разработка', date: '15.12.2026', done: false }, { title: 'Запуск', date: '20.02.2027', done: false }], risks: [], comments: [],
  },
  {
    id: 'esg', title: 'Программа зелёного предпринимательства', description: 'Финансовая и образовательная поддержка устойчивых бизнес-проектов.', status: 'review', stage: 'Согласование пилота', progress: 28, owner: 'Ержан Сапаров', department: 'Департамент развития программ', program: 'Устойчивое развитие', region: 'Алматы и Астана', start: '01.08.2026', deadline: '01.03.2027', forecast: '01.03.2027', budget: 0.22, spent: 0.025, updated: '03.11.2026, 12:30', kpiId: 'sme',
    milestones: [{ title: 'Методология программы', date: '10.10.2026', done: true }, { title: 'Согласование пилота', date: '20.11.2026', done: false }, { title: 'Запуск приёма заявок', date: '01.03.2027', done: false }], risks: [], comments: [],
  },
];

export const initialNotices: Notice[] = [
  { id: 'n1', title: 'NPL превысил целевой уровень', text: 'Показатель вышел за установленный порог. Требуется пояснение ответственного.', time: 'Сегодня, 08:35', type: 'kpi', targetId: 'npl', priority: 'critical', read: false, category: 'Риски и KPI' },
  { id: 'n2', title: 'Отклонение по льготному кредитованию', text: 'Фактическое исполнение ниже плана. Доступен новый комментарий владельца.', time: 'Сегодня, 08:20', type: 'kpi', targetId: 'lending', priority: 'critical', read: false, category: 'Риски и KPI' },
  { id: 'n3', title: 'Просрочена контрольная точка', text: 'Проект «Цифровизация программ поддержки»: интеграционное тестирование.', time: 'Сегодня, 08:00', type: 'project', targetId: 'digital', priority: 'warning', read: false, category: 'Проекты' },
  { id: 'n4', title: 'Нет данных по охвату обучением', text: 'Источник не передал данные за сентябрь и октябрь. Дата следующей загрузки — 8 ноября.', time: 'Вчера, 18:30', type: 'kpi', targetId: 'training', priority: 'warning', read: true, category: 'Данные' },
  { id: 'n5', title: 'Управленческий отчёт готов', text: 'Отчёт за сентябрь 2026 доступен для просмотра.', time: '04.11.2026, 09:15', type: 'report', priority: 'info', read: true, category: 'Отчёты' },
  { id: 'n6', title: 'Показатели обновлены', text: 'Финансовые и производственные данные прошли автоматическую проверку.', time: '03.11.2026, 08:30', type: 'system', priority: 'info', read: true, category: 'Данные' },
];

export const initialActions: CorrectiveAction[] = [
  { id: 'a1', kpiId: 'npl', title: 'Сегментировать проблемный портфель по регионам', owner: 'Руслан Сериков', deadline: '15.11.2026', status: 'В работе' },
  { id: 'a2', kpiId: 'npl', title: 'Подготовить план работы с заёмщиками 90+', owner: 'Айдана Сейтова', deadline: '25.11.2026', status: 'В работе' },
  { id: 'a3', kpiId: 'lending', title: 'Согласовать упрощённый пакет документов с банками', owner: 'Марат Жолдасов', deadline: '12.11.2026', status: 'На проверке' },
  { id: 'a4', kpiId: 'subsidies', title: 'Провести выплаты по согласованным заявкам', owner: 'Асель Нурланова', deadline: '13.11.2026', status: 'В работе' },
];

export const initialUsers: AppUser[] = [
  { id: 1, name: 'Айгерим Сагиндикова', email: 'a.sagindikova@damu.kz', role: 'Руководитель', department: 'Правление Фонда', active: true },
  { id: 2, name: 'Асель Нурланова', email: 'a.nurlanova@damu.kz', role: 'Менеджер', department: 'Департамент субсидирования', active: true },
  { id: 3, name: 'Руслан Сериков', email: 'r.serikov@damu.kz', role: 'Менеджер', department: 'Департамент риск-менеджмента', active: true },
  { id: 4, name: 'Ольга Ким', email: 'o.kim@damu.kz', role: 'Администратор', department: 'Департамент анализа данных', active: true },
  { id: 5, name: 'Тимур Аблаев', email: 't.ablaev@damu.kz', role: 'Менеджер', department: 'Финансовый департамент', active: false },
];

export const initialAudit: AuditEvent[] = [
  { id: 'au1', action: 'Данные обновлены', detail: 'Производственная витрина: 124 записи, проверка пройдена', author: 'Система интеграции', time: '07.11.2026, 08:30' },
  { id: 'au2', action: 'Добавлен комментарий', detail: 'NPL — неработающая задолженность', author: 'Руслан Сериков', time: '07.11.2026, 08:55' },
  { id: 'au3', action: 'Изменён план', detail: 'Объём субсидирования: план на октябрь — 250 млрд ₸', author: 'Ольга Ким', time: '06.11.2026, 15:20' },
  { id: 'au4', action: 'Сформирован отчёт', detail: 'Управленческая сводка за сентябрь 2026', author: 'Айгерим Сагиндикова', time: '04.11.2026, 09:15' },
];

export const currentUser = initialUsers[0];
export const lastUpdated = '07.11.2026, 08:30';

export const productionSeries = [
  { month: 'Май', fact: 245, plan: 252 },
  { month: 'Июн', fact: 268, plan: 276 },
  { month: 'Июл', fact: 285, plan: 302 },
  { month: 'Авг', fact: 313, plan: 328 },
  { month: 'Сен', fact: 349, plan: 362 },
  { month: 'Окт', fact: 361.8, plan: 390 },
];

export function formatValue(value: number | null, unit: string, compact = false) {
  if (value === null) return 'Нет данных';
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);
  if (unit === '%') return `${formatted}%`;
  if (compact && unit === 'млрд ₸') return `${formatted} млрд`;
  return `${formatted} ${unit}`;
}

export function getKpiForPeriod(kpi: Kpi, period: Period): Kpi {
  if (period === '2026-10') return kpi;
  if (period === '2026-q3') {
    const quarter = kpi.history.slice(6, 9);
    if (quarter.some(item => item.fact === null)) return { ...kpi, fact: null, status: 'noData' };
    const values = quarter as (HistoryPoint & { fact: number })[];
    const isFlow = ['млрд ₸', 'чел.', 'компаний'].includes(kpi.unit);
    const fact = isFlow ? values[values.length - 1].fact : values.reduce((sum, item) => sum + item.fact, 0) / values.length;
    return { ...kpi, fact: +fact.toFixed(1), plan: +(kpi.plan * (isFlow ? 0.9 : 1)).toFixed(1), updated: '01.10.2026, 08:30' };
  }
  const index = period === '2026-09' ? 8 : 7;
  const point = kpi.history[index];
  return { ...kpi, fact: point.fact, plan: point.plan, status: point.fact === null ? 'noData' : kpi.status, updated: period === '2026-09' ? '02.10.2026, 08:30' : '02.09.2026, 08:30' };
}

export function completion(kpi: Kpi): number | null {
  if (kpi.fact === null || !kpi.plan) return null;
  if (kpi.lowerIsBetter) return kpi.fact === 0 ? 100 : (kpi.plan / kpi.fact) * 100;
  return (kpi.fact / kpi.plan) * 100;
}

export function isAfterDate(date: string, comparison: string): boolean {
  const parse = (value: string) => {
    const [day, month, year] = value.split('.').map(Number);
    return new Date(year, month - 1, day).getTime();
  };
  return parse(date) > parse(comparison);
}

export function deviation(kpi: Kpi): number | null {
  if (kpi.fact === null || kpi.plan === undefined) return null;
  return kpi.fact - kpi.plan;
}

export const statusMeta: Record<Status, { label: string; shortLabel: string }> = {
  normal: { label: 'В норме', shortLabel: 'В норме' },
  warning: { label: 'Требует внимания', shortLabel: 'Внимание' },
  critical: { label: 'Критично', shortLabel: 'Критично' },
  noData: { label: 'Нет данных', shortLabel: 'Нет данных' },
  stale: { label: 'Данные устарели', shortLabel: 'Устарело' },
  review: { label: 'На проверке', shortLabel: 'На проверке' },
};
