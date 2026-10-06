import Image from "next/image";

/** Logo thương hiệu, cắt giống như trong thiết kế. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-lg font-bold tracking-tight whitespace-nowrap">
      <span className="block h-[22px] w-[46px] flex-none overflow-hidden">
        <Image
          src="/logo-mark.png"
          alt=""
          width={51}
          height={34}
          className="-mt-[7px] -ml-[3px] block h-[34px] w-[51px] max-w-none"
        />
      </span>
      HTCode
    </span>
  );
}
