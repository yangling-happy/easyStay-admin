import test from "node:test";
import assert from "node:assert/strict";

import {
  buildNotificationQuery,
  getPagination,
} from "../../services/notificationQueryService.js";

test("buildNotificationQuery should include ownerId and optional filters", () => {
  const query = buildNotificationQuery({
    ownerId: "owner-1",
    type: "audit_result",
    status: "unread",
  });

  assert.deepEqual(query, {
    ownerId: "owner-1",
    type: "audit_result",
    status: "unread",
  });
});

test("getPagination should parse numeric params", () => {
  const pagination = getPagination({ page: "3", pageSize: "5" });

  assert.equal(pagination.page, 3);
  assert.equal(pagination.pageSize, 5);
  assert.equal(pagination.skip, 10);
});
