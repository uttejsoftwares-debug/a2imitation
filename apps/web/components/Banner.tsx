import Image from 'next/image';

export function Banner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f6efe8]">
      <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px] xl:h-[600px]">
        <Image src="/banner.jpg" alt="A2 Imitation banner" fill className="object-cover" priority />
      </div>
    </section>
  );
}
