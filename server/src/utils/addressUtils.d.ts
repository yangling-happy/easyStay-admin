/**
 * 解析地址文本，提取省市区信息并转换为编码
 * @param addressText 地址文本，如 "广州市越秀区珠光街道"
 * @returns 包含省市区编码和剩余街道信息的对象
 */
export declare const parseAddress: (addressText: string) => {
    codes: string[];
    streetAddress: string;
    provinceCode: string;
    cityCode: string;
    areaCode: string;
};
//# sourceMappingURL=addressUtils.d.ts.map