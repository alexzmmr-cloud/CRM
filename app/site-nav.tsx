"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/leads", label: "Лиды" },
  { href: "/contacts", label: "Контакты" },
  { href: "/accounts", label: "Компании" },
  { href: "/opportunities", label: "Сделки" },
  { href: "/dashboard", label: "Dashboard" },
];

const SEARCHABLE_SECTIONS = ["/leads", "/accounts", "/contacts", "/opportunities"];

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSection = SEARCHABLE_SECTIONS.find(
    (section) => pathname === section,
  );

  const urlValue = searchParams.get("q") ?? "";
  const [typedValue, setTypedValue] = useState<string | null>(null);
  const value = typedValue ?? urlValue;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setTypedValue(nextValue);

    if (!currentSection) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextValue) {
        params.set("q", nextValue);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.push(`${currentSection}${query ? `?${query}` : ""}`);
    }, 400);
  }

  return (
    <div className="site-header-inner">
      <Link href="/leads" className="site-logo">
        CRM-lite
      </Link>
      <nav>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "active" : ""}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {currentSection && (
        <input
          key={pathname}
          type="search"
          className="global-search"
          placeholder="Поиск по разделу"
          value={value}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
