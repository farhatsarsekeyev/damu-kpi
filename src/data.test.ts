import { describe, expect, it } from 'vitest';
import { completion, deviation, formatValue, getKpiForPeriod, initialKpis, isAfterDate } from './data';

const byId = (id: string) => {
  const kpi = initialKpis.find(item => item.id === id);
  if (!kpi) throw new Error(`Unknown KPI: ${id}`);
  return kpi;
};

describe('KPI calculations', () => {
  it('calculates plan completion and absolute deviation', () => {
    expect(completion(byId('budget'))).toBeCloseTo(89.371, 2);
    expect(deviation(byId('budget'))).toBeCloseTo(-37.2, 5);
  });

  it('measures target adherence inversely for lower-is-better metrics', () => {
    expect(completion(byId('npl'))).toBeCloseTo(80.459, 2);
    expect(completion(byId('turnover'))).toBeGreaterThan(100);
  });

  it('does not turn missing data into a zero value', () => {
    const kpi = byId('training');
    expect(kpi.fact).toBeNull();
    expect(formatValue(kpi.fact, kpi.unit)).toBe('Нет данных');
    expect(completion(kpi)).toBeNull();
    expect(deviation(kpi)).toBeNull();
  });

  it('formats currency and percentages with Russian locale', () => {
    expect(formatValue(312.8, 'млрд ₸')).toBe('312,8 млрд ₸');
    expect(formatValue(8.7, '%')).toBe('8,7%');
    expect(formatValue(12480, 'компаний')).toBe('12 480 компаний');
  });
});

describe('period selection', () => {
  it('uses fact and plan for September instead of reusing October', () => {
    const kpi = getKpiForPeriod(byId('subsidies'), '2026-09');
    expect(kpi.fact).toBe(198.6);
    expect(kpi.plan).not.toBe(250);
    expect(kpi.updated).toContain('02.10.2026');
  });

  it('uses fact and plan for August', () => {
    expect(getKpiForPeriod(byId('subsidies'), '2026-08').fact).toBe(178.4);
  });

  it('preserves a cumulative amount when selecting a quarter', () => {
    expect(getKpiForPeriod(byId('subsidies'), '2026-q3').fact).toBe(198.6);
  });

  it('averages ratio metrics over a quarter', () => {
    const kpi = getKpiForPeriod(byId('npl'), '2026-q3');
    expect(kpi.fact).toBe(7.6);
  });

  it('does not fill a missing quarterly metric with zero', () => {
    const kpi = getKpiForPeriod(byId('training'), '2026-q3');
    expect(kpi.fact).toBeNull();
    expect(kpi.status).toBe('noData');
  });
});

describe('project dates', () => {
  it('compares DD.MM.YYYY chronologically', () => {
    expect(isAfterDate('20.01.2027', '25.12.2026')).toBe(true);
    expect(isAfterDate('15.12.2026', '15.12.2026')).toBe(false);
    expect(isAfterDate('01.03.2027', '20.11.2026')).toBe(true);
  });
});
