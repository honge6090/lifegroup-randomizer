import Image from "next/image";
import wordmark from "../../public/haven-wordmark.png";

/**
 * The brush-lettered HAVEN logo, cut straight from the bulletin artwork, with
 * the ": A warm home" tagline set in the bulletin's UhBee DongKyung face.
 */
export default function HavenWordmark({
  size = "lg",
  tagline = false,
}: {
  size?: "sm" | "lg";
  tagline?: boolean;
}) {
  return (
    <div className="flex flex-col items-center font-hand text-primary">
      <Image
        src={wordmark}
        alt="HAVEN"
        priority
        className={size === "lg" ? "h-auto w-56 sm:w-72" : "h-5 w-auto"}
      />
      {tagline && <p className="mt-4 text-lg sm:text-xl">: A warm home</p>}
    </div>
  );
}
