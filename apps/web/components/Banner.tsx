import Image from 'next/image';

export function Banner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f6efe8]">
      <div className="relative w-full h-[220px] sm:h-[260px] md:h-[320px] lg:h-[380px]">
        <Image src="/banner.jpg" alt="A2 Imitation banner" fill className="object-cover" priority />
      </div>
    </section>
  );
}
