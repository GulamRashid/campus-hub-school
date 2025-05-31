
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-semibold font-headline mb-3">Campus Hub School</h3>
            <p className="text-sm opacity-80">
              123 Education Lane, Knowledge City<br />
              Techville, ST 54321
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold font-headline mb-3">Quick Links</h3>
            <ul className="space-y-1">
              <li><Link href="#admission" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Admissions</Link></li>
              <li><Link href="#notices" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Notices</Link></li>
              <li><Link href="/login" className="text-sm opacity-80 hover:opacity-100 transition-opacity">ERP Login</Link></li>
              {/* Add more links like Privacy Policy, Terms of Service if needed */}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold font-headline mb-3">Connect With Us</h3>
            <p className="text-sm opacity-80">
              Follow us on social media (links would go here).
            </p>
            {/* Placeholder for social media icons */}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-xs opacity-70">
            &copy; {new Date().getFullYear()} Campus Hub School. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
