import type { ReactNode } from "react";
import Link from "next/link";
import { Link as ExternalLinkIcon, Twitter } from "lucide-react";

import { env } from "@/lib/env";

export function Header() {
  const logoUrl = env.PROJECT_LOGO_URL;

  return (
    <header className="site-header">
      <div className="site-header__content">
        <div className="site-header__identity">
          <div className="site-header__logo" aria-hidden>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- marketing asset
              <img src={logoUrl} alt="Project logo" />
            ) : (
              <div className="site-header__logo-fallback">
                {env.PROJECT_NAME.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="site-header__meta">
            <h1>{env.PROJECT_NAME}</h1>
            <p>
              <span className="label">Creator Authority</span>
              <span className="value">{env.PROJECT_CA_ADDRESS}</span>
            </p>
          </div>
        </div>

        <nav className="site-header__links" aria-label="External links">
          <IconLink href={env.PROJECT_TWITTER_URL} icon={<Twitter size={18} />}>
            Twitter
          </IconLink>
          <IconLink href={env.PROJECT_PUMPFUN_URL} icon={<ExternalLinkIcon size={18} />}>
            Pump.fun
          </IconLink>
        </nav>
      </div>
    </header>
  );
}

type IconLinkProps = {
  href: string;
  icon: ReactNode;
  children: ReactNode;
};

function IconLink({ href, icon, children }: IconLinkProps) {
  return (
    <Link className="site-header__icon-link" href={href} target="_blank" rel="noreferrer">
      {icon}
      <span>{children}</span>
    </Link>
  );
}
