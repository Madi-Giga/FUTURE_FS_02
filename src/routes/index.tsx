import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Users, Activity, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadFlow CRM — Capture leads from your website" },
      {
        name: "description",
        content:
          "Submit your inquiry and our team will get back to you. Built-in CRM to track every lead.",
      },
    ],
  }),
  component: HomePage,
});

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <ContactSection />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
            L
          </div>
          <span className="font-semibold tracking-tight">LeadFlow</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Admin login
          </Link>
          <a
            href="#contact"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get in touch
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Trusted by growing teams
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Turn website visitors into clients.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          LeadFlow captures every inquiry from your website and gives your team a clean
          dashboard to qualify, follow up, and convert leads — fast.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#contact">
            <Button size="lg">
              Submit a lead <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </a>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Open dashboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Users,
      title: "Centralized leads",
      desc: "Every contact-form submission lands in one searchable inbox.",
    },
    {
      icon: Activity,
      title: "Status pipeline",
      desc: "Move leads from new → contacted → converted with one click.",
    },
    {
      icon: FileText,
      title: "Notes & follow-ups",
      desc: "Keep a timeline of conversations on every lead.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="border-border">
            <CardContent className="p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="border-t border-border bg-accent/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tell us about your project</h2>
          <p className="mt-3 text-muted-foreground">
            Drop your details below — we'll review and reach out within one business day.
            Your submission is logged in our CRM and assigned for follow-up.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "No spam. We only use your info to respond to your inquiry.",
              "Fast response — typically within hours.",
              "Track conversations end-to-end inside our CRM.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Contact us</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Website",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      source: parsed.data.source || null,
      message: parsed.data.message || null,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Try again.");
      console.error(error);
      return;
    }
    toast.success("Thanks! We'll be in touch soon.");
    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", source: "Website", message: "" });
  }

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 text-lg font-semibold">Submission received</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll respond shortly. Want to send another?
        </p>
        <Button className="mt-4" variant="outline" onClick={() => setSubmitted(false)}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Source</Label>
          <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Website", "Referral", "Google", "Social", "Other"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea
          id="message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit inquiry"}
      </Button>
    </form>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} LeadFlow CRM</p>
        <Link to="/login" className="hover:text-foreground">
          Admin login
        </Link>
      </div>
    </footer>
  );
}
