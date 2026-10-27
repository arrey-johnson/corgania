"use client";

import {
  completeInspection,
  decideCase,
  recommendCase,
  requestMoreInfo,
  scheduleInspection,
  startCaseReview,
} from "@/app/actions/admin-verify";
import { ActionForm } from "@/components/onboarding/action-form";
import { Input, Label, Textarea } from "@/components/ui/primitives";

export function StartReviewForm({ caseId }: { caseId: string }) {
  return (
    <ActionForm action={startCaseReview} submitLabel="Start review" className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <Label htmlFor={`notes-${caseId}`}>Notes (optional)</Label>
        <Input id={`notes-${caseId}`} name="notes" />
      </div>
    </ActionForm>
  );
}

export function RequestInfoForm({ caseId }: { caseId: string }) {
  return (
    <ActionForm action={requestMoreInfo} submitLabel="Request information" className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <Label htmlFor={`info-${caseId}`}>What is needed?</Label>
        <Textarea id={`info-${caseId}`} name="notes" required />
      </div>
    </ActionForm>
  );
}

export function RecommendForm({ caseId }: { caseId: string }) {
  return (
    <ActionForm action={recommendCase} submitLabel="Recommend for approval" className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <Label htmlFor={`rec-${caseId}`}>Recommendation</Label>
        <Textarea id={`rec-${caseId}`} name="recommendation" required />
      </div>
    </ActionForm>
  );
}

export function DecideForm({ caseId }: { caseId: string }) {
  return (
    <ActionForm action={decideCase} submitLabel="Record decision" className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <Label htmlFor={`dec-${caseId}`}>Decision</Label>
        <select id={`dec-${caseId}`} name="decision" className="h-11 w-full rounded-md border border-line px-3 text-sm" required>
          <option value="approved">Approve membership</option>
          <option value="rejected">Reject</option>
        </select>
      </div>
      <div>
        <Label htmlFor={`dn-${caseId}`}>Decision notes</Label>
        <Textarea id={`dn-${caseId}`} name="decisionNotes" required />
      </div>
      <p className="text-xs text-slate-body">Approver must be a different staff user from the reviewer (enforced in app + DB).</p>
    </ActionForm>
  );
}

export function ScheduleInspectionForm({ caseId }: { caseId: string }) {
  return (
    <ActionForm action={scheduleInspection} submitLabel="Schedule inspection" className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <Label htmlFor={`sched-${caseId}`}>Scheduled at</Label>
        <Input id={`sched-${caseId}`} name="scheduledAt" type="datetime-local" required />
      </div>
      <div>
        <Label htmlFor={`loc-${caseId}`}>Location</Label>
        <Input id={`loc-${caseId}`} name="location" required />
      </div>
    </ActionForm>
  );
}

export function CompleteInspectionForm({ inspectionId }: { inspectionId: string }) {
  return (
    <ActionForm action={completeInspection} submitLabel="Complete inspection" className="space-y-3">
      <input type="hidden" name="inspectionId" value={inspectionId} />
      <div>
        <Label htmlFor={`out-${inspectionId}`}>Outcome</Label>
        <select id={`out-${inspectionId}`} name="outcome" className="h-11 w-full rounded-md border border-line px-3 text-sm" required>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="inconclusive">Inconclusive</option>
        </select>
      </div>
      <div>
        <Label htmlFor={`find-${inspectionId}`}>Findings</Label>
        <Textarea id={`find-${inspectionId}`} name="findings" required />
      </div>
    </ActionForm>
  );
}
