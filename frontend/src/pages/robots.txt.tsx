import type { GetServerSideProps } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://asieselfutbol.com";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`
  ].join("\n");

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.end(body);

  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
