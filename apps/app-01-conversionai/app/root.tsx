import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "@shopify/polaris/build/esm/styles.css";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="application-name" content="ConversionAI by ApexMind AI Labs" />
        <meta name="author" content="ApexMind AI Labs" />
        <meta name="theme-color" content="#2563EB" />
        <meta property="og:site_name" content="ConversionAI by ApexMind" />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
