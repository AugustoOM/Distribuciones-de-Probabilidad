import feather from "feather-icons";

export function decorativeIconSvg(name: string, size = 18): string {
  const icon = feather.icons[name];
  if (!icon) {
    return "";
  }

  return icon.toSvg({
    "aria-hidden": "true",
    focusable: "false",
    width: size,
    height: size,
    "stroke-width": 2.25
  });
}
