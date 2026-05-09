import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadStatusBadge, type LeadStatus } from "@/components/lead-status-badge";
import { formatDistanceToNow } from "date-fns";
import { Search, Inbox } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminLeadsPage,
});

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  created_at: string;
};

function AdminLeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id,name,email,phone,source,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const stats = useMemo(() => {
    const counts = { total: leads.length, new: 0, contacted: 0, converted: 0, lost: 0 };
    leads.forEach((l) => (counts[l.status] += 1));
    return counts;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Manage every inquiry from your website.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} tone="default" />
        <StatCard label="New" value={stats.new} tone="info" />
        <StatCard label="Contacted" value={stats.contacted} tone="warning" />
        <StatCard label="Converted" value={stats.converted} tone="success" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Loading leads…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No leads match your filters.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => (
                    <TableRow key={l.id} className="cursor-pointer hover:bg-accent/40">
                      <TableCell className="font-medium">
                        <Link
                          to="/admin/leads/$id"
                          params={{ id: l.id }}
                          className="block"
                        >
                          {l.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to="/admin/leads/$id" params={{ id: l.id }} className="block">
                          {l.email}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to="/admin/leads/$id" params={{ id: l.id }} className="block">
                          {l.source ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to="/admin/leads/$id" params={{ id: l.id }} className="block">
                          <LeadStatusBadge status={l.status} />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        <Link to="/admin/leads/$id" params={{ id: l.id }} className="block">
                          {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "info" | "warning" | "success";
}) {
  const toneMap = {
    default: "text-foreground",
    info: "text-info",
    warning: "text-warning-foreground",
    success: "text-success",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`mt-2 text-3xl font-semibold ${toneMap[tone]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
