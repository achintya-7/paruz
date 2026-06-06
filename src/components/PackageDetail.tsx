import { useEffect, useRef, useState } from "react";
import { getPackageInfo, type PackageInfo } from "../lib/info.js";
import type { Package } from "../lib/search.js";
import { useTheme } from "../themes/ThemeContext.js";

interface PackageDetailProps {
  pkg: Package | null;
  aurHelper: "paru" | "yay";
}

const infoCache = new Map<string, Partial<PackageInfo>>();

const Row = ({ label, value }: { label: string; value: string }) => {
  const theme = useTheme();
  return (
    <box width="100%" height={1} flexDirection="row" paddingX={1}>
      <text fg={theme.accent}>{label}: </text>
      <text fg={theme.text}>{value}</text>
    </box>
  );
};

export const PackageDetail = ({ pkg, aurHelper }: PackageDetailProps) => {
  const theme = useTheme();
  const [info, setInfo] = useState<Partial<PackageInfo> | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<Timer | null>(null);

  useEffect(() => {
    if (!pkg) {
      setInfo(null);
      return;
    }

    // Serve from cache immediately if available
    if (infoCache.has(pkg.name)) {
      setInfo(infoCache.get(pkg.name) ?? null);
      setLoading(false);
      return;
    }

    // Debounce the fetch — only fires if selection stays for 400ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await getPackageInfo(pkg.name, aurHelper);
        infoCache.set(pkg.name, result);
        setInfo(result);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pkg?.name, aurHelper]);

  return (
    <scrollbox flexGrow={1} width="100%" height="100%">
      <box width="100%" height="100%" flexDirection="column" paddingY={1}>
        {!pkg && (
          <box width="100%" paddingX={1}>
            <text fg={theme.textDim}>Select a package to see details</text>
          </box>
        )}

        {pkg && loading && (
          <box width="100%" paddingX={1}>
            <text fg={theme.textDim}>Loading {pkg.name}...</text>
          </box>
        )}

        {pkg && !loading && (
          <>
            <Row label="Name" value={info?.name ?? pkg.name} />
            {info?.version && <Row label="Version" value={info.version} />}
            {info?.repo && <Row label="Repo" value={info.repo} />}
            <Row label="Status" value={pkg.installed ? "Installed" : "Not installed"} />
            {info?.url && <Row label="URL" value={info.url} />}
            {info?.licenses && <Row label="License" value={info.licenses} />}
            {info?.installedSize && <Row label="Size" value={info.installedSize} />}
            {info?.depends && <Row label="Depends" value={info.depends} />}
            <box width="100%" height={1} />
            <box width="100%" paddingX={1}>
              <text fg={info?.description ? theme.text : theme.textDim} wrapMode="word">
                {info?.description ?? "No description available"}
              </text>
            </box>
          </>
        )}
      </box>
    </scrollbox>
  );
};
