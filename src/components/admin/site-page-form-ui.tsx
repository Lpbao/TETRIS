import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function SitePageFormFooter({
  isSubmitting,
  error,
  success,
}: {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}) {
  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-100 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Lưu thay đổi
      </Button>
    </div>
  );
}
