
export const KIBIBYTE = 1024;
export const MEBIBYTE = KIBIBYTE*1024;
export const GIBIBYTE = MEBIBYTE*1024;
export function formatSize(bytes: number) {
  if (bytes > GIBIBYTE) return `${formatNumber(bytes / GIBIBYTE)} GiB`;
  if (bytes > MEBIBYTE) return `${formatNumber(bytes / MEBIBYTE)} MiB`;
  if (bytes > KIBIBYTE) return `${formatNumber(bytes / KIBIBYTE)} KiB`;
  return `${bytes} B`;
}
export function formatNumber(value: number, maxDecimalDigits = 1) {
  let acc = value.toFixed(maxDecimalDigits);
  if (maxDecimalDigits === 0) return acc;
  while (acc.endsWith("0")) acc = acc.slice(0, -1);
  if (acc.endsWith(".") || acc.endsWith(",")) acc = acc.slice(0, -1);
  return acc;
}
export function downloadUrl(url: string, fileName: string) {
  const element = document.createElement("a");
  element.href = url;
  element.download = fileName;
  document.body.append(element);
  element.click();
  element.remove();
}
