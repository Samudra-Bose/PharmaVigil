import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
          Record or Page Not Found (404)
        </h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          The requested clinical record or page could not be located in this
          workspace. This system enforces hospital tenancy and does not disclose
          foreign tenant existence.
        </p>
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
          <Button asChild size="sm" variant="primary" className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" /> Return to Safe Portal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
