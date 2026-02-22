import express from "express";
import { HotelModel } from "../models/Hotel.js";
import { NotificationModel } from "../models/Notification.js";
import { parseAddress } from "../utils/addressUtils.js";

const router = express.Router();

router.get("/hotels/pending", async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: "pending",
      isDeleted: false,
    }).sort({ createTime: -1 });

    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取待审核列表失败:", error);
    res.status(500).json({
      message: "获取待审核列表失败",
      error,
    });
  }
});

router.get("/hotels/published", async (req, res) => {
  try {
    const { location, keyword, rooms, guests, minPrice, maxPrice, stars } = req.query;

    // 构建查询条件
    const query: any = {
      status: "approved",
      isDeleted: false,
      isActive: true
    };

    // 1. 地址匹配（基于行政区划编码的优化版）
    if (location) {
      // 解析地址文本，提取省市区编码和街道信息
      const { codes, streetAddress } = parseAddress(location);
      console.log('市区编码======',codes, streetAddress);
      
      // 如果匹配到编码，使用编码匹配 location 字段
      if (codes.length > 0) {
        // 匹配包含任意一个编码的 location 数组
        query.location = { $in: codes };
      }
      
      // 如果有剩余的街道信息，匹配 address 字段
      if (streetAddress) {
        query.address = { $regex: streetAddress, $options: "i" };
      }
    }

    // 2. 酒店名和设施匹配
    if (keyword) {
      // 处理单个/多个关键词情况
      const keywords = keyword.split(/\s+/).filter(k => k.trim());
      if (keywords.length > 0) {
        const orConditions = [];
        keywords.forEach(k => {
          orConditions.push(
            { name: { $regex: k, $options: "i" } },
            { nameEn: { $regex: k, $options: "i" } },
            { amenities: { $regex: k, $options: "i" } }
          );
        });
        query.$or = orConditions;
      }
    }

    // 3. 星级匹配
    if (stars) {
      let starArray: number[] = [];
      if (Array.isArray(stars)) {
        // 处理数组形式的星级
        starArray = stars.map(s => Number(s)).filter(s => !isNaN(s));
      }
      if (starArray.length > 0) {
        query.star = { $in: starArray };
      }
    }

    // 获取酒店列表
    let hotels = await HotelModel.find(query).sort({ createTime: -1 });

    // 4. 价格范围过滤（应用层过滤，因为价格在 roomTypes 数组中）
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      
      hotels = hotels.filter(hotel => {
        return hotel.roomTypes.some(room => {
          return room.price >= min && room.price <= max;
        });
      });
    }

    // 5. 房间数和人数过滤（应用层过滤，因为这些字段在 roomTypes 数组中）
    if (rooms || guests) {
      const requiredRooms = rooms ? Number(rooms) : 1;
      const requiredGuests = guests ? Number(guests) : 1;
      
      hotels = hotels.filter(hotel => {
        // 检查是否有足够的房间库存和容量
        return hotel.roomTypes.some(room => {
          return room.stock >= requiredRooms && room.capacity >= requiredGuests;
        });
      });
    }

    // 转换 _id 为 id
    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取已发布酒店列表失败:", error);
    res.status(500).json({
      message: "获取已发布酒店列表失败",
      error,
    });
  }
});

router.get("/hotels/rejected", async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: "rejected",
      isDeleted: false,
    }).sort({ createTime: -1 });

    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取已拒绝酒店列表失败:", error);
    res.status(500).json({
      message: "获取已拒绝酒店列表失败",
      error,
    });
  }
});

router.get("/hotels/offline", async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: "approved",
      isActive: false,
      isDeleted: false,
    }).sort({ createTime: -1 });

    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取已下线酒店列表失败:", error);
    res.status(500).json({
      message: "获取已下线酒店列表失败",
      error,
    });
  }
});

router.post("/hotels/:id/audit", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "无效的审核状态，只能是 approved 或 rejected",
      });
    }

    if (status === "rejected" && !rejectReason) {
      return res.status(400).json({
        message: "拒绝审核时必须提供拒绝原因",
      });
    }

    const hotel = await HotelModel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    const snapshot = hotel.toObject();
    const snapshotWithoutId = { ...snapshot };
    delete (snapshotWithoutId as any)._id;
    delete (snapshotWithoutId as any).__v;
    delete (snapshotWithoutId as any).auditHistory;

    const updateData: any = {
      status,
      updateTime: new Date(),
      $push: {
        auditHistory: {
          action: status === "approved" ? "audit_approved" : "audit_rejected",
          status,
          rejectReason: status === "rejected" ? rejectReason : "",
          operatorRole: "admin",
          timestamp: new Date(),
          snapshot: snapshotWithoutId,
        },
      },
    };

    if (status === "rejected") {
      updateData.rejectReason = rejectReason;
    } else {
      updateData.rejectReason = undefined;
      updateData.isActive = true;
    }

    const updatedHotel = await HotelModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedHotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    try {
      if (hotel.ownerId) {
        const ownerIdStr = String(hotel.ownerId);
        const message =
          status === "approved"
            ? `您的酒店"${hotel.name}"审核已通过，现已上线`
            : `您的酒店"${hotel.name}"审核被拒绝：${rejectReason}`;

        await NotificationModel.create({
          type: "audit_result",
          hotelId: id,
          hotelName: hotel.name,
          ownerId: ownerIdStr,
          status: "unread",
          message,
        });

        console.log(`已为商户创建审核结果通知:`, {
          ownerId: ownerIdStr,
          hotelName: hotel.name,
          status,
          message,
        });
      } else {
        console.warn(`酒店没有 ownerId，无法创建通知 - hotelId: ${id}`);
      }
    } catch (notificationError: any) {
      console.error("创建审核通知失败:", {
        error: notificationError.message,
        ownerId: hotel.ownerId,
        hotelId: id,
      });
    }

    res.json({
      message:
        status === "approved" ? "审核通过成功，酒店已自动上线" : "审核拒绝成功",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("提交审核结果失败:", error);
    res.status(500).json({ message: "提交审核结果失败", error });
  }
});

router.patch("/hotels/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await HotelModel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    const newIsActive = !hotel.isActive;

    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      {
        isActive: newIsActive,
        updateTime: new Date(),
      },
      { new: true },
    );

    res.json({
      message: newIsActive ? "酒店已恢复上线" : "酒店已下线",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("切换发布状态失败:", error);
    res.status(500).json({ message: "切换发布状态失败", error });
  }
});

export default router;
