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
  // 分割地址文本
  const parts = addressText.split(/[,，\s]+/).filter(part => part.trim());
  
  // 存储匹配到的编码
  let provinceCode = '';
  let cityCode = '';
  let areaCode = '';
  
  // 存储剩余的街道信息
  const remainingParts: string[] = [];
  
  // 首先尝试直接匹配完整地址，提高匹配准确率
  const fullAddress = parts.join('');
  
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
  }
  
  // 提取剩余的街道信息
  // 首先获取省市区的完整名称
  const provinceName = provinceCode ? provinces.find(p => p.code === provinceCode)?.name || '' : '';
  const cityName = cityCode ? cities.find(c => c.code === cityCode)?.name || '' : '';
  const areaName = areaCode ? areas.find(a => a.code === areaCode)?.name || '' : '';
  
  // 处理地址没有被分割的情况
  if (parts.length === 1) {
    const fullPart = parts[0];
    let streetPart = fullPart;
    
    // 尝试移除省市区名称
    if (areaName && streetPart.includes(areaName)) {
      streetPart = streetPart.replace(areaName, '').trim();
    } else if (areaName && areaName.includes('区') && streetPart.includes(areaName.replace('区', ''))) {
      streetPart = streetPart.replace(areaName.replace('区', ''), '').trim();
    }
    
    if (cityName && streetPart.includes(cityName)) {
      streetPart = streetPart.replace(cityName, '').trim();
    } else if (cityName && cityName.includes('市') && streetPart.includes(cityName.replace('市', ''))) {
      streetPart = streetPart.replace(cityName.replace('市', ''), '').trim();
    }
    
    if (provinceName && streetPart.includes(provinceName)) {
      streetPart = streetPart.replace(provinceName, '').trim();
    }
    
    // 移除可能的省市区关键词
    streetPart = streetPart.replace(/[省市县区]$/g, '').trim();
    if (streetPart) {
      remainingParts.push(streetPart);
    }
  } else {
    // 逐部分处理
    for (const part of parts) {
      // 检查该部分是否是省市区名称的一部分
      const isProvincePart = provinceName.includes(part) || part.includes(provinceName) || part.includes('省');
      const isCityPart = cityName.includes(part) || part.includes(cityName) || part.includes('市');
      const isAreaPart = areaName.includes(part) || part.includes(areaName) || part.includes('区');
      
      // 如果不是省市区的部分，添加到剩余街道信息中
      if (!isProvincePart && !isCityPart && !isAreaPart) {
        remainingParts.push(part);
      }
    }
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
  
  // 构建剩余的街道地址
  const streetAddress = remainingParts.join(' ');
  
  return {
    codes: locationCodes,
    streetAddress,
    provinceCode,
    cityCode,
    areaCode
  };
};
