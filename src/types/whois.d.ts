declare module 'whois' {
  function lookup(domain: string, options?: { timeout?: number, follow?: number }, callback?: (err: Error | null, data: string) => void): void;
  
  const whoisModule = { lookup };
  
  export { lookup };
  export default whoisModule;
}
