import provincesRaw from "china-division/dist/provinces.json";
import citiesRaw from "china-division/dist/cities.json";
import areasRaw from "china-division/dist/areas.json";

interface RawNode {
  code: string;
  name: string;
  provinceCode?: string;
  cityCode?: string;
}

export interface CascaderOption {
  label: string;
  value: string;
  children?: CascaderOption[];
}
const provinces = provincesRaw as RawNode[];
const cities = citiesRaw as RawNode[];
const areas = areasRaw as RawNode[];
const cityMap: Record<string, RawNode[]> = {};
const areaMap: Record<string, RawNode[]> = {};

cities.forEach((city) => {
  const pCode = city.provinceCode!;
  if (!cityMap[pCode]) cityMap[pCode] = [];
  cityMap[pCode].push(city);
});

areas.forEach((area) => {
  const cCode = area.cityCode!;
  if (!areaMap[cCode]) areaMap[cCode] = [];
  areaMap[cCode].push(area);
});
export const cityOptions: CascaderOption[] = provinces.map((province) => ({
  label: province.name,
  value: province.code,
  children: (cityMap[province.code] || []).map((city) => ({
    label: city.name,
    value: city.code,
    children: (areaMap[city.code] || []).map((area) => ({
      label: area.name,
      value: area.code,
    })),
  })),
}));

/**
 * 将省、市、区名称转换为编码数组
 * @param provinceName 省名称，如 "北京市"
 * @param cityName 市名称，如 "北京市"
 * @param areaName 区名称，如 "朝阳区"
 * @returns 编码数组，如 ['11', '1101', '110101']
 */
export const getCodesFromNames = (
  provinceName: string,
  cityName: string,
  areaName: string,
): string[] => {
  // 查找省编码
  const province = provinces.find((p) => p.name === provinceName);
  if (!province) {
    console.warn(`未找到省: ${provinceName}`);
    return [];
  }

  // 直辖市特殊处理：北京市、天津市、上海市、重庆市
  // 这些直辖市的市名称在china-division中是"市辖区"，但用户可能填写"北京市"等
  const directCities = ["北京市", "天津市", "上海市", "重庆市"];
  let actualCityName = cityName;
  if (directCities.includes(provinceName) && cityName === provinceName) {
    actualCityName = "市辖区";
  }

  // 查找市编码
  const citiesInProvince = cityMap[province.code] || [];
  const city = citiesInProvince.find((c) => c.name === actualCityName);
  if (!city) {
    console.warn(`未找到市: ${cityName} (省: ${provinceName})`);
    return [province.code];
  }

  // 查找区编码
  const areasInCity = areaMap[city.code] || [];
  const area = areasInCity.find((a) => a.name === areaName);
  if (!area) {
    console.warn(`未找到区: ${areaName} (市: ${cityName})`);
    return [province.code, city.code];
  }

  return [province.code, city.code, area.code];
};
/**
 * 将编码数组转换为详细的中文地址
 * @param codes 编码数组，如 ['31', '3101', '310101']
 * @param detail 详细街道地址，如 '人民大道200号'
 */
export const getFullAddress = (
  codes: any[] | undefined,
  detail: string = "",
) => {
  // 1. 安全检查
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return detail || "暂无详细地址";
  }

  // 2. 解构并强制转为字符串，防止匹配失败
  const pCode = String(codes[0] || "");
  const cCode = String(codes[1] || "");
  const aCode = String(codes[2] || "");

  // 3. 查找名称
  const pName = provinces.find((p) => String(p.code) === pCode)?.name || "";
  const cName = cities.find((c) => String(c.code) === cCode)?.name || "";
  const aName = areas.find((a) => String(a.code) === aCode)?.name || "";

  // 4. 组装结果
  const full = `${pName}${cName}${aName} ${detail}`.trim();

  // 如果拼出来还是空的（说明 codes 里的值在 JSON 里找不到），就只返回 detail
  return full || detail;
};
