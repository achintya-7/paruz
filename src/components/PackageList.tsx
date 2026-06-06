import { useTheme } from "../themes/ThemeContext.js";
import type { Package } from "../lib/search.js";

interface PackageListProps {
  packages: Package[];
  selectedIndex: number;
  query: string;
}

export const PackageList = ({ packages, selectedIndex, query }: PackageListProps) => {
  const theme = useTheme();

  return (
    <scrollbox flexGrow={1} width="100%" height="100%" scrollY={true}>
      <box width="100%" height="100%" flexDirection="column">
        {!query && (
          <box width="100%" paddingX={2} paddingY={1}>
            <text fg={theme.textDim}>Start typing to search packages</text>
          </box>
        )}

        {query && packages.length === 0 && (
          <box width="100%" flexDirection="column" paddingX={2} paddingY={1}>
            <text fg={theme.textDim}>No results for "{query}".</text>
            <box width="100%" height={1} />
            <text fg={theme.textDim}>Cache may be outdated — press <b>Ctrl+R</b> to refresh and try again.</text>
          </box>
        )}

        {query && packages.length > 0 &&
          packages.map((pkg, i) => (
            <box
              key={pkg.name}
              width="100%"
              height={1}
              backgroundColor={i === selectedIndex ? theme.accent : theme.titleBg}
              flexDirection="row"
              paddingX={1}
            >
              <text fg={i === selectedIndex ? theme.titleBg : theme.text}>{pkg.name}</text>
              {pkg.version && (
                <text fg={i === selectedIndex ? theme.titleBg : theme.textDim}>
                  {" "}@{pkg.version}
                </text>
              )}
              {pkg.installed && (
                <text fg={i === selectedIndex ? theme.titleBg : theme.accent}> [i]</text>
              )}
            </box>
          ))
        }
      </box>
    </scrollbox>
  );
};
