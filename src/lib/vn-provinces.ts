/**
 * 34 đơn vị hành chính cấp tỉnh (Nghị quyết 202/2025/QH15).
 * Chỉ Việt Nam — dùng cho admin Contact (P1 / P3 lite).
 */
export const VN_PROVINCES = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Hồ Chí Minh",
  "Huế",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
] as const;

export type VnProvince = (typeof VN_PROVINCES)[number];

const PROVINCE_SET = new Set<string>(VN_PROVINCES);

export function isVnProvince(value: string): value is VnProvince {
  return PROVINCE_SET.has(value.trim());
}

/** Alias / tên cũ thường gặp trong địa chỉ legacy → tên tỉnh mới */
const PROVINCE_ALIASES: Record<string, VnProvince> = {
  "ha noi": "Hà Nội",
  hanoi: "Hà Nội",
  "thanh pho ho chi minh": "Hồ Chí Minh",
  "tp ho chi minh": "Hồ Chí Minh",
  "tp.hcm": "Hồ Chí Minh",
  hcm: "Hồ Chí Minh",
  saigon: "Hồ Chí Minh",
  "sai gon": "Hồ Chí Minh",
  "thua thien hue": "Huế",
  "da nang": "Đà Nẵng",
  "can tho": "Cần Thơ",
  "hai phong": "Hải Phòng",
};

function foldVn(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function inferVnProvinceFromAddress(address: string): VnProvince | null {
  const folded = foldVn(address);
  for (const [alias, province] of Object.entries(PROVINCE_ALIASES)) {
    if (folded.includes(alias)) {
      return province;
    }
  }
  for (const province of VN_PROVINCES) {
    if (folded.includes(foldVn(province))) {
      return province;
    }
  }
  return null;
}
