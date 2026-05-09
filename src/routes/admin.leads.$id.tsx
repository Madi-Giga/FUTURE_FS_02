import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatusBadge, type LeadStatus } from "@/components/lead-status-badge";
import { ArrowLeft, Mail, Phone, Globe, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/leads/$id")({
  component: LeadDetailPage,
});

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};

type Note = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
};

function LeadDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [noteBody, setNoteBody] = useState("");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Lead;
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["lead-notes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_notes")
        .select("id,body,created_at,author_id")
        .eq("lead_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: LeadStatus) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const body = noteBody.trim();
      if (!body) throw new Error("Note cannot be empty");
      if (body.length > 2000) throw new Error("Note too long");
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("lead_notes")
        .insert({ lead_id: id, author_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      setNoteBody("");
      toast.success("Note added");
      qc.invalidateQueries({ queryKey: ["lead-notes", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteLead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead deleted");
      qc.invalidateQueries({ queryKey: ["leads"] });
      navigate({ to: "/admin" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !lead) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link to="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to leads
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the lead and all notes. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteLead.mutate()}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">{lead.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Received {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                </div>
                <LeadStatusBadge status={lead.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Mail} label="Email">
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                  {lead.email}
                </a>
              </InfoRow>
              {lead.phone && (
                <InfoRow icon={Phone} label="Phone">
                  <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                    {lead.phone}
                  </a>
                </InfoRow>
              )}
              {lead.source && (
                <InfoRow icon={Globe} label="Source">
                  {lead.source}
                </InfoRow>
              )}
              {lead.message && (
                <div className="rounded-md border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{lead.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Follow-up notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  rows={3}
                  placeholder="Add a follow-up note…"
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => addNote.mutate()}
                    disabled={addNote.isPending || !noteBody.trim()}
                    size="sm"
                  >
                    {addNote.isPending ? "Saving…" : "Add note"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No notes yet. Add the first follow-up above.
                  </p>
                ) : (
                  notes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-md border border-border bg-card p-4"
                    >
                      <p className="whitespace-pre-wrap text-sm">{n.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {format(new Date(n.created_at), "PPp")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={lead.status}
                onValueChange={(v) => updateStatus.mutate(v as LeadStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-3 text-xs text-muted-foreground">
                Last updated {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}
