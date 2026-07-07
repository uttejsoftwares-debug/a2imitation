import Image from 'next/image';

export function Banner() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[28rem] sm:h-[32rem] lg:h-[36rem]">
        <Image src="/banner.jpg" alt="A2 Imitation Jewellery banner" fill className="object-cover" priority />
      </div>
    </section>
  );
}
