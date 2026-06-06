import { useState, useEffect } from "react";
import { loadConfig, saveConfig, type Config } from "../lib/config.js";

export const useConfig = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const c = await loadConfig();
        setConfig(c);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const updateConfig = async (updates: Partial<Config>) => {
    if (!config) return;
    const next = { ...config, ...updates };
    setConfig(next);
    await saveConfig(next);
  };

  return { config, loading, error, updateConfig };
};
