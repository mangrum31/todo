'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { AddTask } from './add-task';
import { getCategories } from '@/lib/data';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';

const pathToTitle: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/reports': 'Reports',
};

export function PageHeader() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const title = pathToTitle[pathname] || 'TaskMaster';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        {pathname === '/dashboard' && <AddTask categories={categories} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
