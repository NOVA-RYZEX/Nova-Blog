import { siteConfig } from "~/app.meta";

import type { Link } from "~/types";

export const navLinks: Link[] = [
  {
    label: "Home",
    to: "/",
    icon: "i-line-md-home",
  },
];

export const footerLinks: Link[] = [];

export const socialLinks: Link[] = [
  {
    label: "GitHub",
    to: siteConfig.social.github,
    icon: "i-line-md-github-loop",
  },
];
