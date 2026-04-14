import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCreateOrderPayload,
  buildOrderQuery,
  isValidOrderStatus,
} from "../../services/orderService.js";

test("isValidOrderStatus should validate allowed status", () => {
  assert.equal(isValidOrderStatus("pending"), true);
  assert.equal(isValidOrderStatus("invalid-status"), false);
});

test("buildOrderQuery should include provided filters", () => {
  const query = buildOrderQuery({ status: "pending", hotelId: "h1" });

  assert.deepEqual(query, {
    isDeleted: false,
    status: "pending",
    hotelId: "h1",
  });
});

test("buildCreateOrderPayload should inject metadata", () => {
  const payload = buildCreateOrderPayload({ totalPrice: 100 }, "user-1");

  assert.equal(payload.userId, "user-1");
  assert.equal((payload as any).totalPrice, 100);
  assert.match(payload.orderNumber, /^ORD\d+$/);
  assert.ok(payload.createTime instanceof Date);
  assert.ok(payload.updateTime instanceof Date);
});
