/// <reference types="vite/client" />

// Vite CSS URL imports
declare module "*.css?url" {
  const url: string;
  export default url;
}

// Vite asset imports
declare module "*.svg?url" {
  const url: string;
  export default url;
}

declare module "*.png?url" {
  const url: string;
  export default url;
}

declare module "*.jpg?url" {
  const url: string;
  export default url;
}
