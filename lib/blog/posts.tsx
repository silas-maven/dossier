import type { ReactNode } from "react";

import { A, CalloutCard, H2, Lede, LI, P, UL } from "@/components/blog/article-parts";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  readingMinutes: number;
  tag: string;
  // Draft posts are excluded from the index, sitemap, and static params, and 404 if hit
  // directly. Flip to false (or remove) to publish.
  draft?: boolean;
  content: ReactNode;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "after-your-cv-land-the-interview",
    title: "You made a CV. Now what?",
    description:
      "Applications per role are surging, AI flooded the funnel, and a spreadsheet cannot keep up. Why a candidate-side ATS now matters more than another CV tweak.",
    date: "2026-06-09",
    readingMinutes: 6,
    tag: "Job search",
    content: (
      <>
        <Lede>
          You just built a CV that actually looks the part. Here is the uncomfortable truth: that was the
          easy part. What happens after you hit apply is where most job searches quietly fall apart, and the
          rules changed while no one was looking.
        </Lede>

        <H2>The market shifted under your feet</H2>
        <P>
          A few years ago, a serious search meant ten to twenty carefully targeted applications over a month.
          Today the numbers look nothing like that.
        </P>
        <P>
          UK recruitment data shows average applications per role climbing into the 40 to 50 range. One Q4
          2024 report found job postings down 13% quarter on quarter while applications rose 27%, pushing the
          average to 47 applicants per job. A separate UK platform recorded 48.7 applications per vacancy in
          November 2024, a 286% jump year on year, with total applications up 64% even as postings fell 43%.
        </P>
        <P>
          It is not only a UK story. Greenhouse reports that some recruiters now receive up to 400% more
          applications than a few years ago, and LinkedIn says people in the US and UK are applying to roughly
          15% more roles than a year earlier, with the platform handling tens of thousands of applications
          every minute.
        </P>

        <H2>AI poured fuel on the fire</H2>
        <P>
          The reason is no mystery. Generative AI has collapsed the time it takes to apply. Candidates report
          dropping from about 30 minutes per application to roughly 10, using browser tools that autofill
          forms, rewrite cover letters, and repurpose profile data on the fly.
        </P>
        <P>
          More than half of job seekers now use AI somewhere in their search. The Capterra 2024 survey put it
          at 58%, with 26% using AI specifically to apply en masse. Some services go further and auto-apply on
          your behalf: point them at a profile and they scan boards, match roles, and submit tailored
          applications at scale.
        </P>
        <P>
          The bottleneck has moved. It used to be the time it took to apply. Now it is your ability to
          prioritise and keep track of a flood of outgoing applications, and everything that comes back.
        </P>

        <H2>Why your spreadsheet just broke</H2>
        <P>
          When an active search means 10 to 15 applications a day and 50 to 100 a week, a spreadsheet, a
          folder of emails, and your memory stop coping. The failure modes are predictable, and expensive:
        </P>
        <UL>
          <LI>Applying to the same role twice across different boards.</LI>
          <LI>Forgetting which CV version you sent, so you cannot speak to it later.</LI>
          <LI>
            Getting a recruiter call three weeks on with no idea what the role was or why it interested you.
          </LI>
          <LI>Missing the follow-up window entirely.</LI>
        </UL>
        <P>
          In a market where recruiters are already swamped and leaning on automated filters, sounding generic
          on a call or missing a follow-up is often the difference between progressing and being silently
          dropped. The cost is not just disorganisation. It is winnable opportunities lost to it.
        </P>

        <H2>The answer is a candidate-side ATS</H2>
        <P>
          Here is the asymmetry worth sitting with. Every company you apply to runs an applicant tracking
          system: a structured pipeline, full of data, that tells them exactly where each candidate stands.
          You have been showing up to that with a notebook.
        </P>
        <P>
          A smart job application management system closes that gap. It is the same discipline recruiters use,
          pointed back in your favour. Done well, it gives you:
        </P>
        <UL>
          <LI>
            Capture of every job the moment you apply, with the role, company, salary, source, and the exact
            CV version attached.
          </LI>
          <LI>
            A pipeline view, from saved to applied to interviewing to offer, so you can see what is live and
            where it is stuck.
          </LI>
          <LI>Duplicate detection, reminders, and follow-up nudges so nothing slips.</LI>
          <LI>
            Real analysis of how strong each application is, and structured interview practice, instead of
            guesswork.
          </LI>
        </UL>

        <H2>Where Trackr Pro fits</H2>
        <P>
          <A href="https://trackr-pro.com">Trackr Pro</A> is built as exactly this: a candidate-side ATS for
          the modern search. It captures the role, company, salary, recruiter, and CV version the moment you
          click apply, turning every later email, call, and interview into a prepared conversation rather than
          a memory test.
        </P>
        <P>A few things set it apart from a tidier spreadsheet:</P>
        <UL>
          <LI>
            <strong className="text-white">One-click capture from the browser.</strong> Save any job from 20+
            boards and ATS platforms, including LinkedIn, Indeed, Greenhouse, Ashby, Workday, Lever,
            Wellfound, Otta, and Y Combinator, straight from the page.
          </LI>
          <LI>
            <strong className="text-white">Application strength, not a keyword match.</strong> Trackr reads
            your CV against the specific job and shows how strong the application really is, so you spend
            effort where you are genuinely competitive instead of spraying and hoping.
          </LI>
          <LI>
            <strong className="text-white">Live and mock interviews.</strong> Once you are in a process,
            rehearse with live and mock interviews built around the role and get structured feedback that
            compounds into a personal interview playbook across every application.
          </LI>
          <LI>
            <strong className="text-white">Private by design.</strong> Personal details are redacted before
            anything reaches an AI model, and your data stays yours.
          </LI>
        </UL>

        <H2>Why this matters now</H2>
        <P>
          Three forces have converged: a softer labour market, AI driving application volume up, and AI
          driving screening on the other side. Candidates who keep operating on ad-hoc tracking and generic
          materials are getting crowded out by those who bring structure, analysis, and preparation.
        </P>
        <P>
          No tool can promise you an interview, and you should be wary of any that does. What a candidate-side
          ATS does is stop you losing winnable roles to disorganisation, and help you compete on fit and
          preparation rather than sheer volume. For a serious search in 2026, that has stopped being a
          nice-to-have.
        </P>

        <CalloutCard
          title="Run your search like the other side does"
          body="Trackr Pro captures every application, reads its strength against the role, and preps you for the interview. Private by design, one click from the browser."
          cta="Explore Trackr Pro"
          href="https://trackr-pro.com"
        />
      </>
    )
  }
];

export const publishedBlogPosts = () =>
  blogPosts.filter((post) => !post.draft).sort((a, b) => b.date.localeCompare(a.date));

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);

export const formatBlogDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
