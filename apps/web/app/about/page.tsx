export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <h1 className="font-display text-4xl font-semibold text-stone-900">Handmade Jewellery with Heart</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
          Discover the allure of our Handmade Collection, where each piece is a unique work of art crafted with passion and precision. Our artisans meticulously create every design to ensure timeless beauty and individual charm.
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm">
            <h2 className="font-display text-2xl text-stone-900">Who we are</h2>
            <p className="mt-4 text-stone-600">
              We are A2 Imitation, inspired by celebration and crafted to make every moment feel special. Our collections blend traditional techniques with contemporary style.
            </p>
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm">
            <h2 className="font-display text-2xl text-stone-900">What we make</h2>
            <p className="mt-4 text-stone-600">
              From delicate earrings to bridal sets, our jewellery is curated for everyday glamour and festive elegance. Each piece is designed to shine with quality and style.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
