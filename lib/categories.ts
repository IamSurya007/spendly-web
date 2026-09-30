'use client';

import { useEffect, useMemo, useState } from 'react';
import api from './api';
import {
  CategoryKind,
  DEFAULT_CREDIT_CATEGORY_ID,
  DEFAULT_DEBIT_CATEGORY_ID,
  LEGACY_CATEGORY_MAP,
  SYSTEM_CATEGORIES,
} from './categories.generated';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
  parentId: string | null;
  isSystem: boolean;
  isHidden: boolean;
  sortOrder: number;
}

const SYSTEM: Category[] = SYSTEM_CATEGORIES.map((c) => ({ ...c, isSystem: true, isHidden: false }));

/** Effective categories for the signed-in user, cached for the session. */
let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

function fetchCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = api
      .get('/categories')
      .then((res) => {
        const list = res.data?.categories as Category[] | undefined;
        cache = Array.isArray(list) && list.length > 0 ? list : SYSTEM;
        return cache;
      })
      .catch(() => SYSTEM)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export class CategoryRegistry {
  private readonly byIdMap: Map<string, Category>;

  constructor(readonly all: Category[]) {
    this.byIdMap = new Map(all.map((c) => [c.id, c]));
  }

  byId(id: string | null | undefined): Category | undefined {
    return id ? this.byIdMap.get(id) : undefined;
  }

  parents(kind?: CategoryKind): Category[] {
    return this.all.filter((c) => !c.parentId && !c.isHidden && (!kind || c.kind === kind));
  }

  childrenOf(parentId: string): Category[] {
    return this.all.filter((c) => c.parentId === parentId && !c.isHidden);
  }

  /** Parent + sub for an expense, resolving legacy name-only rows. */
  resolve(expense: { categoryId?: string | null; subcategoryId?: string | null; category?: string; amount?: number }) {
    const isCredit = (expense.amount ?? 0) < 0;
    const ids = expense.categoryId
      ? { categoryId: expense.categoryId, subcategoryId: expense.subcategoryId ?? null }
      : resolveLegacyCategory(expense.category, isCredit);
    const parent =
      this.byId(ids.categoryId) ?? this.byId(isCredit ? DEFAULT_CREDIT_CATEGORY_ID : DEFAULT_DEBIT_CATEGORY_ID)!;
    const sub = this.byId(ids.subcategoryId);
    return { parent, sub: sub?.parentId === parent.id ? sub : undefined };
  }

  label(expense: Parameters<CategoryRegistry['resolve']>[0]): string {
    const { parent, sub } = this.resolve(expense);
    return sub ? `${parent.name} › ${sub.name}` : parent.name;
  }
}

/** Mirrors CategoryResolver.fromLegacyName in the app and the backend. */
export function resolveLegacyCategory(name: string | null | undefined, isCredit = false) {
  const key = (name ?? '').trim().toLowerCase();
  const mapped = LEGACY_CATEGORY_MAP[key];
  if (mapped) {
    const [parent, sub] = mapped;
    if (isCredit && parent === DEFAULT_DEBIT_CATEGORY_ID) {
      return { categoryId: DEFAULT_CREDIT_CATEGORY_ID, subcategoryId: null };
    }
    return { categoryId: parent, subcategoryId: sub };
  }
  const system = SYSTEM_CATEGORIES.find((c) => c.id === key || c.name.toLowerCase() === key);
  if (system) {
    return system.parentId
      ? { categoryId: system.parentId, subcategoryId: system.id }
      : { categoryId: system.id, subcategoryId: null };
  }
  return { categoryId: isCredit ? DEFAULT_CREDIT_CATEGORY_ID : DEFAULT_DEBIT_CATEGORY_ID, subcategoryId: null };
}

/** System categories immediately, replaced by the user's once loaded. */
export function useCategories(): CategoryRegistry {
  const [list, setList] = useState<Category[]>(cache ?? SYSTEM);
  useEffect(() => {
    let active = true;
    fetchCategories().then((c) => {
      if (active) setList(c);
    });
    return () => {
      active = false;
    };
  }, []);
  return useMemo(() => new CategoryRegistry(list), [list]);
}
