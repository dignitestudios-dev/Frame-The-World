"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PaymentMethodPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const plan = searchParams.get("plan") ?? "monthly";
    const plan = "monthly";


  const handleSelect = (method: "google-pay" | "apple-pay") => {
    router.push(`/review-plan?plan=${plan}&method=${method}`);
  };

  const Option = ({
    label,
    imageSrc,
    onClick,
  }: {
    label: string;
    imageSrc: string;
    onClick: () => void;
  }) => (
<button
  type="button"
  onClick={onClick}
  className="flex items-center justify-center w-full gap-4 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-5 py-3 shadow-sm hover:shadow-md mb-4"
>
  <span className="flex items-center gap-3 text-sm font-medium text-gray-800">
    <Image
      src={imageSrc} // Pass your image source here
      alt={label}
      width={30}
      height={30} // Adjust size of the image as per the original icon size
      className="object-contain"
    />
    {label} {/* Pass your label here */}
  </span>
  <ChevronRight className="h-4 w-4 text-blue-500" /> {/* Right arrow icon */}
</button>


  );

  return (
    <div className="w-full max-w-[32em]">
      <div className="relative rounded-2xl h-[40em] bg-white p-[2.5em] pt-20 shadow-xl">
        {/* Back arrow */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center text-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Title */}
        <h1 className="mt-2 mb-2 text-center text-2xl font-extrabold text-gray-900">
          Select a Payment Method
        </h1>
        <p className="mb-8 text-center text-xs text-gray-500">
          Pick a secure payment option to proceed with your subscription. We
          currently support in-app purchases like Apple Pay and Google Pay.
        </p>

        <Option
          imageSrc="/images/GooglePay.png"
          label="Google pay"
          onClick={() => handleSelect("google-pay")}
        />

        <Option
          imageSrc="/images/ApplePay.png"
          label="Apple pay"
          onClick={() => handleSelect("apple-pay")}
        />
      </div>
    </div>
  );
}


