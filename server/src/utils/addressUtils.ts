// 导入行政区划数据
import provincesRaw from 'china-division/dist/provinces.json' with { type: 'json' };
import citiesRaw from 'china-division/dist/cities.json' with { type: 'json' };
import areasRaw from 'china-division/dist/areas.json' with { type: 'json' };

interface RawNode {
  code: string;
  name: string;
  provinceCode?: string;
  cityCode?: string;
}

const provinces = provincesRaw as RawNode[];
const cities = citiesRaw as RawNode[];
const areas = areasRaw as RawNode[];

/**
 * 解析地址文本，提取省市区信息并转换为编码
 * @param addressText 地址文本，如 "广州市越秀区珠光街道"
 * @returns 包含省市区编码和剩余街道信息的对象
 */
export const parseAddress = (addressText: string) => {
  // 存储匹配到的编码
  let provinceCode = '';
  let cityCode = '';
  let areaCode = '';
  
  // 存储剩余的街道信息
  let streetAddress = '';
  
  // 首先尝试直接匹配完整地址，提高匹配准确率
  const fullAddress = addressText;
  
  // 尝试匹配区（优先级最高，因为区是最具体的）
  let bestAreaMatch: string = '';
  let bestAreaCode: string = '';
  let bestMatchScore: number = 0;
  
  // 首先尝试匹配城市，为区匹配提供上下文
  let matchedCityCode: string = '';
  let matchedCityName: string = '';
  
  for (const city of cities) {
    if (fullAddress.includes(city.name)) {
      matchedCityCode = city.code;
      matchedCityName = city.name;
      break;
    } else if (city.name.includes('市') && fullAddress.includes(city.name.replace('市', ''))) {
      matchedCityCode = city.code;
      matchedCityName = city.name;
      break;
    }
  }
  
  for (const area of areas) {
    const areaName = area.name;
    const areaNameWithoutSuffix = areaName.replace('区', '');
    
    // 计算匹配分数
    let matchScore = 0;
    if (fullAddress.includes(areaName)) {
      // 完全匹配区名，分数最高
      matchScore = 100;
    } else if (areaName.includes('区') && fullAddress.includes(areaNameWithoutSuffix)) {
      // 匹配不带"区"后缀的区名，分数次之
      matchScore = 80;
    }
    
    // 如果有匹配的城市，并且区属于该城市，增加分数
    if (matchedCityCode && area.code.startsWith(matchedCityCode)) {
      matchScore += 20;
    }
    
    // 只有当分数更高时才更新最佳匹配
    if (matchScore > bestMatchScore) {
      bestMatchScore = matchScore;
      bestAreaCode = area.code;
      bestAreaMatch = areaName;
    }
  }
  
  // 如果找到最佳匹配，使用该编码
  if (bestAreaCode) {
    areaCode = bestAreaCode;
    // 尝试从区信息中获取城市和省份编码
    const city = cities.find(c => c.code === areaCode.substring(0, 4));
    if (city) {
      cityCode = city.code;
      const province = provinces.find(p => p.code === city.provinceCode);
      if (province) {
        provinceCode = province.code;
      }
    }
    
    // 直接以"区"字为分界，将"区"字之后的内容划分为 streetAddress
    const areaIndex = fullAddress.indexOf('区');
    if (areaIndex !== -1) {
      streetAddress = fullAddress.substring(areaIndex + 1).trim();
    }
  } else {
    // 如果没有匹配到区，尝试匹配城市
    for (const city of cities) {
      if (fullAddress.includes(city.name) || city.name.includes(fullAddress)) {
        cityCode = city.code;
        // 尝试从城市信息中获取省份编码
        const province = provinces.find(p => p.code === city.provinceCode);
        if (province) {
          provinceCode = province.code;
        }
        break;
      }
    }
    
    // 如果没有匹配到区，将整个地址作为街道信息
    streetAddress = fullAddress.trim();
  }
  
  // 构建编码数组 - 只返回最详细的编码
  const locationCodes: string[] = [];
  if (areaCode) {
    locationCodes.push(areaCode);
  } else if (cityCode) {
    locationCodes.push(cityCode);
  } else if (provinceCode) {
    locationCodes.push(provinceCode);
  }
  
  return {
    codes: locationCodes,
    streetAddress,
    provinceCode,
    cityCode,
    areaCode
  };
};
