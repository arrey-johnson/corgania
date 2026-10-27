"use client";

import {
  grantPlatformRole,
  revokePlatformRole,
  setArticleStatus,
  setDisputeStatus,
  setOrganisationStatus,
  setOrderStatus,
  setProductStatus,
  setRfqStatus,
  setStorefrontPublished,
  upsertArticle,
  upsertSubscriptionPlan,
} from "@/app/actions/admin-ops";
import { ActionForm } from "@/components/onboarding/action-form";
import { Input, Label, Textarea } from "@/components/ui/primitives";

const selectClass = "h-9 rounded-md border border-line bg-white px-2 text-xs font-medium text-ink";

export function OrgStatusForm({ orgId, current }: { orgId: string; current: string }) {
  return (
    <ActionForm action={setOrganisationStatus} submitLabel="Update" compact className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="orgId" value={orgId} />
      <select name="status" className={selectClass} defaultValue={current}>
        <option value="approved">approved</option>
        <option value="suspended">suspended</option>
        <option value="rejected">rejected</option>
        <option value="expired">expired</option>
      </select>
    </ActionForm>
  );
}

export function StorefrontPublishForm({ storefrontId, isPublished }: { storefrontId: string; isPublished: boolean }) {
  return (
    <ActionForm action={setStorefrontPublished} submitLabel={isPublished ? "Unpublish" : "Publish"} compact className="inline">
      <input type="hidden" name="storefrontId" value={storefrontId} />
      <input type="hidden" name="publish" value={isPublished ? "false" : "true"} />
    </ActionForm>
  );
}

export function ProductStatusForm({ productId, current }: { productId: string; current: string }) {
  return (
    <ActionForm action={setProductStatus} submitLabel="Set" compact className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <select name="status" className={selectClass} defaultValue={current}>
        <option value="pending_review">pending review</option>
        <option value="approved">approved</option>
        <option value="rejected">rejected</option>
        <option value="archived">archived</option>
        <option value="draft">draft</option>
      </select>
    </ActionForm>
  );
}

export function RfqStatusForm({ rfqId, current }: { rfqId: string; current: string }) {
  return (
    <ActionForm action={setRfqStatus} submitLabel="Set" compact className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="rfqId" value={rfqId} />
      <select name="status" className={selectClass} defaultValue={current}>
        <option value="published">published</option>
        <option value="closed">closed</option>
        <option value="cancelled">cancelled</option>
        <option value="expired">expired</option>
      </select>
    </ActionForm>
  );
}

export function OrderStatusForm({ orderId, current }: { orderId: string; current: string }) {
  return (
    <ActionForm action={setOrderStatus} submitLabel="Update order" className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <select name="status" className={`${selectClass} w-full`} defaultValue={current}>
        {[
          "inquiry", "quotation", "negotiation", "accepted", "ordered", "documentation",
          "payment_arranged", "preparing", "inspection", "shipped", "delivered",
          "completed", "disputed", "cancelled",
        ].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
      </select>
      <Input name="note" placeholder="Milestone note (optional)" />
    </ActionForm>
  );
}

export function DisputeStatusForm({ disputeId, current }: { disputeId: string; current: string }) {
  return (
    <ActionForm action={setDisputeStatus} submitLabel="Update dispute" className="space-y-2">
      <input type="hidden" name="disputeId" value={disputeId} />
      <select name="status" className={`${selectClass} w-full`} defaultValue={current}>
        <option value="open">open</option>
        <option value="under_review">under review</option>
        <option value="resolved">resolved</option>
        <option value="escalated">escalated</option>
      </select>
      <Textarea name="resolution" placeholder="Resolution notes" className="min-h-20" />
    </ActionForm>
  );
}

export function ArticleCreateForm() {
  return (
    <ActionForm action={upsertArticle} submitLabel="Save article" className="space-y-3">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required placeholder="african-cocoa-outlook" />
      </div>
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" className="min-h-20" />
      </div>
      <div>
        <Label htmlFor="body">Body</Label>
        <Textarea id="body" name="body" className="min-h-40" />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" className="h-11 w-full rounded-md border border-line px-3 text-sm" defaultValue="draft">
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
      </div>
    </ActionForm>
  );
}

export function ArticleStatusForm({ articleId, current }: { articleId: string; current: string }) {
  return (
    <ActionForm action={setArticleStatus} submitLabel="Set" compact className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="articleId" value={articleId} />
      <select name="status" className={selectClass} defaultValue={current}>
        <option value="draft">draft</option>
        <option value="published">published</option>
        <option value="archived">archived</option>
      </select>
    </ActionForm>
  );
}

export function PlanForm() {
  return (
    <ActionForm action={upsertSubscriptionPlan} submitLabel="Save plan" className="space-y-3">
      <div>
        <Label htmlFor="name">Plan name</Label>
        <Input id="name" name="name" required placeholder="Trade Pro" />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required placeholder="trade-pro" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" name="price" type="number" min="0" step="0.01" required defaultValue="99" />
        </div>
        <div>
          <Label htmlFor="billingPeriod">Billing</Label>
          <select id="billingPeriod" name="billingPeriod" className="h-11 w-full rounded-md border border-line px-3 text-sm" defaultValue="monthly">
            <option value="monthly">monthly</option>
            <option value="annual">annual</option>
          </select>
        </div>
      </div>
    </ActionForm>
  );
}

export function GrantRoleForm() {
  return (
    <ActionForm action={grantPlatformRole} submitLabel="Grant role" className="space-y-3">
      <div>
        <Label htmlFor="email">Staff email</Label>
        <Input id="email" name="email" type="email" required placeholder="name@corgania.com" />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <select id="role" name="role" className="h-11 w-full rounded-md border border-line px-3 text-sm" required>
          <option value="operations">operations</option>
          <option value="verification_reviewer">verification_reviewer</option>
          <option value="verification_approver">verification_approver</option>
          <option value="finance">finance</option>
          <option value="content_editor">content_editor</option>
          <option value="support">support</option>
          <option value="super_admin">super_admin</option>
        </select>
      </div>
    </ActionForm>
  );
}

export function RevokeRoleForm({ userId, role }: { userId: string; role: string }) {
  return (
    <ActionForm action={revokePlatformRole} submitLabel="Revoke" compact className="inline">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
    </ActionForm>
  );
}
