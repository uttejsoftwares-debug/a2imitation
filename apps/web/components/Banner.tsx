import Image from 'next/image';

export function Banner() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full aspect-[3/1] sm:aspect-[4/1] lg:aspect-[5/1] max-h-[36rem]">
        <Image src="/banner.jpg" alt="A2 Imitation banner" fill className="object-cover" priority />
      </div>
    </section>
  );
}
