import Link from 'next/link';
import { Code } from 'lucide-react';
import { MainNav } from '@/components/layout/main-nav';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6" />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold inline-block">UI Test Generator</span>
          </Link>
        </div>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/projects">Projects</Link>
            </Button>
            <Button asChild>
              <Link href="/">New Project</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}