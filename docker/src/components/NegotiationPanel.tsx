"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Negotiation {
  id: number;
  wishId: number;
  fromUserId: number;
  price: number;
  action: string;
  createdAt: string;
}

interface Wish {
  id: number;
  title: string;
  points: number;
  creatorId: number;
  fulfillerId: number;
  status: string;
}

interface NegotiationPanelProps {
  wish: Wish;
  userId: number;
  negotiations: Negotiation[];
  onAction: () => void;
}

const actionLabels: Record<string, string> = {
  offer: "出价",
  counter: "还价",
  accept: "接受",
  reject: "拒绝",
  cancel: "取消兑换",
};

function getUserLabel(fromUserId: number, creatorId: number, fulfillerId: number): string {
  if (fromUserId === creatorId) return "我";
  if (fromUserId === fulfillerId) return "Ta";
  return `用户${fromUserId}`;
}

export function NegotiationPanel({
  wish,
  userId,
  negotiations,
  onAction,
}: NegotiationPanelProps) {
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCreator = userId === wish.creatorId;
  const isFulfiller = userId === wish.fulfillerId;
  const isFrozen = wish.status === "frozen";

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmBody, setConfirmBody] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  async function doAction(action: string, actionPrice?: number) {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { action };
      if (actionPrice !== undefined) {
        body.price = actionPrice;
      }
      const res = await fetch(`/api/wishes/${wish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "操作失败");
        setSubmitting(false);
        return;
      }
      setPrice("");
      onAction();
    } catch {
      alert("操作失败");
    } finally {
      setSubmitting(false);
    }
  }

  function confirmThenDo(title: string, body: string, action: string, actionPrice?: number) {
    setConfirmTitle(title);
    setConfirmBody(body);
    setConfirmAction(() => () => doAction(action, actionPrice));
    setConfirmOpen(true);
  }

  if (!isFrozen) {
    return null;
  }

  const hasPendingOffer =
    negotiations.length > 0 &&
    negotiations[negotiations.length - 1].action === "offer";
  const hasPendingCounter =
    negotiations.length > 0 &&
    negotiations[negotiations.length - 1].action === "counter";
  const lastNegotiation = negotiations.length > 0 ? negotiations[negotiations.length - 1] : null;
  const lastPrice = lastNegotiation ? lastNegotiation.price : wish.points;

  // Can accept if the last action was by the OTHER user
  const canAccept =
    lastNegotiation &&
    lastNegotiation.fromUserId !== userId &&
    (lastNegotiation.action === "offer" || lastNegotiation.action === "counter");

  // Can reject if the last action was by the OTHER user
  const canReject =
    lastNegotiation &&
    lastNegotiation.fromUserId !== userId &&
    (lastNegotiation.action === "offer" || lastNegotiation.action === "counter");

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <h3 className="text-sm font-semibold">协商记录</h3>

      {/* Negotiation history */}
      {negotiations.length === 0 ? (
        <p className="text-xs text-muted-foreground">暂无协商记录</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {negotiations.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between text-xs rounded-lg bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {getUserLabel(n.fromUserId, wish.creatorId, wish.fulfillerId)}
                </span>
                <span className="text-muted-foreground">
                  {actionLabels[n.action] ?? n.action}
                </span>
                {n.price > 0 && (
                  <span className="font-bold text-primary">{n.price} 分</span>
                )}
              </div>
              <span className="text-muted-foreground">
                {new Date(n.createdAt).toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action area */}
      <div className="space-y-3 pt-2 border-t">
        {/* Price input */}
        <div className="space-y-1.5">
          <Label className="text-xs">积分</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={String(lastPrice)}
            min="1"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Fulfiller: propose new price (改价) */}
          {isFulfiller && (
            <Button
              size="sm"
              onClick={() =>
                confirmThenDo(
                  "确认改价",
                  `提议将积分改为 ${Number(price) || lastPrice}？`,
                  "offer",
                  Number(price) || lastPrice
                )
              }
              disabled={submitting}
            >
              改价
            </Button>
          )}

          {/* Creator: counter (还价) */}
          {isCreator && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                confirmThenDo(
                  "确认还价",
                  `还价 ${Number(price) || lastPrice} 积分？`,
                  "counter",
                  Number(price) || lastPrice
                )
              }
              disabled={submitting}
            >
              还价
            </Button>
          )}

          {/* Accept */}
          {canAccept && (
            <Button
              size="sm"
              variant="default"
              onClick={() =>
                confirmThenDo(
                  "确认接受",
                  `确定接受 ${lastPrice} 积分的新价格？`,
                  "accept",
                  lastPrice
                )
              }
              disabled={submitting}
            >
              接受
            </Button>
          )}

          {/* Reject */}
          {canReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                confirmThenDo(
                  "确认拒绝",
                  "确定拒绝当前的出价？",
                  "reject",
                  lastPrice
                )
              }
              disabled={submitting}
            >
              拒绝
            </Button>
          )}

          {/* Creator: cancel */}
          {isCreator && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                confirmThenDo(
                  "放弃兑换",
                  wish.status === "frozen"
                    ? "确定放弃兑换？冻结的积分将被退回。"
                    : "确定放弃此心愿的兑换？",
                  "cancel"
                )
              }
              disabled={submitting}
            >
              放弃兑换
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        body={confirmBody}
        onConfirm={confirmAction}
        confirmText="确认"
      />
    </div>
  );
}
