import Modal from "@/components/modal";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="w-screen h-screen bg-gradient-to-r from-white via-blue-100 to-rose-200">
      <div className="flex flex-col justify-center mx-auto w-full">
        <Navbar />
        <div className="mx-auto w-full">
          <Modal />
        </div>
        <div className="absolute bottom-4 w-full text-center text-sm text-gray-500">
          Built by{" "}
          <a
            href="https://twitter.com/0xdhruva"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500"
          >
            @0xdhruva
          </a>
          <p className="text-black">
            NOTE: This is a DEMO version only, and in case of any issue DM on
            twitter
          </p>
        </div>
      </div>
    </div>
  );
}
