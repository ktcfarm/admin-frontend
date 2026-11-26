export const queryKeys = {
  auth: {
    all: ['auth'],
    me: () => ['auth', 'me'],
    session: () => ['auth', 'session']
  },
  hubs: {
    all: ['hubs'],
    lists: () => ['hubs', 'list'],
    list: (filters = {}) => ['hubs', 'list', filters],
    details: () => ['hubs', 'detail'],
    detail: (id) => ['hubs', 'detail', id],
    staff: (hubId) => ['hubs', 'staff', hubId],
    staffCandidates: (search = '') => ['hubs', 'staff-candidates', search]
  },
  crops: {
    all: ['crops'],
    meta: () => ['crops', 'meta'],
    categories: (filters = {}) => ['crops', 'categories', filters],
    categoryDetail: (id) => ['crops', 'category-detail', id],
    lists: () => ['crops', 'list'],
    list: (filters = {}) => ['crops', 'list', filters],
    details: () => ['crops', 'detail'],
    detail: (id) => ['crops', 'detail', id],
    varieties: (filters = {}) => ['crops', 'varieties', filters],
    varietyDetail: (id) => ['crops', 'variety-detail', id]
  },
  pricing: {
    all: ['pricing'],
    rates: (filters = {}) => ['pricing', 'rates', filters],
    detail: (id) => ['pricing', 'detail', id],
    resolve: (params = {}) => ['pricing', 'resolve', params],
    categories: () => ['pricing', 'categories'],
    crops: (categoryId = '') => ['pricing', 'crops', categoryId],
    varieties: () => ['pricing', 'varieties'],
    hubs: () => ['pricing', 'hubs'],
    mandiRates: (filters = {}) => ['pricing', 'mandi-rates', filters],
    hubRates: (hubId, filters = {}) => ['pricing', 'hub-rates', hubId, filters]
  },
  orders: {
    all: ['orders'],
    lists: () => ['orders', 'list'],
    list: (filters = {}) => ['orders', 'list', filters],
    details: () => ['orders', 'detail'],
    detail: (id) => ['orders', 'detail', id]
  },
  kyc: {
    all: ['kyc'],
    lists: () => ['kyc', 'list'],
    list: (filters = {}) => ['kyc', 'list', filters],
    details: () => ['kyc', 'detail'],
    detail: (id) => ['kyc', 'detail', id]
  },
  finance: {
    all: ['finance'],
    ledgers: (filters = {}) => ['finance', 'ledgers', filters],
    payouts: (filters = {}) => ['finance', 'payouts', filters],
    charges: (filters = {}) => ['finance', 'charges', filters]
  },
  disputes: {
    all: ['disputes'],
    lists: () => ['disputes', 'list'],
    list: (filters = {}) => ['disputes', 'list', filters],
    detail: (id) => ['disputes', 'detail', id]
  }
};

export default queryKeys;
