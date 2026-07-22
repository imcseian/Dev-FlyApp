"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Loader2, Network, Play } from "lucide-react";

interface UsersResponse {
  data: { id: string; name: string; email: string; role: string }[];
  meta: { count: number; total: number };
}

interface PostsResponse {
  data: { id: string; title: string; body: string; authorId: string }[];
  meta: { count: number };
}

interface StatsResponse {
  data: {
    users: number;
    posts: number;
    views: number;
    conversion: number;
    updatedAt: number;
  };
}

type ResponseKind = "users" | "posts" | "stats" | "error" | null;

/**
 * Playwright concept: `page.route()` + `page.waitForResponse()`.
 *
 * Three buttons fire predictable network requests with stable response shapes.
 * Playwright can stub or wait for them:
 *
 *   await page.route('/api/pw/users', route => route.fulfill({ path: 'fixtures/users.json' }))
 *   const [res] = await Promise.all([
 *     page.waitForResponse(resp => resp.url().includes('/api/pw/users')),
 *     page.getByTestId('intercept-fetch-users').click(),
 *   ])
 *   expect(res.status()).toBe(200)
 *   await expect(page.getByTestId('intercept-user-row')).toHaveCount(3)
 */
export function InterceptLab() {
  const [loading, setLoading] = useState<ResponseKind>(null);
  const [users, setUsers] = useState<UsersResponse["data"]>([]);
  const [posts, setPosts] = useState<PostsResponse["data"]>([]);
  const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCall, setLastCall] = useState<ResponseKind>(null);

  const callUsers = async (fail = false) => {
    setLoading("users");
    setLastCall("users");
    setError(null);
    setUsers([]);
    try {
      const url = `/api/pw/users?delay=400${fail ? "&fail=true" : ""}`;
      const res = await fetch(url);
      const data: UsersResponse | { error: string } = await res.json();
      if (!res.ok) {
        setError((data as { error: string }).error);
        setLastCall("error");
      } else {
        setUsers((data as UsersResponse).data);
      }
    } finally {
      setLoading(null);
    }
  };

  const callPosts = async (fail = false) => {
    setLoading("posts");
    setLastCall("posts");
    setError(null);
    setPosts([]);
    try {
      const url = `/api/pw/posts?delay=400${fail ? "&fail=true" : ""}`;
      const res = await fetch(url);
      const data: PostsResponse | { error: string } = await res.json();
      if (!res.ok) {
        setError((data as { error: string }).error);
        setLastCall("error");
      } else {
        setPosts((data as PostsResponse).data);
      }
    } finally {
      setLoading(null);
    }
  };

  const callStats = async (fail = false) => {
    setLoading("stats");
    setLastCall("stats");
    setError(null);
    setStats(null);
    try {
      const url = `/api/pw/stats?delay=400${fail ? "&fail=true" : ""}`;
      const res = await fetch(url);
      const data: StatsResponse | { error: string } = await res.json();
      if (!res.ok) {
        setError((data as { error: string }).error);
        setLastCall("error");
      } else {
        setStats((data as StatsResponse).data);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card data-testid="intercept-lab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Intercept lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Each button fires a network request with a predictable response shape.
          Use <code className="px-1 py-0.5 bg-muted rounded">page.route()</code>{" "}
          to stub these and <code className="px-1 py-0.5 bg-muted rounded">page.waitForResponse()</code>{" "}
          to assert on them.
        </p>

        {/* Code snippet for copy-paste into Playwright test */}
        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="intercept-snippet"
        >
{`// Stub the response with a fixture
await page.route('**/api/pw/users**', async route => {
  await route.fulfill({ path: 'fixtures/users.json' });
});

// Or wait for the real response
const [response] = await Promise.all([
  page.waitForResponse('**/api/pw/users**'),
  page.getByTestId('intercept-fetch-users').click(),
]);
expect(response.status()).toBe(200);
await expect(page.getByTestId('intercept-user-row')).toHaveCount(3);`}
        </pre>

        {/* Action buttons */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          data-testid="intercept-actions"
        >
          <Button
            onClick={() => callUsers(false)}
            disabled={loading !== null}
            data-testid="intercept-fetch-users"
          >
            {loading === "users" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Fetch users
              </>
            )}
          </Button>
          <Button
            onClick={() => callPosts(false)}
            disabled={loading !== null}
            data-testid="intercept-fetch-posts"
          >
            {loading === "posts" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Fetch posts
              </>
            )}
          </Button>
          <Button
            onClick={() => callStats(false)}
            disabled={loading !== null}
            data-testid="intercept-fetch-stats"
          >
            {loading === "stats" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Fetch stats
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => callUsers(true)}
            disabled={loading !== null}
            data-testid="intercept-fail-users"
          >
            Force user fetch error
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => callPosts(true)}
            disabled={loading !== null}
            data-testid="intercept-fail-posts"
          >
            Force post fetch error
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Last call:</span>
          <Badge variant="outline" data-testid="intercept-last-call">
            {lastCall ?? "none"}
          </Badge>
        </div>

        {/* Error display */}
        {error && (
          <div
            className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
            data-testid="intercept-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Users result */}
        {users.length > 0 && (
          <div
            className="space-y-1"
            data-testid="intercept-users-result"
          >
            <div className="text-xs font-medium text-muted-foreground">
              Users response ({users.length}):
            </div>
            <ul className="space-y-1">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between text-sm border border-border rounded px-2 py-1"
                  data-testid="intercept-user-row"
                >
                  <span>{u.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {u.role}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Posts result */}
        {posts.length > 0 && (
          <div
            className="space-y-1"
            data-testid="intercept-posts-result"
          >
            <div className="text-xs font-medium text-muted-foreground">
              Posts response ({posts.length}):
            </div>
            <ul className="space-y-1">
              {posts.map((p) => (
                <li
                  key={p.id}
                  className="text-sm border border-border rounded px-2 py-1"
                  data-testid="intercept-post-row"
                >
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.body}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats result */}
        {stats && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            data-testid="intercept-stats-result"
          >
            <div className="border border-border rounded p-2">
              <div className="text-xs text-muted-foreground">Users</div>
              <div className="text-lg font-bold" data-testid="intercept-stat-users">
                {stats.users.toLocaleString()}
              </div>
            </div>
            <div className="border border-border rounded p-2">
              <div className="text-xs text-muted-foreground">Posts</div>
              <div className="text-lg font-bold" data-testid="intercept-stat-posts">
                {stats.posts.toLocaleString()}
              </div>
            </div>
            <div className="border border-border rounded p-2">
              <div className="text-xs text-muted-foreground">Views</div>
              <div className="text-lg font-bold" data-testid="intercept-stat-views">
                {stats.views.toLocaleString()}
              </div>
            </div>
            <div className="border border-border rounded p-2">
              <div className="text-xs text-muted-foreground">Conv.</div>
              <div className="text-lg font-bold" data-testid="intercept-stat-conv">
                {(stats.conversion * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
