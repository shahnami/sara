// Captures 0x + 4 characters, then the last 4 characters.
const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */
export const truncateEthAddress = (address: string) => {
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const downloadCSV = (chainId: number, data: string[][]) => {
  let csvContent =
    "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${chainId}_stealth_addresses.csv`);
  document.body.appendChild(link); // Required for FF

  link.click();
};

export const normalizeForRange = (
  x: number,
  rmin: number,
  rmax: number,
  tmin: number,
  tmax: number
) => {
  /**
   * 𝑟min denote the minimum of the range of your measurement
   * 𝑟max denote the maximum of the range of your measurement
   * 𝑡min denote the minimum of the range of your desired target scaling
   * 𝑡max denote the maximum of the range of your desired target scaling
   * x∈[𝑟min,𝑟max] denote your measurement to be scaled
   * x ↦ x − 𝑟min / 𝑟max−𝑟min × (𝑡max−𝑡min) + 𝑡min
   */

  return (tmax - tmin) * ((x - rmin) / (rmax - rmin)) + tmin;
};
