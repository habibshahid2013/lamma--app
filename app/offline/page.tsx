import { PalmIcon } from "@/components/LammaLogo";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <PalmIcon variant="teal" size={40} />
      </div>
      <h1 className="mb-2 text-2xl font-bold">You&apos;re Offline</h1>
      <p className="mb-8 max-w-sm text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Please check
        your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  );
}
