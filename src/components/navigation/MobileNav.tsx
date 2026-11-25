import { useState, type JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

/**
 * Menu de navigation mobile escamotable (tiroir latéral).
 */
export function MobileNav(): JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          aria-label={t('nav.openMenu')}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{t('nav.menuTitle')}</SheetTitle>
        </SheetHeader>
        <nav aria-label={t('nav.main')} className="flex flex-col gap-1 px-4">
          {NAV_ITEMS.map(({ path, labelKey, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 w-full items-center rounded-md px-3 text-sm font-medium transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'bg-muted text-foreground underline underline-offset-8'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
