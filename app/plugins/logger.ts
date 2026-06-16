export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const level = config.public.logLevel as any;
  console.warn("Logger level set to:", level);

  if (level === "disable") {
    Logger.overrideLogger(false);
  }
  else {
    Logger.setLogLevel(level);
  }
});
