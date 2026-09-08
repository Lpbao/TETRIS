import {
  inferVnProvinceFromAddress,
  isVnProvince,
  type VnProvince,
} from "@/lib/vn-provinces";

/** Ghép địa chỉ chi tiết + tỉnh → chuỗi public / map (chỉ VN). */
export function composeContactAddress(
  addressLine: string,
  province: string,
): string {
  const line = addressLine.trim().replace(/,+\s*$/, "");
  const prov = province.trim();
  if (!line) {
    return prov ? `${prov}, Việt Nam` : "";
  }

  const foldedLine = line.toLowerCase();
  let base = line;
  if (prov && !foldedLine.includes(prov.toLowerCase())) {
    base = `${base}, ${prov}`;
  }
  if (!/việt\s*nam|vietnam/i.test(base)) {
    base = `${base}, Việt Nam`;
  }
  return base;
}

/** Bỏ hậu tố tỉnh / Việt Nam khỏi chuỗi legacy để làm addressLine. */
export function stripProvinceAndCountry(
  address: string,
  province: string,
): string {
  let line = address.trim();
  line = line.replace(/,?\s*(việt\s*nam|vietnam)\s*$/i, "");
  if (province) {
    const escaped = province.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    line = line.replace(new RegExp(`,?\\s*${escaped}\\s*$`, "i"), "");
  }
  // Legacy hay ghi "Hanoi"
  line = line.replace(/,?\s*hanoi\s*$/i, "");
  return line.replace(/,+\s*$/, "").trim();
}

export function resolveContactAddressParts(input: {
  address?: string;
  addressLine?: string;
  province?: string;
}): { addressLine: string; province: VnProvince; address: string } {
  const province: VnProvince =
    (input.province && isVnProvince(input.province)
      ? input.province
      : null) ??
    (input.address ? inferVnProvinceFromAddress(input.address) : null) ??
    "Hà Nội";

  const addressLine =
    input.addressLine?.trim() ||
    (input.address
      ? stripProvinceAndCountry(input.address, province)
      : "") ||
    input.address?.trim() ||
    "";

  return {
    addressLine,
    province,
    address: composeContactAddress(addressLine, province),
  };
}
