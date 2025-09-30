import { env, type CRMEnvironment } from "@/config/env";

type CrmCopy = {
  pageTitle: string;
  singular: string;
  plural: string;
  singularTitle: string;
  pluralTitle: string;
};

const CRM_COPY: Record<CRMEnvironment, CrmCopy> = {
  academy: {
    pageTitle: "Learners",
    singular: "learner",
    plural: "learners",
    singularTitle: "Learner",
    pluralTitle: "Learners",
  },
  rosa: {
    pageTitle: "Influencers",
    singular: "influencer",
    plural: "influencers",
    singularTitle: "Influencer",
    pluralTitle: "Influencers",
  },
  sales: {
    pageTitle: "Contacts",
    singular: "contact",
    plural: "contacts",
    singularTitle: "Contact",
    pluralTitle: "Contacts",
  },
  hr: {
    pageTitle: "Job Seeker",
    singular: "job seeker",
    plural: "job seekers",
    singularTitle: "Job Seeker",
    pluralTitle: "Job Seekers",
  },
};

export function getCrmCopy(): CrmCopy {
  return CRM_COPY[env.CRM_ENVIRONMENT] ?? CRM_COPY.academy;
}

export type { CrmCopy };
