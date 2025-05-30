import { Metadata } from "next";
import Image from "next/image";
import { TriviaApp } from "./components/trivia/trivia-app";

export const metadata: Metadata = {
  title: "Crypto Trivia | Farcaster Mini App",
  description:
    "Test your crypto knowledge and discover when you should have entered the space!",
};

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <header className="w-full max-w-md mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="Crypto Trivia"
            width={32}
            height={32}
            className="rounded-full"
          />
          <h1 className="text-xl font-bold">Crypto Trivia</h1>
        </div>
        <div className="text-sm text-muted-foreground">Farcaster Mini App</div>
      </header>

      <main className="w-full">
        <TriviaApp />
      </main>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Created with ❤️ by @ayushgupta0610</p>
      </footer>
    </div>
  );
}
