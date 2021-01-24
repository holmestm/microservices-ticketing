// this defines the common header shown on every  page

import Link from 'next/link';
import { User } from '../model/user';

const header = ({ currentUser } : { currentUser?: User }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((link) => link)
    .map((link) => {
      if (link) {
        const { label, href } = link;
        return (
          <li key={link.href}>
            <Link href={href}>
              <a className="nav-link">{label}</a>
            </Link>
          </li>
        );
      }
    });
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTIX</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};

export default header;
