import { AppState } from '../types';
import { TODAY } from '../data/constants';
import { mon } from '../utils/formatters';

export function loadInitialState(): AppState {
  const currentMonth = mon(TODAY);
  return {
    contracts: [],
    tx: [],
    staff: [],
    accounts: [],
    attMonth: currentMonth,
    holidays: [],
    att: {},
    budget: {},
    costCategories: {},
    disabledCostCategories: {},
    costAdjustments: [],
    webhooks: [],
    proposals: [],
    locks: {},
    close: {},
    log: [],
    gifts: { items: [], mv: [] }
  };
}
