import { Hero } from "@/components/hero/Hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <div style={{ height: "200vh" }} aria-hidden="true" />
    </main>
  );
}
