import Link from "next/link";

export function SiteNav() {
  return (
    <nav>
      <Link href="/leads">Лиды</Link>
      <Link href="/accounts">Компании</Link>
      <Link href="/contacts">Контакты</Link>
      <Link href="/opportunities">Сделки</Link>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}
