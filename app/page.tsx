import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">
      <h1>CRM-lite для агентства выставочных стендов</h1>
      <nav>
        <Link href="/leads">Лиды</Link>
        <Link href="/accounts">Компании</Link>
        <Link href="/contacts">Контакты</Link>
        <Link href="/opportunities">Сделки</Link>
      </nav>
    </main>
  );
}
