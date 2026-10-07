import Link from "next/link";
import { InnerPage } from "@/components/sections/inner-page";

export default function NotFound() {
  return (
    <InnerPage route="404" title="Page not found" subtitle="This route doesn’t exist.">
      <Link className="outline-action" href="/">
        Return home
      </Link>
    </InnerPage>
  );
}
