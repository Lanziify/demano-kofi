// Entry point for the standalone worker process. It runs outside Next.js, so it must not
// import anything that pulls in 'server-only'.
export { processProductImageEvent } from './jobs/product-image.processor';
