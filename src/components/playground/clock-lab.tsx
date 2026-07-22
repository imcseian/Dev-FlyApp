"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Gift, Pause, Play, RotateCcw, Timer } from "lucide-react";

/**
 * Playwright concept: `page.clock()` for time control.
 *
 * All timers here use real `setTimeout` / `setInterval` so Playwright can freeze
 * and advance them with `page.clock().install()` and `page.clock().tick(ms)`.
 *
 *   await page.clock().install();
 *   await page.goto('/');
 *   await page.getByTestId('clock-start-countdown').click();
 *   await page.clock().tick(10_000);  // advance 10 seconds
 *   await expect(page.getByTestId('clock-countdown')).toContainText('Countdown complete');
 */
export function ClockLab() {
  // Live clock — updates every second.
  const [now, setNow] = useState(() => new Date());
  const [clockRunning, setClockRunning] = useState(true);

  // Countdown — 10 seconds when started.
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(
    null
  );
  const [countdownDone, setCountdownDone] = useState(false);

  // Reward cooldown — 60 seconds after claim.
  const [rewardClaimedAt, setRewardClaimedAt] = useState<number | null>(null);
  const [rewardRemaining, setRewardRemaining] = useState(0);

  // Use refs so Playwright's clock override doesn't break our cleanup.
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rewardIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live clock
  useEffect(() => {
    if (!clockRunning) return;
    liveIntervalRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [clockRunning]);

  // Countdown
  useEffect(() => {
    if (countdownRemaining === null || countdownRemaining <= 0) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (countdownRemaining !== null && countdownRemaining <= 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCountdownDone(true);
        setCountdownRemaining(null);
      }
      return;
    }
    countdownIntervalRef.current = setInterval(() => {
      setCountdownRemaining((r) => (r === null ? null : r - 1));
    }, 1000);
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [countdownRemaining]);

  // Reward cooldown tick
  useEffect(() => {
    if (rewardClaimedAt === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRewardRemaining(0);
      return;
    }
    const tick = () => {
      const elapsed = Date.now() - rewardClaimedAt;
      const remaining = Math.max(0, 60_000 - elapsed);
      setRewardRemaining(remaining);
      if (remaining <= 0 && rewardIntervalRef.current) {
        clearInterval(rewardIntervalRef.current);
        rewardIntervalRef.current = null;
      }
    };
    tick();
    rewardIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (rewardIntervalRef.current) clearInterval(rewardIntervalRef.current);
    };
  }, [rewardClaimedAt]);

  const startCountdown = () => {
    setCountdownDone(false);
    setCountdownRemaining(10);
  };

  const resetCountdown = () => {
    setCountdownRemaining(null);
    setCountdownDone(false);
  };

  const claimReward = () => {
    setRewardClaimedAt(Date.now());
  };

  const resetReward = () => {
    setRewardClaimedAt(null);
    setRewardRemaining(0);
  };

  const rewardReady = rewardClaimedAt === null || rewardRemaining <= 0;

  return (
    <Card data-testid="clock-lab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Clock lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          All timers here use real <code className="px-1 py-0.5 bg-muted rounded">setTimeout</code>
          /<code className="px-1 py-0.5 bg-muted rounded">setInterval</code> — control
          them with <code className="px-1 py-0.5 bg-muted rounded">page.clock().install()</code> and
          advance time with <code className="px-1 py-0.5 bg-muted rounded">page.clock().tick(ms)</code>.
        </p>

        {/* Live clock */}
        <div
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="clock-live-section"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Live clock
              </p>
              <p className="text-xs text-muted-foreground">
                Updates every second.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClockRunning((r) => !r)}
              data-testid="clock-toggle-live"
            >
              {clockRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
          </div>
          <div
            className="text-3xl font-mono font-bold tabular-nums"
            data-testid="clock-display"
          >
            {now.toLocaleTimeString()}
          </div>
        </div>

        {/* Countdown */}
        <div
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="clock-countdown-section"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">10-second countdown</p>
              <p className="text-xs text-muted-foreground">
                Use <code>page.clock().tick(10_000)</code> to fast-forward.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetCountdown}
              data-testid="clock-reset-countdown"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
          <div
            className="text-3xl font-mono font-bold tabular-nums min-h-[2.5rem] flex items-center"
            data-testid="clock-countdown"
          >
            {countdownDone ? (
              <span className="text-green-600 dark:text-green-400">
                Countdown complete!
              </span>
            ) : countdownRemaining !== null ? (
              `${countdownRemaining}s`
            ) : (
              <span className="text-muted-foreground text-base font-normal">
                Not started
              </span>
            )}
          </div>
          <Button
            onClick={startCountdown}
            disabled={countdownRemaining !== null}
            data-testid="clock-start-countdown"
          >
            Start countdown
          </Button>
        </div>

        {/* Daily reward */}
        <div
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="clock-reward-section"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Daily reward
              </p>
              <p className="text-xs text-muted-foreground">
                60-second cooldown after claim.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetReward}
              data-testid="clock-reset-reward"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
          <div
            className="flex items-center gap-3 min-h-[2.5rem]"
            data-testid="clock-reward-status"
          >
            {rewardClaimedAt === null ? (
              <Badge variant="outline">Not claimed yet</Badge>
            ) : rewardReady ? (
              <Badge
                variant="default"
                className="bg-green-600"
                data-testid="clock-reward-ready"
              >
                Ready to claim again!
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                data-testid="clock-reward-cooldown"
              >
                Cooldown: {Math.ceil(rewardRemaining / 1000)}s remaining
              </Badge>
            )}
          </div>
          <Button
            onClick={claimReward}
            disabled={!rewardReady}
            data-testid="clock-claim-reward"
          >
            {rewardClaimedAt === null
              ? "Claim reward"
              : rewardReady
              ? "Claim again"
              : `Wait ${Math.ceil(rewardRemaining / 1000)}s`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
