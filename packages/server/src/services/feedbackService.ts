import { HotelModel } from "../models/Hotel.js";

export async function getHotelNameById(hotelId?: string) {
  if (!hotelId) return "";

  try {
    const hotel = await HotelModel.findById(hotelId).select("name").lean();
    return hotel?.name || "";
  } catch {
    return "";
  }
}

export async function mapFeedbackListWithHotelInfo(list: any[]) {
  return Promise.all(
    list.map(async (item: any) => {
      let hotelName = "";
      let hotelNameEn = "";

      if (item.hotelId) {
        try {
          const hotel = await HotelModel.findById(item.hotelId)
            .select("name nameEn")
            .lean();

          if (hotel) {
            if (hotel.name) hotelName = hotel.name;
            if ((hotel as any).nameEn) hotelNameEn = (hotel as any).nameEn;
          }
        } catch {
          // ignore invalid ObjectId
        }
      }

      return {
        ...item,
        id: item._id ? item._id.toString() : item.id,
        hotelName,
        hotelNameEn,
      };
    }),
  );
}
