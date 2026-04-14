import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAdminAuditUpdateData,
  buildPublishedHotelQuery,
  parsePaginationParams,
} from "../../services/auditService.js";

test("buildPublishedHotelQuery should include default constraints", () => {
  const query = buildPublishedHotelQuery({});

  assert.equal(query.status, "approved");
  assert.equal(query.isDeleted, false);
  assert.equal(query.isActive, true);
});

test("parsePaginationParams should parse page and limit", () => {
  const parsed = parsePaginationParams({ page: "2", limit: "10" });

  assert.equal(parsed.isPaginationRequest, true);
  assert.equal(parsed.pageNum, 2);
  assert.equal(parsed.limitNum, 10);
  assert.equal(parsed.skip, 10);
});

test("buildAdminAuditUpdateData should set rejected fields", () => {
  const updateData = buildAdminAuditUpdateData({
    status: "rejected",
    rejectReason: "信息不完整",
    snapshot: { _id: "abc", name: "Demo Hotel" },
  });

  assert.equal(updateData.status, "rejected");
  assert.equal(updateData.rejectReason, "信息不完整");
  assert.equal(updateData.isActive, false);
  assert.equal(updateData.isIncomplete, true);
  assert.ok(updateData.$push?.auditHistory);
});
