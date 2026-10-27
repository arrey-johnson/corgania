import { locales, type AppLocale } from "./routing";

/** Strip `/en`, `/fr`, … prefix so auth matchers and home paths stay locale-agnostic. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  const maybe = segments[1];
  if (maybe && (locales as readonly string[]).includes(maybe)) {
    const rest = segments.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

export function withLocale(pathname: string, locale: AppLocale): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}
