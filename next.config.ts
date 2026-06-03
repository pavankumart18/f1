import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "media.formula1.com" },
    ],
  },
  // Disable the Next 16 dev-tools overlay. Its "Segment Explorer" has a bug that
  // throws on bracketed dynamic route folders (e.g. [constructorId]) — harmless,
  // but noisy in the console. The app itself is unaffected.
  devIndicators: false,
  // Ship the local history archive with the build so /records and /analysis can
  // read it during static generation / revalidation on Vercel.
  outputFileTracingIncludes: {
    "/records": ["./data/**"],
    "/analysis": ["./data/**"],
  },
};

export default nextConfig;
