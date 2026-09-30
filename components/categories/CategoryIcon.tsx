'use client';

import { Tag } from '@phosphor-icons/react';
import { CATEGORY_ICONS } from './categoryIcons.generated';
import type { Category } from '@/lib/categories';

/** Fold-style tile: the category colour at low opacity, icon in full colour. */
export default function CategoryIcon({
  category,
  size = 32,
  className = '',
}: {
  category: Pick<Category, 'icon' | 'color' | 'name'>;
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category.icon] ?? Tag;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: `${category.color}24`,
        color: category.color,
      }}
      title={category.name}
    >
      <Icon size={size * 0.52} weight="fill" />
    </span>
  );
}
